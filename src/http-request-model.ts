/** {@linkcode RequestInit} without `body` and `method` properties. */
export type ExtraRequestInit = Omit<RequestInit, "body" | "method">;

/** Same as {@linkcode ExtraRequestInit} but without `signal`. */
export type BaseRequestInit = Omit<ExtraRequestInit, "signal">;

/**
 * A function that allows modifying parameters before they're sent off to
 * {@linkcode fetch} or {@linkcode CustomRequestFunction} if used.
 */
export type CustomRequestParams = (
  ...params: Parameters<typeof fetch>
) => Parameters<typeof fetch>;

/** Returned by {@linkcode CustomRequestFunction} on success. */
export type SuccessCustomRequestFunctionResult = {
  success: true;
  /** Response body as text. */
  value: string;
};

/** Returned by {@linkcode CustomRequestFunction} on failure. */
export type FailureCustomRequestFunctionResult = {
  success: false;
  /** Response body as text or any other description of the error. */
  value: string;
  /**
   * Any other metadata about the error that will be attached to the `cause`
   * property of the error.
   */
  details: unknown;
};

/** A discriminated union object returned by {@linkcode CustomRequestFunction}. */
export type CustomRequestFunctionResult =
  | SuccessCustomRequestFunctionResult
  | FailureCustomRequestFunctionResult;

/**
 * A custom request function, that is called instead of {@linkcode fetch} on HTTP
 * requests.
 */
export type CustomRequestFunction = (
  ...args: Parameters<typeof fetch>
) => Promise<CustomRequestFunctionResult>;

/** Configuration options regarding HTTP requests. */
export type HttpRequestConstructorOptions = {
  /** The base URL of an OAI-PMH repository. */
  baseUrl: string;
  /**
   * Optional override settings for each HTTP request (headers, etc).
   *
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/RequestInit}
   */
  init?: BaseRequestInit;
  /**
   * Pass URL parameters through the body of requests via POST method.
   * ({@link https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Methods/POST#url-encoded_form_submission | URL-encoded form submission})
   *
   * @default false
   *
   * @see {@link https://www.openarchives.org/OAI/openarchivesprotocol.html#HTTPRequestFormat} .
   */
  usePost?: boolean;
  /** A hook to modify fetch parameters before the request is made. */
  paramsFn?: CustomRequestParams;
  /** A custom implementation to replace standard {@linkcode fetch}. */
  requestFn?: CustomRequestFunction;
  /** Timeout in milliseconds for each HTTP request. */
  timeout?: number;
};

/**
 * HTTP request options overrides. {@linkcode RequestOptionsWithParams} without
 * `params`, as that's handled internally.
 */
export type RequestOptions = {
  /**
   * Same as {@linkcode HttpRequestConstructorOptions.usePost} but an override
   * for individual requests.
   */
  usePost?: boolean;
  /**
   * An extra, more limited {@linkcode RequestInit}, that may override some of
   * the options. This overrides settings from
   * {@linkcode HttpRequestConstructorOptions.init}.
   *
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/RequestInit}
   */
  init?: ExtraRequestInit;
};
