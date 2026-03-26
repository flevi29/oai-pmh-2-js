import { vi, assert } from "vitest";

// TODO: Make it so that we can do using _ = fizz.buzz()
export function getFetchMock() {
  const originalFetch = globalThis.fetch;
  const fetchMock = vi.fn<typeof fetch>();
  globalThis.fetch = fetchMock;

  return {
    custom(cb: typeof fetch) {
      fetchMock.mockImplementation(async (...params) => await cb(...params));
    },

    abortable() {
      fetchMock.mockImplementation(async (_input, init) => {
        const signal = init?.signal;
        assert.isOk(signal);

        return await new Promise((_resolve, reject) => {
          signal.throwIfAborted();
          signal.onabort = () => {
            reject(signal.reason);
          };
        });
      });
    },

    simple(
      searchParams: Record<string, string>,
      responseBody?: BodyInit,
      isPost = false,
    ) {
      fetchMock.mockImplementation(async (input, init) => {
        assert.instanceOf(input, URL);

        assert.deepEqual(
          Object.fromEntries(
            isPost
              ? ((init?.body as URLSearchParams | undefined)?.entries() ?? [])
              : input.searchParams.entries(),
          ),
          searchParams,
        );

        assert.strictEqual(init?.method, isPost ? "POST" : undefined);

        assert.deepEqual(
          Object.fromEntries(new Headers(init?.headers).entries()),
          { accept: "application/xml" },
        );

        return new Response(responseBody);
      });
    },

    // TODO: This can be used above as well
    list(searchParams: Record<string, string>, responseBodies: BodyInit[]) {
      let i = 0;
      fetchMock.mockImplementation(async (input, init) => {
        try {
          assert.instanceOf(input, URL);

          const inputSearchParams = Object.fromEntries(
            input.searchParams.entries(),
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

          assert.deepEqual(
            Object.fromEntries(new Headers(init?.headers).entries()),
            { accept: "application/xml" },
          );

          return new Response(responseBodies[i]);
        } finally {
          i += 1;
        }
      });
    },

    [Symbol.dispose]() {
      globalThis.fetch = originalFetch;
    },
  };
}
