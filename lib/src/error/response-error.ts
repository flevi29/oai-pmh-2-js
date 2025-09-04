import type { OaiPmhErrorCode } from "../model/parser/error.js";
import type { TextNodeWithAttributes } from "../model/parser/shared.js";
import { OaiPmhError } from "./error.js";

export type OaiPmhResponseErrorData = { code: OaiPmhErrorCode; text?: string };
export type OaiPmhResponseErrorCause = {
  errors: OaiPmhResponseErrorData[];
  request: TextNodeWithAttributes;
  responseDate: string;
};

export class OaiPmhResponseError extends OaiPmhError {
  override name = "OaiPmhResponseError";
  override cause: OaiPmhResponseErrorCause;

  constructor(cause: OaiPmhResponseErrorCause) {
    super(
      "OAI-PMH provider returned error(s):" +
        cause.errors
          .map(
            (v) => `\n\t${v.code}${v.text !== undefined ? `: ${v.text}` : ""}`,
          )
          .join(""),
    );

    this.cause = cause;
  }
}
