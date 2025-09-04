import { XMLParser } from "./xml_parser.js";
import {
  OaiPmhInnerValidationError,
  OaiPmhValidationError,
} from "../error/validation-error.js";
import {
  type OaiPmhIdentify,
  parseIdentifyResponse,
} from "../model/parser/identify.js";
import {
  type OaiPmhRecord,
  parseGetRecordResponse,
  parseListRecordsResponse,
} from "../model/parser/record.js";
import {
  type OaiPmhHeader,
  parseListIdentifiersResponse,
} from "../model/parser/header.js";
import {
  type OaiPmhMetadataFormat,
  validateListMetadataFormatsResponse,
} from "../model/parser/metadata_format.js";
import { type OaiPmhSet, parseListSetsResponse } from "../model/parser/set.js";
import type { ListResponse } from "../model/parser/shared.js";

// TODO: do not validate instead provide a callback for validation
// for instance https://github.com/nikku/node-xsd-schema-validator
export class OaiPmhParser {
  readonly #xmlParser: XMLParser;

  constructor(domParser: typeof DOMParser) {
    this.#xmlParser = new XMLParser(domParser);
  }

  #validationErrorWrap<TReturn>(
    xml: string,
    callback: (childNodes: NodeListOf<ChildNode>) => TReturn,
  ): NoInfer<TReturn> {
    const { childNodes } = this.#xmlParser.parse(xml);

    try {
      return callback(childNodes);
    } catch (error: unknown) {
      if (error instanceof OaiPmhInnerValidationError) {
        throw new OaiPmhValidationError(error, xml);
      }

      throw error;
    }
  }

  readonly parseIdentify = (xml: string): OaiPmhIdentify => {
    return this.#validationErrorWrap(xml, parseIdentifyResponse);
  };

  readonly parseGetRecord = (xml: string): OaiPmhRecord => {
    return this.#validationErrorWrap(xml, parseGetRecordResponse);
  };

  readonly parseListIdentifiers = (xml: string): ListResponse<OaiPmhHeader> => {
    return this.#validationErrorWrap(xml, parseListIdentifiersResponse);
  };

  readonly parseListMetadataFormats = (xml: string): OaiPmhMetadataFormat[] => {
    return this.#validationErrorWrap(xml, validateListMetadataFormatsResponse);
  };

  readonly parseListRecords = (xml: string): ListResponse<OaiPmhRecord> => {
    return this.#validationErrorWrap(xml, parseListRecordsResponse);
  };

  readonly parseListSets = (xml: string): ListResponse<OaiPmhSet> => {
    return this.#validationErrorWrap(xml, parseListSetsResponse);
  };
}
