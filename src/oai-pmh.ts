import type {
  HttpRequestConstructorOptions,
  RequestOptions,
} from "./http-request-model.ts";
import { HttpRequest } from "./http-request.ts";
import {
  getOaiPmhParser,
  type OaiPmhParser,
  type OaiPmhParserParameters,
} from "./parser/oai-pmh-parser.ts";
import type { OaiPmhHeader } from "./parser/model/header.ts";
import type { OaiPmhIdentify } from "./parser/model/identify.ts";
import type { OaiPmhMetadataFormat } from "./parser/model/metadata-format.ts";
import type { OaiPmhRecord } from "./parser/model/record.ts";
import type { OaiPmhSet } from "./parser/model/set.ts";

import type { OaiPmhListResponse } from "./parser/resumption-token.ts";

/** Constructor options for {@linkcode OaiPmh}. */
export type OaiPmhConstructorOptions = OaiPmhParserParameters &
  HttpRequestConstructorOptions;

/** Options available for harvesting operations. */
export type ListOptions = {
  /**
   * An optional argument with a
   * {@link https://www.openarchives.org/OAI/openarchivesprotocol.html#Dates | UTCdatetime value},
   * which specifies a lower bound for datestamp-based
   * {@link https://www.openarchives.org/OAI/openarchivesprotocol.html#Datestamp | selective harvesting}.
   */
  from?: string;
  /**
   * An optional argument with a
   * {@link https://www.openarchives.org/OAI/openarchivesprotocol.html#Dates | UTCdatetime value},
   * which specifies a upper bound for datestamp-based
   * {@link https://www.openarchives.org/OAI/openarchivesprotocol.html#Datestamp | selective harvesting}.
   */
  until?: string;
  /**
   * An optional argument with a
   * {@link https://www.openarchives.org/OAI/openarchivesprotocol.html#Set | setSpec value},
   * which specifies
   * {@link https://www.openarchives.org/OAI/openarchivesprotocol.html#Set | set}
   * criteria for
   * {@link https://www.openarchives.org/OAI/openarchivesprotocol.html#SelectiveHarvestingandSets | selective harvesting}.
   */
  set?: string;
  /**
   * A required argument, which specifies that
   * {@link https://www.openarchives.org/OAI/openarchivesprotocol.html#header | headers}
   * should be returned only if the metadata format matching the supplied
   * {@link https://www.openarchives.org/OAI/openarchivesprotocol.html#metadataPrefix | metadataPrefix}
   * is available or, depending on the repository's support for
   * {@link https://www.openarchives.org/OAI/openarchivesprotocol.html#deletion | deletions},
   * has been deleted. The metadata formats supported by a repository and for a
   * particular item can be retrieved using the
   * {@link https://www.openarchives.org/OAI/openarchivesprotocol.html#ListMetadataFormats | ListMetadataFormats}
   * request.
   */
  metadataPrefix: string;
};

type ListVerbOptions = { verb: "ListIdentifiers" | "ListRecords" | "ListSets" };
type ListOptionsWithVerb = ListVerbOptions & Partial<ListOptions>;
type ListContinuationParams = ListVerbOptions & {
  resumptionToken: string;
};

/**
 * Main client for interacting with OAI-PMH repositories.
 *
 * This class abstracts the OAI-PMH verbs into methods. List operations
 * (ListRecords, ListIdentifiers, ListSets) are implemented as async generators
 * that automatically handle resumption tokens to fetch subsequent pages of
 * results.
 */
export class OaiPmh {
  readonly #webRequest: HttpRequest;
  readonly #parser: OaiPmhParser;

  constructor(options: OaiPmhConstructorOptions) {
    this.#webRequest = new HttpRequest(options);
    this.#parser = getOaiPmhParser(options);
  }

