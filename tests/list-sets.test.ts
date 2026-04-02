import { describe, expect, test } from "vitest";
import { getClient } from "./util/client.ts";
import { fetchMock } from "./util/fetch.ts";
import { getAssets } from "./util/asset.ts";

describe("method `listSets`", () => {
  test("successful response", async () => {
    const client = getClient();

    const searchParams = {
      verb: "ListSets",
    };

    const listSetsXmls = await getAssets([
      "./list-sets/1.xml",
      "./list-sets/2.xml",
      "./list-sets/3.xml",
    ]);
    using _ = fetchMock.response(searchParams, listSetsXmls);

    const result = await Array.fromAsync(client.listSets());
    expect(result).toMatchSnapshot();
  });
});
