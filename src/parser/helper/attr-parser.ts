import type { ParsedXMLAttributes } from "../model/xml.ts";
import type { ParserHelper } from "./parse-helper.ts";

export class AttrParser {
  readonly #helper: ParserHelper;
  readonly #attr?: ParsedXMLAttributes;

  constructor(helper: ParserHelper, attr: ParsedXMLAttributes | undefined) {
    this.#helper = helper;
    this.#attr = attr;
  }

  toMaybeRecord<TKeys extends string>(
    ...keys: TKeys[]
  ): { [TKey in TKeys]?: string } | undefined {
    if (this.#attr === undefined) {
      return;
    }

    const rec = {} as { [TKey in TKeys]?: string };
    for (const key of keys) {
      rec[key] = this.#attr[key]?.value;
    }

    return rec;
  }

  toRecord<TKeys extends string>(
    ...keys: TKeys[]
  ): { [TKey in TKeys]: string } {
    if (this.#attr === undefined) {
      throw this.#helper.getErr("expected to have attributes");
    }

    const rec = {} as { [TKey in TKeys]: string };
    for (const key of keys) {
      const attrVal = this.#attr[key];

      if (attrVal === undefined) {
        throw this.#helper.getErr(`expected to have "${key}" attribute`);
      }

      rec[key] = attrVal.value;
    }

    return rec;
  }
}
