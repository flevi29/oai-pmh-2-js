import type {
  ListResponse,
  OaiPmhHeader,
  OaiPmhIdentify,
  OaiPmhMetadataFormat,
  OaiPmhRecord,
  OaiPmhSet,
} from "../model/oai-pmh-stuff.ts";
import { getXMLParser, type ParseXML } from "./xml-parser.ts";
import {
  OaiPmhInnerValidationError,
  OaiPmhValidationError,
} from "../error/validation-error.ts";
import { parseIdentify } from "./identify.ts";
import { parseGetRecordResponse, parseListRecordsResponse } from "./record.ts";
import { parseListIdentifiersResponse } from "./header.ts";
import { parseListMetadataFormats } from "./metadata_format.ts";
import { parseListSetsResponse } from "./set.ts";

// TODO: provide a callback for XSD validation
//       for instance https://github.com/nikku/node-xsd-schema-validator
export class OaiPmhParser {
  readonly #parseXML: ParseXML;

  constructor(domParser: typeof DOMParser) {
    this.#parseXML = getXMLParser(domParser);
  }

  #errorWrapper<TReturn>(
    xml: string,
    callback: (childNodes: NodeListOf<ChildNode>) => TReturn,
  ): NoInfer<TReturn> {
    const { childNodes } = this.#parseXML(xml);

    try {
      return callback(childNodes);
    } catch (error: unknown) {
      if (error instanceof OaiPmhInnerValidationError) {
        throw new OaiPmhValidationError(error, xml);
      }

      throw error;
    }
  }

  parseIdentify(xml: string): OaiPmhIdentify {
    return this.#errorWrapper(xml, parseIdentify);
  }

  parseGetRecord(xml: string): OaiPmhRecord {
    return this.#errorWrapper(xml, parseGetRecordResponse);
  }

  parseListIdentifiers(xml: string): ListResponse<OaiPmhHeader> {
    return this.#errorWrapper(xml, parseListIdentifiersResponse);
  }

  parseListMetadataFormats(xml: string): OaiPmhMetadataFormat[] {
    return this.#errorWrapper(xml, parseListMetadataFormats);
  }

  parseListRecords(xml: string): ListResponse<OaiPmhRecord> {
    return this.#errorWrapper(xml, parseListRecordsResponse);
  }

  parseListSets(xml: string): ListResponse<OaiPmhSet> {
    return this.#errorWrapper(xml, parseListSetsResponse);
  }
}
