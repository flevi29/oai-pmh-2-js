import type { OaiPmhErrorCode } from "#model/oai-pmh-stuff";
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
      "OAI-PMH provider returned error(s):\n" +
        cause.errors
          .map(
            (v) =>
              `${v.code}: ${v.text || "<error code has no accompanying description>"}`,
          )
          .join("\n"),
    );

    this.cause = cause;
  }
}
