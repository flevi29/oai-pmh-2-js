import { describe, expect, test } from "vitest";
import { getClient } from "./util/client.ts";
import { getFetchMock } from "./util/fetch.ts";
import { getAsset } from "./util/asset.ts";

describe("method `getRecord`", () => {
  test("successful response", async () => {
    const client = getClient();

    const searchParams = {
      verb: "GetRecord",
      identifier: "some:id",
      metadataPrefix: "oai_dc",
    };

    using mock = getFetchMock();
    const getRecordXml = await getAsset("./get-record/get-record.xml");
    mock.simple(searchParams, getRecordXml);

    const result = await client.getRecord(
      searchParams.identifier,
      searchParams.metadataPrefix,
    );
    expect(result).toMatchSnapshot();
  });
});
