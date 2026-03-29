import { DOMParser } from "linkedom";
import { OaiPmh, type OaiPmhConstructorOptions } from "#src/index";
import { getXMLParser } from "#src/parser/xml-parser";

export function getClient(options?: Partial<OaiPmhConstructorOptions>) {
  return new OaiPmh({
    baseUrl: "http://mock.api",
    domParser: DOMParser as typeof globalThis.DOMParser,
    ...options,
  });
}

export function getParser() {
  return getXMLParser(DOMParser as typeof globalThis.DOMParser);
}
