export type SafeOmit<T, K extends keyof T> = Omit<T, K>;

export type ListOptions = {
  from?: string;
  until?: string;
  set?: string;
  metadataPrefix: string;
};

type ListVerbOptions = { verb: "ListIdentifiers" | "ListRecords" | "ListSets" };
export type ListOptionsWithVerb = ListVerbOptions & Partial<ListOptions>;
export type ListContinuationParams = ListVerbOptions & {
  resumptionToken: string;
};

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
   * Pass {@link MainRequestOptions.params} through the body of requests via POST method.
   *
   * Read more {@link https://www.openarchives.org/OAI/openarchivesprotocol.html#HTTPRequestFormat | here}.
   */
  usePost?: boolean;
  /**
   * An extra, more limited {@link RequestInit}, that may override some of the
   * options.
   */
  init?: ExtraRequestInit;
};

export type ReqOpt = Omit<MainRequestOptions, "params">;

/**
 * A function that allows modifying parameters before they're
 * sent off to the request function.
 */
export type CustomRequestParams = (
  ...params: Parameters<typeof fetch>
) => Parameters<typeof fetch>;

/**
 * An object in which `success` boolean indicates whether the response was
 * successful (status 200-299), `value` is the response body as text or a string
 * describing the error in case there is no text response body and `details` is any
 * details about the error on failure.
 */
export type CustomRequestFnResult =
  | { success: true; value: string }
  | {
      success: false;
      value: string;
      details: unknown;
    };

/**
 * A custom request function, that is called instead
 * of {@link https://developer.mozilla.org/en-US/docs/Web/API/Window/fetch | fetch} on web requests.
 */
export type CustomRequestFn = (
  ...args: Parameters<typeof fetch>
) => Promise<CustomRequestFnResult>;

export type OaiPmhRequestConstructorOptions = {
  baseUrl: string;
  init?: BaseRequestInit;
  usePost?: boolean;
  domParser?: typeof DOMParser;
  paramsFn?: CustomRequestParams;
  requestFn?: CustomRequestFn;
  /** Timeout in milliseconds for each HTTP request. */
  timeout?: number;
};
