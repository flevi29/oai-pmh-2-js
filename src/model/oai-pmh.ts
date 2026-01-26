import type { SafeOmit } from "./util.ts";

/** Options available for harvesting operations (ListRecords, ListIdentifiers). */
export type ListOptions = {
  /** An optional lower bound for datestamp-based selective harvesting. */
  from?: string;
  /** An optional upper bound for datestamp-based selective harvesting. */
  until?: string;
  /** An optional setSpec for set-based selective harvesting. */
  set?: string;
  /**
   * The metadata prefix of the format that should be included in the metadata
   * part of the returned records.
   */
  metadataPrefix: string;
};

/** URL search parameters in the form of string key value pairs. */
export type URLSearchParamsRecord = Record<string, string>;

/**
 * {@link RequestInit} without {@link RequestInit.body} and
 * {@link RequestInit.method} properties.
 */
export type ExtraRequestInit = SafeOmit<RequestInit, "body" | "method">;

/** Same as {@link ExtraRequestInit} but without {@link ExtraRequestInit.signal}. */
export type BaseRequestInit = SafeOmit<ExtraRequestInit, "signal">;

/**
 * Same as {@link BaseRequestInit} but with its headers property forced as a
 * {@link Headers} object.
 */
export type HttpRequestsRequestInit = SafeOmit<BaseRequestInit, "headers"> & {
  headers: Headers;
};

/** Main options of a request. */
export type MainRequestOptions = {
  /** The search parameters of the URL. */
  params: URLSearchParamsRecord;
  /**
   * Pass {@link MainRequestOptions.params} through the body of requests via POST
   * method.
   *
   * Read more
   * {@link https://www.openarchives.org/OAI/openarchivesprotocol.html#HTTPRequestFormat | here}.
   */
  usePost?: boolean;
  /**
   * An extra, more limited {@link RequestInit}, that may override some of the
   * options.
   */
  init?: ExtraRequestInit;
};

/** HTTP request options overrides. */
export type ReqOpt = Omit<MainRequestOptions, "params">;

/**
 * A function that allows modifying parameters before they're sent off to the
 * request function.
 */
export type CustomRequestParams = (
  ...params: Parameters<typeof fetch>
) => Parameters<typeof fetch>;

/**
 * An object in which `success` boolean indicates whether the response was
 * successful (status 200-299), `value` is the response body as text or a string
 * describing the error in case there is no text response body and `details` is
 * any details about the error on failure.
 */
export type CustomRequestFnResult =
  | { success: true; value: string }
  | {
      success: false;
      value: string;
      details: unknown;
    };

/**
 * A custom request function, that is called instead of
 * {@link https://developer.mozilla.org/en-US/docs/Web/API/Window/fetch | fetch}
 * on web requests.
 */
export type CustomRequestFn = (
  ...args: Parameters<typeof fetch>
) => Promise<CustomRequestFnResult>;

/** Configuration options for creating an OaiPmh client instance. */
export type OaiPmhRequestConstructorOptions = {
  /** The base URL of the OAI-PMH repository. */
  baseUrl: string;
  /** Optional initialization settings for the HTTP requests (headers, etc). */
  init?: BaseRequestInit;
  /** Whether to use HTTP POST for requests instead of GET. Defaults to false. */
  usePost?: boolean;
  /**
   * A DOMParser implementation (required in environments like Node.js where
   * DOMParser is not global).
   */
  domParser?: typeof DOMParser;
  /** A hook to modify fetch parameters before the request is made. */
  paramsFn?: CustomRequestParams;
  /** A custom fetch implementation to replace standard fetch. */
  requestFn?: CustomRequestFn;
  /** Timeout in milliseconds for each HTTP request. */
  timeout?: number;
};
