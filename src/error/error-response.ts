import { OaiPmhError } from "./error.ts";

/**
 * Standard OAI-PMH error codes as defined in the specification.
 *
 * @see {@link https://www.openarchives.org/OAI/openarchivesprotocol.html#ErrorConditions}
 */
export type OaiPmhErrorCode =
  | "badArgument"
  | "badResumptionToken"
  | "badVerb"
  | "cannotDisseminateFormat"
  | "idDoesNotExist"
  | "noRecordsMatch"
  | "noMetadataFormats"
  | "noSetHierarchy";

/**
 * OAI-PMH error, with its `code` and optional `text` description.
 * {@linkcode OaiPmhResponseErrorCause} may hold an array of these.
 */
export type OaiPmhResponseErrorData = { code: OaiPmhErrorCode; text?: string };

/**
 * The fully deserialized and transformed response in case an OAI-PMH repository
 * returns an error.
 *
 * @see {@link https://www.openarchives.org/OAI/openarchivesprotocol.html#ErrorConditions}
 */
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

/** Holds OAI-PMH error response. */
export class OaiPmhErrorResponse extends OaiPmhError {
  /** The deserialized form of the error response. */
  override cause: OaiPmhResponseErrorCause;

  constructor(cause: OaiPmhResponseErrorCause) {
    super(
      "OAI-PMH provider returned error(s):\n" +
        cause.errors
          .map(
            (v) =>
              `${v.code}: ${
                v.text || "<error code has no accompanying description>"
              }`,
          )
          .join("\n"),
    );

    this.name = "OaiPmhErrorResponse";
    this.cause = cause;
  }
}
