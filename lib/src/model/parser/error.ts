import type { ParsedXMLElement, ParsedXMLRecord } from "./xml.js";
import { OaiPmhInnerValidationError } from "../../error/validation-error.js";
import { parseToRecordOrString } from "../../parser/xml_parser.js";
import { OaiPmhResponseError } from "../../error/response-error.js";
import { parseKeyAsText, parseKeyAsTextWithAttributes } from "./shared.js";

type OaiPmhErrorCode =
  | "badArgument"
  | "badResumptionToken"
  | "badVerb"
  | "cannotDisseminateFormat"
  | "idDoesNotExist"
  | "noRecordsMatch"
  | "noMetadataFormats"
  | "noSetHierarchy";

function isOaiPmhErrorCode(value: string): value is OaiPmhErrorCode {
  return (
    <OaiPmhErrorCode>value === "badArgument" ||
    <OaiPmhErrorCode>value === "badResumptionToken" ||
    <OaiPmhErrorCode>value === "badVerb" ||
    <OaiPmhErrorCode>value === "cannotDisseminateFormat" ||
    <OaiPmhErrorCode>value === "idDoesNotExist" ||
    <OaiPmhErrorCode>value === "noRecordsMatch" ||
    <OaiPmhErrorCode>value === "noMetadataFormats" ||
    <OaiPmhErrorCode>value === "noSetHierarchy"
  );
}

function validateAndGetOaiPmhErrorResponse(
  error: ParsedXMLElement[],
  parseResult: ParsedXMLRecord,
): OaiPmhResponseError {
  if (error.length === 0) {
    throw new OaiPmhInnerValidationError(
      "expected at least one of <OAI-PMH><error> node",
    );
  }

  // @TODO: This didn't have attributes
  const request = parseKeyAsTextWithAttributes(parseResult, "request");

  if (request instanceof Error) {
    throw new OaiPmhInnerValidationError(`todo`);
  }

  const responseDate = parseKeyAsText(parseResult, "responseDate");

  if (responseDate instanceof Error) {
    throw new OaiPmhInnerValidationError(`todo`);
  }

  const errors = error.map(({ value, attr }) => {
    const parsedValue =
      value === undefined ? value : parseToRecordOrString(value);

    if (parsedValue instanceof Error) {
      throw new OaiPmhInnerValidationError(
        `error parsing <OAI-PMH><error>: ${parsedValue.message}`,
      );
    }

    if (typeof parsedValue === "object" || attr === undefined) {
      throw new OaiPmhInnerValidationError(
        "expected all <OAI-PMH><error> nodes to either contain nothing or text, and to have attributes",
      );
    }

    const attrEntries = Object.entries(attr);
    if (attrEntries.length !== 1) {
      throw new OaiPmhInnerValidationError(
        "expected <OAI-PMH><error> to only have one attribute",
      );
    }

    const [attrKey, { value: attrVal }] = attrEntries[0]!;
    if (attrKey !== "code" || !isOaiPmhErrorCode(attrVal)) {
      throw new OaiPmhInnerValidationError(
        'expected <OAI-PMH><error> attribute key to be "code" and its value to be a valid OAI-PMH error code',
      );
    }

    return { code: attrVal, text: parsedValue };
  });

  return new OaiPmhResponseError({
    errors,
    request,
    responseDate,
  });
}

export { type OaiPmhErrorCode, validateAndGetOaiPmhErrorResponse };
