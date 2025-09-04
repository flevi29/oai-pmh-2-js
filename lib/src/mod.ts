export { OaiPmh } from "./oai-pmh.js";

export {
  OaiPmhResponseError,
  type OaiPmhResponseErrorCause,
  type OaiPmhResponseErrorData,
} from "./error/response-error.js";
export { OaiPmhRequestError as UnexpectedStatusCodeError } from "./error/request-error.js";
export { OaiPmhValidationError as ValidationError } from "./error/validation-error.js";

export type {
  ListOptions,
  OaiPmhRequestConstructorOptions,
} from "./model/oai-pmh.js";

export type { OaiPmhErrorCode } from "./model/parser/error.js";
export type { OaiPmhMetadataFormat } from "./model/parser/metadata_format.js";
export type { OaiPmhRecord } from "./model/parser/record.js";
export type { OaiPmhHeader } from "./model/parser/header.js";
export type { OaiPmhIdentify } from "./model/parser/identify.js";
export type { OaiPmhSet } from "./model/parser/set.js";
export type {
  ParsedXMLAttributes,
  ParsedXMLAttributeValue,
  ParsedXMLElement,
  ParsedXMLRecord,
} from "./model/parser/xml.js";
