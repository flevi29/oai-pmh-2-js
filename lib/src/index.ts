export { OaiPmh } from "./oai-pmh.ts";

export {
  OaiPmhResponseError,
  type OaiPmhResponseErrorCause,
  type OaiPmhResponseErrorData,
} from "#error/response-error";
export { OaiPmhRequestError as UnexpectedStatusCodeError } from "#error/request-error";
export { OaiPmhValidationError as ValidationError } from "#error/validation-error";

export type {
  ListOptions,
  OaiPmhRequestConstructorOptions,
} from "#model/oai-pmh";

export type {
  OaiPmhErrorCode,
  OaiPmhMetadataFormat,
  OaiPmhRecord,
  OaiPmhHeader,
  OaiPmhIdentify,
  OaiPmhSet,
} from "#model/oai-pmh-stuff";

export type {
  ParsedXMLAttributes,
  ParsedXMLAttributeValue,
  ParsedXMLElement,
  ParsedXMLRecord,
} from "#model/xml";
