import pkg from "../package.json" with { type: "json" };
import { OaiPmhRequestInitError } from "./error/request-init-error.ts";
import { OaiPmhRequestTimeOutError } from "./error/request-timeout-error.ts";
import { OaiPmhRequestError } from "./error/request-error.ts";
import type {
  CustomRequestFn,
  HttpRequestsRequestInit,
  MainRequestOptions,
  OaiPmhRequestConstructorOptions,
  URLSearchParamsRecord,
} from "./model/oai-pmh.ts";

/** Append a set of key value pairs to a {@link URLSearchParams} object. */
function appendRecordToURLSearchParams(
  searchParams: URLSearchParams,
  record: URLSearchParamsRecord,
): void {
  for (const [key, val] of Object.entries(record)) {
    if (val != null) {
      searchParams.set(key, val);
    }
  }
}

/**
 * Creates a new Headers object from a {@link HeadersInit} and adds various
 * properties to it, some from {@link Config}.
 *
 * @returns A new Headers object
 */
function getHeaders(headersInit?: HeadersInit): Headers {
  const headers = new Headers(headersInit);

  const accept = "Accept";
  if (!headers.has(accept)) {
    headers.set(accept, "application/xml");
  }

  const userAgent = "User-Agent";
  if (!headers.has(userAgent)) {
    headers.set(userAgent, `${pkg.name}/${pkg.version}`);
  }

  const acceptEncoding = "Accept-Encoding";
  if (!headers.has(acceptEncoding)) {
    headers.set(acceptEncoding, "gzip,deflate,br,zstd,identity;q=1.0");
  }

  return headers;
}

/** Used to identify whether an error is a timeout error after fetch request. */
const TIMEOUT_ID = Symbol("<timeout>");

/**
 * Attach a timeout signal to a {@link RequestInit}, while preserving original
 * signal functionality, if there is one.
 *
 * @remarks
 * This could be a short few straight forward lines using {@link AbortSignal.any}
 * and {@link AbortSignal.timeout}, but these aren't yet widely supported enough,
 * nor polyfill -able, at the time of writing.
 * @returns A new function which starts the timeout, which then returns another
 *   function that clears the timeout
 */
function getTimeoutFn(
  requestInit: RequestInit,
  ms: number,
): () => (() => void) | void {
  const { signal } = requestInit;
  const ac = new AbortController();

  if (signal != null) {
    let acSignalFn: (() => void) | null = null;

    if (signal.aborted) {
      ac.abort(signal.reason);
    } else {
      const fn = () => ac.abort(signal.reason);

      signal.addEventListener("abort", fn, { once: true });

      acSignalFn = () => signal.removeEventListener("abort", fn);
      ac.signal.addEventListener("abort", acSignalFn, { once: true });
    }

    return () => {
      if (signal.aborted) {
        return;
      }

      const to = setTimeout(() => ac.abort(TIMEOUT_ID), ms);
      const fn = () => {
        clearTimeout(to);

        if (acSignalFn !== null) {
          ac.signal.removeEventListener("abort", acSignalFn);
        }
      };

      signal.addEventListener("abort", fn, { once: true });

      return () => {
        signal.removeEventListener("abort", fn);
        fn();
      };
    };
  }

  requestInit.signal = ac.signal;

  return () => {
    const to = setTimeout(() => ac.abort(TIMEOUT_ID), ms);
    return () => clearTimeout(to);
  };
}

export class WebRequest {
  readonly #baseUrl: URL;
  readonly #init: HttpRequestsRequestInit;
  readonly #usePost: boolean;
  readonly #requestFn?: CustomRequestFn;
  readonly #timeout?: number;

  constructor(options: OaiPmhRequestConstructorOptions) {
    let baseUrl = options.baseUrl;
    if (!baseUrl.endsWith("/")) {
      baseUrl += "/";
    }

    try {
      this.#baseUrl = new URL(baseUrl);
    } catch (error) {
      throw new Error("The provided base URL is not valid", {
        cause: error,
      });
    }

    this.#init = {
      ...options.init,
      headers: getHeaders(options.init?.headers),
    };

    this.#usePost = options.usePost ?? false;

    this.#requestFn = options.requestFn;
    this.#timeout = options.timeout;
  }

  /**
   * Combines provided extra {@link RequestInit} headers, provided content type
   * and class instance RequestInit headers, prioritizing them in this order.
   *
   * @returns A new Headers object or the main headers of this class if no
   *   headers are provided
   */
  #getHeaders(extraHeaders?: HeadersInit, postContentLength?: number): Headers {
    if (extraHeaders === undefined && postContentLength === undefined) {
      return this.#init.headers;
    }

    const headers = new Headers({
      ...Object.fromEntries(this.#init.headers.entries()),
      ...Object.fromEntries(new Headers(extraHeaders).entries()),
    });

    if (postContentLength !== undefined) {
      headers.set("Content-Type", "x-www-form-urlencoded");
      headers.set("Content-Length", postContentLength.toString());
    }

    return headers;
  }

  async request({
    params,
    post = this.#usePost,
    init: extraInit,
  }: MainRequestOptions): Promise<string> {
    const url = new URL(this.#baseUrl);

    const init: RequestInit = {
      ...this.#init,
      ...extraInit,
    };

    if (post) {
      init.method = "POST";
      init.body = new URLSearchParams(params).toString();
      init.headers = this.#getHeaders(extraInit?.headers, init.body.length);
    } else {
      appendRecordToURLSearchParams(url.searchParams, params);
      init.headers = this.#getHeaders(extraInit?.headers);
    }

    const startTimeout =
      this.#timeout !== undefined ? getTimeoutFn(init, this.#timeout) : null;

    const stopTimeout = startTimeout?.();

    let response: Response;
    let responseBody: string;

    try {
      if (this.#requestFn !== undefined) {
        // when using custom HTTP client, response is handled differently
        const resp = await this.#requestFn(url, init);

        if (!resp.success) {
          throw new OaiPmhRequestError(resp.value, resp.details);
        }

        return resp.value;
      }

      response = await fetch(url, init);
      responseBody = await response.text();
    } catch (error) {
      throw new OaiPmhRequestInitError(
        url.toString(),
        Object.is(error, TIMEOUT_ID)
          ? new OaiPmhRequestTimeOutError(this.#timeout!, init)
          : error,
      );
    } finally {
      stopTimeout?.();
    }

    if (!response.ok) {
      throw new OaiPmhRequestError(responseBody, response);
    }

    return responseBody;
  }
}
