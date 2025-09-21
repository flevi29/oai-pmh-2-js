import type { OaiPmhErrorCode } from "../model/oai-pmh-stuff.ts";
import { OaiPmhError } from "./error.ts";

export type OaiPmhResponseErrorData = { code: OaiPmhErrorCode; text?: string };
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
