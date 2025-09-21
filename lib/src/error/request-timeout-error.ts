import { OaiPmhError } from "./error.ts";

/** Error thrown when a HTTP request times out. */
export class OaiPmhRequestTimeOutError extends OaiPmhError {
  override name = "OaiPmhRequestTimeOutError";
  override cause: { timeout: number; init: RequestInit };

  constructor(timeout: number, init: RequestInit) {
    super(`request timed out after ${timeout}ms`);
    this.cause = { timeout, init };
  }
}
