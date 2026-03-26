import { DOMParser } from "linkedom";
import { OaiPmh, type OaiPmhConstructorOptions } from "#src/index";

export function getClient(options?: Partial<OaiPmhConstructorOptions>) {
  return new OaiPmh({
    baseUrl: "http://mock.api",
    // @ts-expect-error known issue with linkedom
    domParser: DOMParser,
    ...options,
  });
}
