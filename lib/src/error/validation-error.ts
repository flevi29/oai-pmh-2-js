import { OaiPmhError } from "./error.ts";

export class OaiPmhInnerValidationError extends OaiPmhError {
  override name = "OaiPmhInnerValidationError";

  constructor(xmlPath: string, message: string) {
    super(`${xmlPath}: ${message}`);
  }
}

export class OaiPmhValidationError extends OaiPmhError {
  override name = "OaiPmhValidationError";
  override cause: OaiPmhInnerValidationError;
  xml: string;

  constructor(error: OaiPmhInnerValidationError, xml: string) {
    super(error.message);
    this.cause = error;
    this.xml = xml;
  }
}
