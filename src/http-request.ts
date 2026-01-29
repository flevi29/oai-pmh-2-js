import { OaiPmhRequestInitError } from "./error/request-init-error.ts";
import { OaiPmhRequestTimeOutError } from "./error/request-timeout-error.ts";
import { OaiPmhRequestError } from "./error/request-error.ts";
import type {
  BaseRequestInit,
  CustomRequestFunction,
  CustomRequestParams,
  HttpRequestConstructorOptions,
  RequestOptions,
} from "./http-request-model.ts";

/** URL search parameters as a record of string values. */
type URLSearchParamsRecord = Record<string, string>;

/** Full options of a request. */
type RequestOptionsWithParams = RequestOptions & {
  /** The search parameters of the URL. */
  params: URLSearchParamsRecord;
};

type HttpRequestsRequestInit = Omit<BaseRequestInit, "headers"> & {
  headers: Headers;
};

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
 * Creates a new Headers object from a {@link HeadersInit} and adds the
 * appropriate `Accept` header.
 */
function getHeaders(headersInit?: HeadersInit): Headers {
  const headers = new Headers(headersInit);

  const accept = "Accept";
  if (!headers.has(accept)) {
    headers.set(accept, "application/xml");
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
 *   This could be a short few straight forward lines using {@link AbortSignal.any}
 *   and {@link AbortSignal.timeout}, but these aren't yet widely supported
 *   enough, nor polyfill -able, at the time of writing.
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

/**
 * Handles the low-level HTTP communication with the OAI-PMH repository. Manages
 * base URLs, headers, timeouts, and method selection (GET/POST).
 */
export class HttpRequest {
  readonly #baseUrl: URL;
  readonly #init: HttpRequestsRequestInit;
  readonly #usePost: boolean;
  readonly #paramsFn?: CustomRequestParams;
  readonly #requestFn?: CustomRequestFunction;
  readonly #timeout?: number;

  constructor(options: HttpRequestConstructorOptions) {
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

    this.#paramsFn = options.paramsFn;
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
  #getHeaders(extraHeaders?: HeadersInit): Headers {
    if (extraHeaders === undefined) {
      return this.#init.headers;
    }

    return new Headers([
      ...Array.from(this.#init.headers.entries()),
      ...Array.from(new Headers(extraHeaders).entries()),
    ]);
  }

  /**
   * Executes an HTTP request to the OAI-PMH repository.
   *
   * @param options - Configuration for the specific request including URL
   *   params and overrides.
   * @returns The raw text body of the response (usually XML).
   * @throws {OaiPmhRequestInitError} If the request setup fails or times out.
   * @throws {OaiPmhRequestError} If the server returns a failure status code.
   */
  async request({
    params,
    usePost: post = this.#usePost,
    init: extraInit,
  }: RequestOptionsWithParams): Promise<string> {
    const url = new URL(this.#baseUrl);

    const init: RequestInit = {
      ...this.#init,
      ...extraInit,
    };

    if (post) {
      init.method = "POST";
      init.body = new URLSearchParams(params);
    } else {
      appendRecordToURLSearchParams(url.searchParams, params);
    }

    init.headers = this.#getHeaders(extraInit?.headers);

    const startTimeout =
      this.#timeout !== undefined ? getTimeoutFn(init, this.#timeout) : null;

    const stopTimeout = startTimeout?.();

    let response: Response;
    let responseBody: string;

    try {
      // modify params in case paramsFn is provided
      const params = this.#paramsFn?.(url, init) ?? [url, init];

      if (this.#requestFn !== undefined) {
        // when using custom HTTP client, response is handled differently
        const customResponse = await this.#requestFn(...params);

        if (!customResponse.success) {
          throw new OaiPmhRequestError(
            customResponse.value,
            customResponse.details,
          );
        }

        return customResponse.value;
      }

      response = await fetch(...params);
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
