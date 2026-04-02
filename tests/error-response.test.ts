import { describe, expect, test } from "vitest";
import { getClient } from "./util/client.ts";
import { fetchMock } from "./util/fetch.ts";
import { getAsset } from "./util/asset.ts";
import { getError } from "./util/get-error.ts";

describe("error responses", () => {
  test("simple error", async () => {
    const client = getClient();

    const searchParams = {
      verb: "GetRecord",
      identifier: "oai:tethys.at:-1",
      metadataPrefix: "oai_dc",
    };

    const badVerbXml = await getAsset("./error/id-does-not-exist.xml");
    using _ = fetchMock.response(searchParams, [badVerbXml]);

    const error = await getError(() =>
      client.getRecord(searchParams.identifier, searchParams.metadataPrefix),
    );
    expect(error).toMatchSnapshot();
  });

  test.todo("multiple errors");
});
