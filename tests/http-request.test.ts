import { describe, expect, test } from "vitest";
import { getClient } from "./util/client.ts";
import { getFetchMock } from "./util/fetch.ts";
import { getAsset } from "./util/asset.ts";
import { getError, retract } from "./util/get-error.ts";
import { OaiPmh, type CustomRequestFunction } from "#src/index";

describe("http requests", () => {
  test("use POST", async () => {
    const client = getClient();

    using mock = getFetchMock();
    const identifyXml = await getAsset("./identify.xml");
    mock.simple({ verb: "Identify" }, identifyXml, true);

    await client.identify({ usePost: true });
  });

  test("timeout", async () => {
    const client = getClient();

    using mock = getFetchMock();
    const identifyXml = await getAsset("./identify.xml");
    mock.simple({ verb: "Identify" }, identifyXml);

    await client.identify({ timeout: 60_000 });
  });

  test("timeout error", async () => {
    const client = getClient();

    using mock = getFetchMock();
    mock.abortable();

    const error = await getError(() => client.identify({ timeout: 0 }));
    retract(error, ["cause.cause.init"]);
    expect(error).toMatchSnapshot();
  });

  test("abort", async () => {
    const client = getClient();

    using mock = getFetchMock();
    mock.abortable();

    const ac = new AbortController();
    ac.abort("<sample reason>");

    const error = await getError(() =>
      client.identify({ init: { signal: ac.signal } }),
    );
    retract(error, ["cause.cause.init"]);
    expect(error).toMatchSnapshot();
  });

  test("abort with timeout, before timeout", async () => {
    const client = getClient();

    using mock = getFetchMock();
    mock.abortable();

    const ac = new AbortController();
    ac.abort("<sample reason>");

    const error = await getError(() =>
      client.identify({ init: { signal: ac.signal }, timeout: 60_000 }),
    );
    retract(error, ["cause.cause.init"]);
    expect(error).toMatchSnapshot();
  });

  test("abort with timeout, after timeout", async () => {
    const client = getClient();

    using mock = getFetchMock();
    mock.abortable();

    const ac = new AbortController();

    const errorPromise = getError(() =>
      client.identify({ init: { signal: ac.signal }, timeout: 0 }),
    );
    setTimeout(() => {
      ac.abort("<sample reason>");
    }, 0);

    const error = await errorPromise;
    retract(error, ["cause.cause.init"]);
    expect(error).toMatchSnapshot();
  });

  test("abort with timeout, after timeout but before something todo", async () => {
    const client = getClient();

    using mock = getFetchMock();
    mock.abortable();

    const ac = new AbortController();

    const errorPromise = getError(() =>
      client.identify({ init: { signal: ac.signal }, timeout: 0 }),
    );
    ac.abort("<sample reason>");

    const error = await errorPromise;
    retract(error, ["cause.cause.init"]);
    expect(error).toMatchSnapshot();
  });

  test.for([
    "message sample",
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. In porta lobortis sagittis." +
      "Mauris porttitor enim at aliquam interdum. Mauris et arcu ut augue convallis finibus" +
      "ut sit amet ipsum. Morbi auctor vulputate volutpat. Integer ultrices, ligula ut" +
      "venenatis pretium, velit odio finibus mauris, vel eleifend felis enim non metus.",
    undefined,
  ])("response outside of 200-299 status", async (bodyMessage) => {
    const client = getClient();

    using mock = getFetchMock();
    mock.custom(() =>
      Promise.resolve(new Response(bodyMessage, { status: 500 })),
    );

    const error = await getError(() => client.identify());
    retract(error, ["cause"]);
    expect(error).toMatchSnapshot();
  });

  const customRequestFn: CustomRequestFunction = async (...params) => {
    const response = await fetch(...params);
    const text = await response.text();

    return response.ok
      ? { success: true, value: text }
      : { success: false, value: text, details: response };
  };

  test("custom request fn", async () => {
    const client = getClient({ requestFn: customRequestFn });

    using mock = getFetchMock();
    const identifyXml = await getAsset("./identify.xml");
    mock.simple({ verb: "Identify" }, identifyXml);

    await client.identify();
  });

  test("custom request fn with error", async () => {
    const client = getClient({ requestFn: customRequestFn });

    using mock = getFetchMock();
    mock.custom(() =>
      Promise.resolve(new Response("message sample", { status: 500 })),
    );

    const error = await getError(() => client.identify());
    retract(error, ["cause.cause"]);
    expect(error).toMatchSnapshot();
  });

  test.todo("search params with undefined or null value");

  test.todo("extra headers");

  test.todo("headers with accept");

  test("invalid URL construction error", () => {
    expect(() =>
      getClient({ baseUrl: "this is not a valid URL" }),
    ).toThrowErrorMatchingInlineSnapshot(
      `[Error: The provided base URL is not valid]`,
    );
  });

  test("URL construction with trailing slash", () => {
    expect(() => getClient({ baseUrl: "http://mock.api/" })).not.toThrow();
  });
});
