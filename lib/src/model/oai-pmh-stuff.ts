import type { ParsedXMLElement } from "./xml.ts";

/**
 * Standard OAI-PMH error codes as defined in the specification.
 *
 * @see {@link https://www.openarchives.org/OAI/openarchivesprotocol.html#ErrorConditions}
 */
export type OaiPmhErrorCode =
  | "badArgument"
  | "badResumptionToken"
  | "badVerb"
  | "cannotDisseminateFormat"
  | "idDoesNotExist"
  | "noRecordsMatch"
  | "noMetadataFormats"
  | "noSetHierarchy";

/**
 * OAI-PMH error, with its `code` and optional `text` description.
 * {@linkcode OaiPmhResponseErrorCause} may hold an array of these.
 */
export type OaiPmhResponseErrorData = { code: OaiPmhErrorCode; text?: string };

/**
 * The fully deserialized and transformed response in case an OAI-PMH repository
 * returns an error.
 *
 * @see {@link https://www.openarchives.org/OAI/openarchivesprotocol.html#ErrorConditions}
 */
export type OaiPmhResponseErrorCause = {
  errors: OaiPmhResponseErrorData[];
  request: {
    value: string;
    attr?: {
      verb?: string;
      identifier?: string;
      metadataPrefix?: string;
      from?: string;
      until?: string;
      set?: string;
      resumptionToken?: string;
    };
  };
  responseDate: string;
};

/** Represents the definition of a metadata format available from the repository. */
export type OaiPmhMetadataFormat = {
  metadataPrefix: string;
  schema: string;
  metadataNamespace: string;
};

/** Information about the repository returned by the Identify verb. */
export type OaiPmhIdentify = {
  repositoryName: string;
  baseURL: string;
  protocolVersion: string;
  earliestDatestamp: string;
  deletedRecord: "no" | "transient" | "persistent";
  granularity: "YYYY-MM-DD" | "YYYY-MM-DDThh:mm:ssZ";
  adminEmail: string;
  compression?: string[];
  description?: ParsedXMLElement[];
};

/** The header of an OAI-PMH record, containing identifiers and datestamps. */
export type OaiPmhHeader = {
  isDeleted: boolean;
  identifier: string;
  datestamp: string;
  setSpec?: string[];
};

/** A complete OAI-PMH record, including header and metadata. */
export type OaiPmhRecord = {
  header: OaiPmhHeader;
  metadata?: NodeListOf<ChildNode>;
  about?: ParsedXMLElement[];
};

/** Represents a Set structure used for selective harvesting. */
export type OaiPmhSet = {
  setSpec: string;
  setName: string;
  setDescription?: ParsedXMLElement[];
};
