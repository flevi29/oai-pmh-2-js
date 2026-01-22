import { OaiPmhError } from "./error.ts";

/** Error thrown when a HTTP request times out. */
export class OaiPmhRequestTimeOutError extends OaiPmhError {
  /**
   * Holds the timeout in ms and the request parameters that this timeout was
   * reached with.
   */
  override cause: { timeout: number; init: RequestInit };

  constructor(timeout: number, init: RequestInit) {
    super(`request timed out after ${timeout}ms`);
    this.name = "OaiPmhRequestTimeOutError";
    this.cause = { timeout, init };
  }
}
