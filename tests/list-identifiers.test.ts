import { describe, expect, test } from "vitest";
import { getClient } from "./util/client.ts";
import { fetchMock } from "./util/fetch.ts";
import { getAssets } from "./util/asset.ts";

describe("method `listIdentifiers`", () => {
  test("successful response", async () => {
    const client = getClient();

    const searchParams = {
      verb: "ListIdentifiers",
      metadataPrefix: "oai_dc",
    };

    const listIdentifiersXmls = await getAssets([
      "./list-identifiers/1.xml",
      "./list-identifiers/2.xml",
      "./list-identifiers/3.xml",
    ]);
    using _ = fetchMock.response(searchParams, listIdentifiersXmls);

    const result = await Array.fromAsync(
      client.listIdentifiers({ metadataPrefix: searchParams.metadataPrefix }),
    );
    expect(result).toMatchSnapshot();
  });
});