  /**
   * This verb is used to retrieve information about a repository. Some of the
   * information returned is required as part of the OAI-PMH. Repositories may
   * also employ the Identify verb to return additional descriptive
   * information.
   *
   * @see {@link https://www.openarchives.org/OAI/openarchivesprotocol.html#Identify}
   */
  async identify(options?: RequestOptions): Promise<OaiPmhIdentify> {
    const xml = await this.#webRequest.request({
      params: { verb: "Identify" },
      ...options,
    });
    return this.#parser.parseIdentify(xml);
  }

  /**
   * This verb is used to retrieve an individual metadata record from a
   * repository. Required arguments specify the identifier of the item from
   * which the record is requested and the format of the metadata that should be
   * included in the record. Depending on the level at which a repository tracks
   * {@link https://www.openarchives.org/OAI/openarchivesprotocol.html#deletion | deletions},
   * a header with a "deleted" value for the status attribute may be returned,
   * in case the metadata format specified by the metadataPrefix is no longer
   * available from the repository or from the specified item.
   *
   * @param identifier A required argument that specifies the
   *   {@link https://www.openarchives.org/OAI/openarchivesprotocol.html#UniqueIdentifier | unique identifier}
   *   of the item in the
   *   {@link https://www.openarchives.org/OAI/openarchivesprotocol.html#Repository | repository}
   *   from which the
   *   {@link https://www.openarchives.org/OAI/openarchivesprotocol.html#Record | record}
   *   must be disseminated.
   * @param metadataPrefix A required argument that specifies the
   *   {@link https://www.openarchives.org/OAI/openarchivesprotocol.html#metadataPrefix | metadataPrefix}
   *   of the format that should be included in the
   *   {@link https://www.openarchives.org/OAI/openarchivesprotocol.html#Record | metadata part of the returned record}.
   *   A record should only be returned if the format specified by the
   *   {@link https://www.openarchives.org/OAI/openarchivesprotocol.html#metadataPrefix | metadataPrefix}
   *   can be disseminated from the item identified by the value of the
   *   identifier argument. The metadata formats supported by a repository and
   *   for a particular record can be retrieved using the
   *   {@link https://www.openarchives.org/OAI/openarchivesprotocol.html#ListMetadataFormats | ListMetadataFormats}
   *   request.
   * @see {@link https://www.openarchives.org/OAI/openarchivesprotocol.html#GetRecord}
   */
  async getRecord(
    identifier: string,
    metadataPrefix: string,
    options?: RequestOptions,
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
    { init = {}, ...restOfOptions }: RequestOptions = {},
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
   * This verb is an abbreviated form of
   * {@link https://www.openarchives.org/OAI/openarchivesprotocol.html#ListRecords | ListRecords},
   * retrieving only
   * {@link https://www.openarchives.org/OAI/openarchivesprotocol.html#header | headers}
   * rather than
   * {@link https://www.openarchives.org/OAI/openarchivesprotocol.html#Record | records}.
   * Optional arguments permit selective harvesting of
   * {@link https://www.openarchives.org/OAI/openarchivesprotocol.html#header | headers}
   * based on
   * {@link https://www.openarchives.org/OAI/openarchivesprotocol.html#Set | set}
   * membership and/or datestamp. Depending on the repository's support for
   * {@link https://www.openarchives.org/OAI/openarchivesprotocol.html#deletion | deletions},
   * a returned
   * {@link https://www.openarchives.org/OAI/openarchivesprotocol.html#header | header}
   * may have a status attribute of "deleted" if a record matching the arguments
   * specified in the request has been deleted.
   *
   * @see {@link https://www.openarchives.org/OAI/openarchivesprotocol.html#ListIdentifiers}
   */
  listIdentifiers(
    listOptions: ListOptions,
    options?: RequestOptions,
  ): AsyncGenerator<OaiPmhHeader[], void> {
    return this.#list(
      this.#parser.parseListIdentifiers,
      { verb: "ListIdentifiers", ...listOptions },
      options,
    );
  }

  /**
   * This verb is used to retrieve the metadata formats available from a
   * repository. An optional argument restricts the request to the formats
   * available for a specific item.
   *
   * @param identifier An optional argument that specifies the unique identifier
   *   of the item for which available metadata formats are being requested. If
   *   this argument is omitted, then the response includes all metadata formats
   *   supported by this repository. Note that the fact that a metadata format
   *   is supported by a repository does not mean that it can be disseminated
   *   from all items in the repository.
   * @see {@link https://www.openarchives.org/OAI/openarchivesprotocol.html#ListMetadataFormats}
   */
  async listMetadataFormats(
    identifier?: string,
    options?: RequestOptions,
  ): Promise<OaiPmhMetadataFormat[]> {
    const verb = "ListMetadataFormats",
      xml = await this.#webRequest.request({
        params: identifier === undefined ? { verb } : { verb, identifier },
        ...options,
      });
    return this.#parser.parseListMetadataFormats(xml);
  }

  /**
   * This verb is used to harvest records from a repository. Optional arguments
   * permit
   * {@link https://www.openarchives.org/OAI/openarchivesprotocol.html#Datestamp | selective harvesting}
   * of
   * {@link https://www.openarchives.org/OAI/openarchivesprotocol.html#header | records}
   * based on
   * {@link https://www.openarchives.org/OAI/openarchivesprotocol.html#Set | set}
   * membership and/or datestamp. Depending on the repository's support for
   * {@link https://www.openarchives.org/OAI/openarchivesprotocol.html#deletion | deletions},
   * a returned
   * {@link https://www.openarchives.org/OAI/openarchivesprotocol.html#header | header}
   * may have a status attribute of "deleted" if a record matching the arguments
   * specified in the request has been deleted. No metadata will be present for
   * records with deleted status.
   *
   * @see {@link https://www.openarchives.org/OAI/openarchivesprotocol.html#ListRecords}
   */
  listRecords(
    listOptions: ListOptions,
    options?: RequestOptions,
  ): AsyncGenerator<OaiPmhRecord[], void> {
    return this.#list(
      this.#parser.parseListRecords,
      { verb: "ListRecords", ...listOptions },
      options,
    );
  }

  /**
   * This verb is used to retrieve the set structure of a repository, useful for
   * {@link https://www.openarchives.org/OAI/openarchivesprotocol.html#SelectiveHarvestingandSets | selective harvesting}.
   *
   * @see {@link https://www.openarchives.org/OAI/openarchivesprotocol.html#ListSets}
   */
  listSets(options?: RequestOptions): AsyncGenerator<OaiPmhSet[], void> {
    return this.#list(
      this.#parser.parseListSets,
      { verb: "ListSets" },
      options,
    );
  }
}
