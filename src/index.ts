/**
 * ## {@link https://www.openarchives.org/OAI/openarchivesprotocol.html | OAI-PMH Version 2.0} API ECMAScript client
 *
 * This module provides a client to interact with OAI-PMH 2.0 compliant
 * repositories. It supports all standard OAI-PMH verbs and handles pagination
 * (resumption tokens) automatically via async generators.
 *
 * ### Example
 *
 * ```ts
 * const oaiPmh = new OaiPmh({ baseUrl: "" });
 *
 * // get blabla
 * const info = await oai.identify();
 *
 * // list blabla
 * for await (const records of oai.listRecords({
 *   metadataPrefix: "oai_dc",
 * })) {
 *   console.log(records);
 * }
 * ```
 *
 * @module
 */

export * from "./oai-pmh.ts";

export * from "./error/error-response.ts";
export * from "./error/error.ts";
export * from "./error/request-error.ts";
export * from "./error/request-init-error.ts";
export * from "./error/request-timeout-error.ts";
export * from "./error/validation-error.ts";

export type * from "./http-request-model.ts";

export type { OaiPmhParserParameters } from "./parser/oai-pmh-parser.ts";
export type * from "./parser/model/header.ts";
export type * from "./parser/model/identify.ts";
export type * from "./parser/model/metadata-format.ts";
export type * from "./parser/model/record.ts";
export type * from "./parser/model/set.ts";
export type * from "./parser/model/xml.ts";
