import { vi, assert } from "vitest";

function fetchMockWrap(cb: typeof fetch) {
  const originalFetch = globalThis.fetch;
  const fetchMock = vi.fn<typeof fetch>();
  globalThis.fetch = fetchMock;

  fetchMock.mockImplementation(cb);

  return {
    [Symbol.dispose]() {
      globalThis.fetch = originalFetch;
    },
  };
}

export const fetchMock = {
  custom: fetchMockWrap,

  abortable: () =>
    fetchMockWrap(async (_input, init) => {
      const signal = init?.signal;
      assert.isOk(signal);

      return await new Promise((_resolve, reject) => {
        signal.throwIfAborted();
        signal.onabort = () => {
          reject(signal.reason);
        };
      });
    }),

  response(
    searchParams: Record<string, string>,
    responseBodies?: BodyInit[],
    isPost = false,
  ) {
    let i = 0;
    return fetchMockWrap(async (input, init) => {
      try {
        assert.instanceOf(input, URL);

        const inputSearchParams = Object.fromEntries(
          isPost
            ? ((init?.body as URLSearchParams | undefined)?.entries() ?? [])
            : input.searchParams.entries(),
        );

        if (i === 0) {
          assert.deepEqual(inputSearchParams, searchParams);
        } else {
          const { resumptionToken, ...rest } = inputSearchParams;

          assert(
            resumptionToken === undefined ||
              typeof resumptionToken === "string",
          );
          assert.deepEqual(rest, { verb: searchParams.verb! });
        }

        assert.strictEqual(init?.method, isPost ? "POST" : undefined);

        assert.deepEqual(
          Object.fromEntries(new Headers(init?.headers).entries()),
          { accept: "application/xml" },
        );

        return new Response(responseBodies?.[i]);
      } finally {
        i += 1;
      }
    });
  },
};
