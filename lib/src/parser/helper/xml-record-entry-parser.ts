import { parseToRecordOrString, type XMLParseResult } from "../xml-parser.ts";
import { AttrParser } from "./attr-parser.ts";
import type { ParsedXMLElement, ParsedXMLRecord } from "#model/xml";
import type { ParserHelper } from "./parse-helper.ts";

export class XMLRecordEntryParser {
  readonly #helper: ParserHelper;
  readonly #xmlRecordEntry?: ParsedXMLElement[];

  constructor(helper: ParserHelper, xmlRecord: ParsedXMLRecord, key: string) {
    this.#helper = helper.addPath(key);
    this.#xmlRecordEntry = xmlRecord[key];
  }

  #parseXMLElement({
    value: subChildNodeList,
    attr,
  }: ParsedXMLElement): [XMLParseResult, AttrParser] {
    if (subChildNodeList === undefined) {
      throw this.#helper.getErr("expected child node elements");
    }

    return [
      parseToRecordOrString(this.#helper, subChildNodeList),
      new AttrParser(this.#helper, attr),
    ];
  }

  toRecord(): [ParserHelper, ParsedXMLRecord, AttrParser] {
    if (this.#xmlRecordEntry === undefined) {
      throw this.#helper.getErr("missing node");
    }

    const [recordOrString, attr] = this.#parseXMLElement(
      this.#xmlRecordEntry[0]!,
    );

    if (typeof recordOrString !== "object") {
      throw this.#helper.getErr("expected child node elements");
    }

    return [this.#helper, recordOrString, attr];
  }

  toMaybeString(): [string, AttrParser] | undefined {
    if (this.#xmlRecordEntry === undefined) {
      return;
    }

    const [recordOrString, attr] = this.#parseXMLElement(
      this.#xmlRecordEntry[0]!,
    );

    if (typeof recordOrString !== "string") {
      throw this.#helper.getErr("expected to contain text");
    }

    return [recordOrString, attr];
  }

  toString(): [string, AttrParser] {
    const asd = this.toMaybeString();
    if (asd === undefined) {
      throw this.#helper.getErr("missing node");
    }
    return asd;
  }

  toMaybeRecords(): [ParserHelper, ParsedXMLRecord, AttrParser][] | undefined {
    if (this.#xmlRecordEntry === undefined) {
      return;
    }

    return this.#xmlRecordEntry.map(({ value: subChildNodeList, attr }, i) => {
      const nextHelper = this.#helper.addPath(i.toString());

      if (subChildNodeList === undefined) {
        throw nextHelper.getErr("expected child node elements");
      }

      const recordOrString = parseToRecordOrString(
        nextHelper,
        subChildNodeList,
      );

      if (typeof recordOrString !== "object") {
        throw nextHelper.getErr("expected child node elements");
      }

      return [
        nextHelper,
        recordOrString,
        new AttrParser(nextHelper, attr),
      ] as const;
    });
  }

  toRecords(): [ParserHelper, ParsedXMLRecord, AttrParser][] {
    const asd = this.toMaybeRecords();
    if (asd === undefined) {
      throw this.#helper.getErr("missing node");
    }
    return asd;
  }

  toMaybeStrings(): [string | undefined, AttrParser][] | undefined {
    if (this.#xmlRecordEntry === undefined) {
      return;
    }

    return this.#xmlRecordEntry.map(({ value: subChildNodeList, attr }, i) => {
      const nextHelper = this.#helper.addPath(i.toString());

      if (subChildNodeList === undefined) {
        throw nextHelper.getErr("expected child node elements");
      }

      const recordOrString = parseToRecordOrString(
        nextHelper,
        subChildNodeList,
      );

      if (typeof recordOrString === "object") {
        throw nextHelper.getErr("expected to contain text");
      }

      return [recordOrString, new AttrParser(nextHelper, attr)];
    });
  }

  toStrings(): [string | undefined, AttrParser][] {
    const asd = this.toMaybeStrings();
    if (asd === undefined) {
      throw this.#helper.getErr("missing node");
    }
    return asd;
  }
}
