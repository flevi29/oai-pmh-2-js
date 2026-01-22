/**
 * {@link https://www.openarchives.org/OAI/openarchivesprotocol.html | OAI-PMH Version 2.0}
 * API ECMAScript client.
 *
 * This module provides a client to interact with OAI-PMH compliant
 * repositories. It supports all standard OAI-PMH verbs and handles pagination
 * (resumption tokens) automatically via async generators.
 *
 * @module
 */

export * from "./oai-pmh.ts";

export * from "#error/error";
export * from "#error/request-error";
export * from "#error/request-init-error";
export * from "#error/request-timeout-error";
export * from "#error/response-error";
export * from "#error/validation-error";

export type * from "#model/oai-pmh";
export type * from "#model/oai-pmh-stuff";
export type * from "#model/xml";
