import { OaiPmhError } from "./error.js";

export class OaiPmhInnerValidationError extends OaiPmhError {
  override name = "OaiPmhInnerValidationError";
}

export class OaiPmhValidationError extends OaiPmhError {
  override name = "OaiPmhValidationError";
  override cause: OaiPmhInnerValidationError;
  xml: string;

  constructor(error: OaiPmhInnerValidationError, xml: string) {
    super(
      error.message +
        "\n(hint: inspect `xml` property for the whole XML document)",
    );
    this.cause = error;
    this.xml = xml;
  }
}
