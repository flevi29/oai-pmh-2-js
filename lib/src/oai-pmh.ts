import type {
  ListContinuationParams,
  ListOptions,
  ListOptionsWithVerb,
  OaiPmhRequestConstructorOptions,
  ReqOpt,
} from "#model/oai-pmh";
import type {
  ListResponse,
  OaiPmhHeader,
  OaiPmhIdentify,
  OaiPmhMetadataFormat,
  OaiPmhRecord,
  OaiPmhSet,
} from "#model/oai-pmh-stuff";
import { WebRequest } from "./web-request.ts";
import { OaiPmhParser } from "./parser/oai-pmh-parser.ts";

export class OaiPmh {
  readonly #webRequest: WebRequest;
  readonly #parser: OaiPmhParser;

  constructor(options: OaiPmhRequestConstructorOptions) {
    this.#webRequest = new WebRequest(options);
    this.#parser = new OaiPmhParser(options.domParser ?? DOMParser);
  }

  async identify(options?: ReqOpt): Promise<OaiPmhIdentify> {
    const xml = await this.#webRequest.request({
      params: { verb: "Identify" },
      ...options,
    });
    return this.#parser.parseIdentify(xml);
  }

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
    parseListCallback: (xml: string) => ListResponse<T>,
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

  listSets(options?: ReqOpt): AsyncGenerator<OaiPmhSet[], void> {
    return this.#list(
      this.#parser.parseListSets,
      { verb: "ListSets" },
      options,
    );
  }
}
