import { describe, test, expect } from "vitest";
import { getClient } from "./util/client.ts";
import { getFetchMock } from "./util/fetch.ts";
import { getError } from "./util/get-error.ts";

describe("base OAI-PMH data validation", () => {
  test("empty response", async () => {
    const client = getClient();

    using mock = getFetchMock();
    mock.simple({ verb: "Identify" });

    const error = await getError(() => client.identify());
    expect(error).toMatchSnapshot();
  });
});
