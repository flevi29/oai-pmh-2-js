import type { ParsedXMLElement, ParsedXMLRecord } from "../model/xml.ts";
import { parseToRecordOrString, type XMLParseResult } from "../xml-parser.ts";
import { AttrParser } from "./attr-parser.ts";
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
    const maybeString = this.toMaybeString();
    if (maybeString === undefined) {
      throw this.#helper.getErr("missing node");
    }

    return maybeString;
  }

  toMaybeRecords(): [ParserHelper, ParsedXMLRecord, AttrParser][] | undefined {
    if (this.#xmlRecordEntry === undefined) {
      return;
    }

    return this.#xmlRecordEntry.map(({ value: subChildNodeList, attr }, i) => {
      const nextHelper = this.#helper.addPath(i.toString());

      if (subChildNodeList.length === 0) {
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
    const records = this.toMaybeRecords();
    if (records === undefined) {
      throw this.#helper.getErr("missing node");
    }

    return records;
  }

  toMaybeStrings(): [string, AttrParser][] | undefined {
    if (this.#xmlRecordEntry === undefined) {
      return;
    }

    return this.#xmlRecordEntry.map(({ value: subChildNodeList, attr }, i) => {
      const nextHelper = this.#helper.addPath(i.toString());

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

  toStrings(): [string, AttrParser][] {
    const maybeStrings = this.toMaybeStrings();
    if (maybeStrings === undefined) {
      throw this.#helper.getErr("missing node");
    }

    return maybeStrings;
  }
}
