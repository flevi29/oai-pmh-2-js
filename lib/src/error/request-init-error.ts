import { OaiPmhError } from "./error.js";

export class OaiPmhRequestInitError extends OaiPmhError {
  override name = "OaiPmhRequestInitError";

  constructor(url: string, cause: unknown) {
    super(`request to ${url} has failed`, { cause });
  }
}
