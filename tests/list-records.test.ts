import { describe, expect, test } from "vitest";
import { getClient } from "./util/client.ts";
import { getFetchMock } from "./util/fetch.ts";
import { getAssets } from "./util/asset.ts";

describe("method `listRecords`", () => {
  test("successful response", async () => {
    const client = getClient();

    const searchParams = {
      verb: "ListRecords",
      metadataPrefix: "oai_dc",
    };

    using mock = getFetchMock();
    const listRecordsXmls = await getAssets([
      "./list-records/1.xml",
      "./list-records/2.xml",
      "./list-records/3.xml",
    ]);
    mock.list(searchParams, listRecordsXmls);

    const result = await Array.fromAsync(
      client.listRecords({ metadataPrefix: searchParams.metadataPrefix }),
    );
    expect(result).toMatchSnapshot();
  });
});
