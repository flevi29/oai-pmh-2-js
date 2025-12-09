export { OaiPmh } from "./oai-pmh.ts";

export {
  OaiPmhResponseError,
  type OaiPmhResponseErrorCause,
  type OaiPmhResponseErrorData,
} from "./error/response-error.ts";
export { OaiPmhRequestError as UnexpectedStatusCodeError } from "./error/request-error.ts";
export { OaiPmhValidationError as ValidationError } from "./error/validation-error.ts";

export type {
  ListOptions,
  OaiPmhRequestConstructorOptions,
} from "./model/oai-pmh.ts";

export type {
  OaiPmhErrorCode,
  OaiPmhMetadataFormat,
  OaiPmhRecord,
  OaiPmhHeader,
  OaiPmhIdentify,
  OaiPmhSet,
} from "./model/oai-pmh-stuff.ts";

export type {
  ParsedXMLAttributes,
  ParsedXMLAttributeValue,
  ParsedXMLElement,
  ParsedXMLRecord,
} from "./model/xml.ts";
