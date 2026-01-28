import type { ParsedXMLElement } from "./xml.ts";

/**
 * Information about a repository. Some of the information is required as part
 * of the OAI-PMH. Repositories may also employ the Identify verb to return
 * additional descriptive information.
 */
export type OaiPmhIdentify = {
  /** A human readable name for the repository. */
  repositoryName: string;
  /**
   * The
   * {@link https://www.openarchives.org/OAI/openarchivesprotocol.html#HTTPRequestFormat | base URL}
   * of the repository.
   */
  baseURL: string;
  /** The version of the OAI-PMH supported by the repository. */
  protocolVersion: string;
  /**
   * A
   * {@link https://www.openarchives.org/OAI/openarchivesprotocol.html#Dates | UTCdatetime}
   * that is the guaranteed lower limit of all datestamps recording changes,
   * modifications, or deletions in the repository. A repository must not use
   * {@link https://www.openarchives.org/OAI/openarchivesprotocol.html#Datestamp | datestamps}
   * lower than the one specified by the content of the earliestDatestamp
   * element. earliestDatestamp must be expressed at the finest
   * {@link https://www.openarchives.org/OAI/openarchivesprotocol.html#Datestamp | granularity}
   * supported by the repository.
   */
  earliestDatestamp: string;
  /**
   * The manner in which the repository supports the notion of deleted records.
   *
   * @see {@link https://www.openarchives.org/OAI/openarchivesprotocol.html#DeletedRecords}
   */
  deletedRecord: "no" | "transient" | "persistent";
  /**
   * The finest
   * {@link https://www.openarchives.org/OAI/openarchivesprotocol.html#Datestamp | harvesting granularity}
   * supported by the repository.
   *
   * @see {@link http://www.w3.org/TR/NOTE-datetime}
   */
  granularity: "YYYY-MM-DD" | "YYYY-MM-DDThh:mm:ssZ";
  /** The e-mail address of an administrator of the repository. */
  adminEmail: string[];
  /**
   * A compression encoding supported by the repository. The recommended values
   * are those defined for the Content-Encoding header in Section 14.11 of
   * {@link http://www.ietf.org/rfc/rfc2616.txt | RFC 2616} describing HTTP 1.1.
   * A compression element should not be included for the identity encoding,
   * which is implied.
   */
  compression?: string[];
  /**
   * An extensible mechanism for communities to describe their repositories. For
   * example, the description container could be used to include
   * collection-level metadata in the response to the Identify request.
   * {@link http://www.openarchives.org/OAI/2.0/guidelines.htm | Implementation Guidelines}
   * are available to give directions with this respect. Each description
   * container must be accompanied by the URL of an XML schema describing the
   * structure of the description container.
   */
  description?: ParsedXMLElement[];
};
