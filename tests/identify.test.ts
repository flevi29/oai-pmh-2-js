import { describe, expect, test } from "vitest";
import { getClient } from "./util/client.ts";
import { getFetchMock } from "./util/fetch.ts";
import { getAsset } from "./util/asset.ts";

describe("method `identify`", () => {
  test("successful response", async () => {
    const client = getClient();

    using mock = getFetchMock();
    const identifyXml = await getAsset("./identify.xml");
    mock.simple({ verb: "Identify" }, identifyXml);

    const result = await client.identify();
    expect(result).toMatchSnapshot();
  });
});
