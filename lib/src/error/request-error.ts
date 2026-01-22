import { OaiPmhError } from "./error.ts";

const TRIM_IDX = 250;

function trimMessage(message: string): string {
  return message.length - 1 > TRIM_IDX
    ? message.slice(0, TRIM_IDX) + " ..."
    : message;
}

/**
 * Error thrown when the HTTP request completes but returns a non-success status
 * or a protocol error.
 */
export class OaiPmhRequestError extends OaiPmhError {
  /**
   * The full error message. {@linkcode OaiPmhRequestError.message} is a trimmed
   * version of this.
   */
  fullMessage: string;

  constructor(message: string, details: unknown) {
    super(message ? trimMessage(message) : "request returned an error");
    this.name = "OaiPmhRequestError";
    this.cause = details;
    this.fullMessage = message;
  }
}
