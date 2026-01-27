import type {
  ListOptions,
  OaiPmhRequestConstructorOptions,
  ReqOpt,
} from "./model/oai-pmh.ts";
import type {
  OaiPmhHeader,
  OaiPmhIdentify,
  OaiPmhMetadataFormat,
  OaiPmhRecord,
  OaiPmhSet,
} from "./model/oai-pmh-stuff.ts";
import type {
  ListContinuationParams,
  ListOptionsWithVerb,
  OaiPmhListResponse,
} from "./model/list.ts";
import { WebRequest } from "./web-request.ts";
import { getOaiPmhParser, type OaiPmhParser } from "./parser/oai-pmh-parser.ts";

function safeGetDOMParser(): typeof DOMParser {
  if (typeof DOMParser === "undefined") {
    throw new Error(
      "environment doesn't have DOMParser, please provide it via options",
    );
  }

  return DOMParser;
}

/**
 * Main client for interacting with OAI-PMH repositories.
 *
 * This class abstracts the OAI-PMH verbs into methods. List operations
 * (ListRecords, ListIdentifiers, ListSets) are implemented as async generators
 * that automatically handle resumption tokens to fetch subsequent pages of
 * results.
 *
 * Example:
 *
 * ```ts
 * const oai = new OaiPmh({ baseUrl: "http://example.org/oai" });
 * const info = await oai.identify();
 * for await (const records of oai.listRecords({
 *   metadataPrefix: "oai_dc",
 * })) {
 *   console.log(records);
 * }
 * ```
 */
export class OaiPmh {
  readonly #webRequest: WebRequest;
  readonly #parser: OaiPmhParser;

  /**
   * Creates a new OAI-PMH client.
   *
   * @param options - Configuration options including baseUrl, custom fetchers,
   *   and timeouts.
   */
  constructor(options: OaiPmhRequestConstructorOptions) {
    this.#webRequest = new WebRequest(options);
    this.#parser = getOaiPmhParser(options.domParser ?? safeGetDOMParser());
  }

  /**
   * Retrieves information about the repository. Use the Identify verb to
   * retrieve information about a repository.
   *
   * {@link https://www.openarchives.org/OAI/openarchivesprotocol.html#Identify}
   *
   * @param options - Optional request overrides.
   * @returns Identification information about the repository.
   */
  async identify(options?: ReqOpt): Promise<OaiPmhIdentify> {
    const xml = await this.#webRequest.request({
      params: { verb: "Identify" },
      ...options,
    });
    return this.#parser.parseIdentify(xml);
  }

  /**
   * Retrieves an individual metadata record from a repository.
   *
   * {@link https://www.openarchives.org/OAI/openarchivesprotocol.html#GetRecord}
   *
   * @param identifier - The unique OAI identifier of the record.
   * @param metadataPrefix - The metadata prefix identifying the metadata
   *   format.
   * @param options - Optional request overrides.
   * @returns The requested record.
   */
  async getRecord(
    identifier: string,
    metadataPrefix: string,
    options?: ReqOpt,
  ): Promise<OaiPmhRecord> {
    const xml = await this.#webRequest.request({
      params: {
        verb: "GetRecord",
        identifier,
        metadataPrefix,
      },
      ...options,
    });
    return this.#parser.parseGetRecord(xml);
  }

  // TODO: fetch combined with AbortController causes minor memory leak here
  //       but more importantly lots of annoying warnings
  //       (allegedly the leak is on all platforms)
  //       https://github.com/nodejs/undici/issues/939
  //       Potential fix for Node.js https://nodejs.org/api/util.html#utilabortedsignal-resource
  async *#list<T>(
    parseListCallback: (xml: string) => OaiPmhListResponse<T>,
    listOptions: ListOptionsWithVerb,
    { init = {}, ...restOfOptions }: ReqOpt = {},
  ): AsyncGenerator<T[], void> {
    const { verb } = listOptions;

    init.keepalive = true;

    let params: ListOptionsWithVerb | ListContinuationParams = listOptions;

    for (;;) {
      const xml = await this.#webRequest.request({
        params,
        init,
        ...restOfOptions,
      });

      const { records, resumptionToken } = parseListCallback(xml);

      yield records;

      if (resumptionToken === null) {
        break;
      }

      params = { verb, resumptionToken };
    }
  }

  /**
   * Retrieves a list of headers without metadata. This is used for selective
   * harvesting.
   *
   * {@link https://www.openarchives.org/OAI/openarchivesprotocol.html#ListIdentifiers}
   *
   * @param listOptions - Options for filtering (from, until, set) and
   *   metadataPrefix.
   * @param options - Optional request overrides.
   * @returns An async generator yielding arrays (pages) of headers.
   */
  listIdentifiers(
    listOptions: ListOptions,
    options?: ReqOpt,
  ): AsyncGenerator<OaiPmhHeader[], void> {
    return this.#list(
      this.#parser.parseListIdentifiers,
      { verb: "ListIdentifiers", ...listOptions },
      options,
    );
  }

  /**
   * Retrieves the available metadata formats from a repository.
   *
   * {@link https://www.openarchives.org/OAI/openarchivesprotocol.html#ListMetadataFormats}
   *
   * @param identifier - Optional OAI identifier. If provided, returns formats
   *   available for that specific item.
   * @param options - Optional request overrides.
   * @returns A list of available metadata formats.
   */
  async listMetadataFormats(
    identifier?: string,
    options?: ReqOpt,
  ): Promise<OaiPmhMetadataFormat[]> {
    const verb = "ListMetadataFormats",
      xml = await this.#webRequest.request({
        params: identifier === undefined ? { verb } : { verb, identifier },
        ...options,
      });
    return this.#parser.parseListMetadataFormats(xml);
  }

  /**
   * Retrieves records from a repository.
   *
   * {@link https://www.openarchives.org/OAI/openarchivesprotocol.html#ListRecords}
   *
   * @param listOptions - Options for filtering (from, until, set) and
   *   metadataPrefix.
   * @param options - Optional request overrides.
   * @returns An async generator yielding arrays (pages) of records.
   */
  listRecords(
    listOptions: ListOptions,
    options?: ReqOpt,
  ): AsyncGenerator<OaiPmhRecord[], void> {
    return this.#list(
      this.#parser.parseListRecords,
      { verb: "ListRecords", ...listOptions },
      options,
    );
  }

  /**
   * Retrieves the set structure of a repository.
   *
   * @param options - Optional request overrides.
   * @returns An async generator yielding arrays (pages) of sets.
   * @see {@link https://www.openarchives.org/OAI/openarchivesprotocol.html#ListSets}
   */
  listSets(options?: ReqOpt): AsyncGenerator<OaiPmhSet[], void> {
    return this.#list(
      this.#parser.parseListSets,
      { verb: "ListSets" },
      options,
    );
  }
}
