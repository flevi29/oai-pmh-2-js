/** Base error class for OAI-PMH client errors. */
export class OaiPmhError extends Error {
  constructor(...params: ConstructorParameters<typeof Error>) {
    super(...params);
    this.name = "OaiPmhError";
  }
}
