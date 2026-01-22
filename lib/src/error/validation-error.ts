import { OaiPmhError } from "./error.ts";

/**
 * Inner validation error, which is wrapped in the cause property of
 * {@linkcode OaiPmhValidationError}
 */
export class OaiPmhInnerValidationError extends OaiPmhError {
  constructor(xmlPath: string, message: string) {
    super(`${xmlPath}: ${message}`);
    this.name = "OaiPmhInnerValidationError";
  }
}

/** Holds validation information about parsed XML. */
export class OaiPmhValidationError extends OaiPmhError {
  /** The source of the validation error. */
  override cause: OaiPmhInnerValidationError;
  /** The full XML string that failed the validation. */
  xml: string;

  constructor(error: OaiPmhInnerValidationError, xml: string) {
    super(error.message);
    this.name = "OaiPmhValidationError";
    this.cause = error;
    this.xml = xml;
  }
}
