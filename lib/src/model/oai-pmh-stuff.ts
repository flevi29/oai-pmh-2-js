import type { ParsedXMLElement } from "./xml.ts";

export type OaiPmhErrorCode =
  | "badArgument"
  | "badResumptionToken"
  | "badVerb"
  | "cannotDisseminateFormat"
  | "idDoesNotExist"
  | "noRecordsMatch"
  | "noMetadataFormats"
  | "noSetHierarchy";

export type OaiPmhMetadataFormat = {
  metadataPrefix: string;
  schema: string;
  metadataNamespace: string;
};

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

export type OaiPmhHeader = {
  isDeleted: boolean;
  identifier: string;
  datestamp: string;
  setSpec?: string[];
};

export type OaiPmhRecord = {
  header: OaiPmhHeader;
  metadata?: NodeListOf<ChildNode>;
  about?: ParsedXMLElement[];
};

export type OaiPmhSet = {
  setSpec: string;
  setName: string;
  setDescription?: ParsedXMLElement[];
};

export type ListResponse<T> = {
  records: T[];
  resumptionToken: string | null;
};
