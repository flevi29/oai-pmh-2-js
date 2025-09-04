import { OaiPmhError } from "./error.js";

function trimMessage(message: string): string {
  let newLnIdx: number | null = message.indexOf("\n");
  newLnIdx = newLnIdx === -1 ? null : newLnIdx;
  const idx = Math.min(50, newLnIdx ?? Infinity);
  return message.length < idx + 1
    ? message.substring(0, idx) + " ..."
    : message;
}

export class OaiPmhRequestError extends OaiPmhError {
  override name = "OaiPmhRequestError";
  override cause: {
    message: string;
    details: unknown;
  };

  constructor(message: string, details: unknown) {
    super(message ? trimMessage(message) : "request returned an error");
    this.cause = { message, details };
  }
}
