import { describe, expect, test } from "vitest";
import { getClient } from "./util/client.ts";
import { fetchMock } from "./util/fetch.ts";
import { getAsset } from "./util/asset.ts";

describe("method `listMetadataFormats`", () => {
  test("successful response", async () => {
    const client = getClient();

    const searchParams = {
      verb: "ListMetadataFormats",
    };

    const listMetadataFormatsXml = await getAsset(
      "./list-metadata-formats.xml",
    );
    using _ = fetchMock.response(searchParams, [listMetadataFormatsXml]);

    const result = await client.listMetadataFormats();
    expect(result).toMatchSnapshot();
  });
});
