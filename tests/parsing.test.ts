import { describe, test, expect, assert } from "vitest";
import { getClient, getParser } from "./util/client.ts";
import { getFetchMock } from "./util/fetch.ts";
import { getError } from "./util/get-error.ts";
import { OaiPmh, parseToRecordOrString } from "#src/index";
import { DOMParser } from "linkedom";

describe("base OAI-PMH data validation", () => {
  test("empty response", async () => {
    const client = getClient();

    using mock = getFetchMock();
    mock.simple({ verb: "Identify" });

    const error = await getError(() => client.identify());
    expect(error).toMatchSnapshot();
  });

  test("no default dom parser error", async () => {
    const error = await getError(
      () => new OaiPmh({ baseUrl: "http://mock.api" }),
    );

    expect(error).toMatchSnapshot();
  });

  test("default dom parser", () => {
    const originalDOMParser = globalThis.DOMParser;
    globalThis.DOMParser = DOMParser as typeof globalThis.DOMParser;
    try {
      new OaiPmh({ baseUrl: "http://mock.api" });
    } finally {
      globalThis.DOMParser = originalDOMParser;
    }
  });

  test("xml parser works", () => {
    const parseXml = getParser();
    expect(
      parseToRecordOrString(parseXml("<hello>Friend</hello>").childNodes),
    ).toMatchSnapshot();
  });

  test("xml parser ignores certain node types", () => {
    const parseXml = getParser();
    assert.strictEqual(
      parseToRecordOrString(
        parseXml(
          // linkedom doesn't parse processing instructions,
          // so the test doesn't cover it, but that's fine
          '<?xml version="1.0"?><!doctype html><!-- COMMENT -->',
        ).childNodes,
      ),
      "",
    );
  });

  test("xml parser with differing text nodes", () => {
    const parseXml = getParser();
    expect(
      parseToRecordOrString(
        parseXml(
          "Here is a CDATA section: <![CDATA[ < > & ]]> with all kinds of unescaped text.",
        ).childNodes,
      ),
    ).toMatchSnapshot();
  });

  test("xml with namespaced elements", () => {
    const parseXml = getParser();
    expect(
      parseToRecordOrString(
        parseXml("<pre:fixed>Prefixed</pre:fixed>").childNodes,
      ),
    ).toMatchSnapshot();
  });

  // TODO: How to test this? Cannot create document fragment via linkedom I believe
  test.todo("xml parser throws for certain node types");

  test.todo("expected attributes missing or no attributes at all");

  test.todo("missing object node or nodes with specific key");
  test.todo("missing string node or nodes with specific key");
  test.todo("node is of type text whereas it was supposed to be an object");
  test.todo("node is of type object whereas it was supposed to a string");
});
