import { OaiPmhError } from "./error.ts";

const TRIM_IDX = 250;

function trimMessage(message: string): string {
  return message.length - 1 > TRIM_IDX
    ? message.substring(0, TRIM_IDX) + " ..."
    : message;
}

export class OaiPmhRequestError extends OaiPmhError {
  override name = "OaiPmhRequestError";
  override cause: unknown;
  fullMessage: string;

  constructor(message: string, details: unknown) {
    super(message ? trimMessage(message) : "request returned an error");
    this.cause = details;
    this.fullMessage = message;
  }
}
