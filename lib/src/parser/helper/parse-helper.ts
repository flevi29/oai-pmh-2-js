import { OaiPmhInnerValidationError } from "#error/validation-error";
import type { ParsedXMLRecord } from "#model/xml";
import { parseToRecordOrString } from "../xml-parser.ts";
import { XMLRecordEntryParser } from "./xml-record-entry-parser.ts";

export class ParserHelper {
  readonly #path: string;

  constructor(path = "") {
    this.#path = path;
  }

  getErr(message: string) {
    return new OaiPmhInnerValidationError(this.#path, message);
  }

  addPath(newPath: string): ParserHelper {
    return new ParserHelper(`${this.#path}.${newPath}`);
  }

  parseChildNodeListToXMLRecord(childNodeList: NodeListOf<ChildNode>) {
    const xmlRecord = parseToRecordOrString(this, childNodeList);

    if (typeof xmlRecord !== "object") {
      throw this.getErr("expected element child nodes");
    }

    return xmlRecord;
  }

  parseXMLRecordEntry(xmlRecord: ParsedXMLRecord, key: string) {
    return new XMLRecordEntryParser(this, xmlRecord, key);
  }
}
