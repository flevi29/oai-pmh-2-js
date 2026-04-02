import { describe, expect, test } from "vitest";
import { getClient } from "./util/client.ts";
import { fetchMock } from "./util/fetch.ts";
import { getAsset } from "./util/asset.ts";

describe("method `identify`", () => {
  test("successful response", async () => {
    const client = getClient();

    const identifyXml = await getAsset("./identify.xml");
    using _ = fetchMock.response({ verb: "Identify" }, [identifyXml]);

    const result = await client.identify();
    expect(result).toMatchSnapshot();
  });
});
