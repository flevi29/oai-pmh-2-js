import type { OaiPmhResponseErrorCause } from "#model/oai-pmh-stuff";
import { OaiPmhError } from "./error.ts";

/** Holds OAI-PMH error response. */
export class OaiPmhResponseError extends OaiPmhError {
  /** The deserialized form of the error response. */
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

    this.name = "OaiPmhResponseError";
    this.cause = cause;
  }
}
