import { OaiPmhError } from "./error.ts";

/** Error thrown during the initialization of a request (e.g. invalid URL). */
export class OaiPmhRequestInitError extends OaiPmhError {
  constructor(url: string, cause: unknown) {
    super(`request to ${url} has failed`, { cause });
    this.name = "OaiPmhRequestInitError";
  }
}
