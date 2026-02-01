import { getXMLParser } from "./xml-parser.ts";
import {
  OaiPmhInnerValidationError,
  OaiPmhValidationError,
} from "../error/validation-error.ts";
import { parseIdentify } from "./identify.ts";
import { parseGetRecordResponse, parseListRecordsResponse } from "./record.ts";
import { parseListIdentifiersResponse } from "./header.ts";
import { parseListMetadataFormats } from "./metadata-format.ts";
import { parseListSetsResponse } from "./set.ts";
import type { OaiPmhListResponse } from "./resumption-token.ts";
import type { OaiPmhIdentify } from "./model/identify.ts";
import type { OaiPmhRecord } from "./model/record.ts";
import type { OaiPmhHeader } from "./model/header.ts";
import type { OaiPmhMetadataFormat } from "./model/metadata-format.ts";
import type { OaiPmhSet } from "./model/set.ts";

/** Parser specific options. */
export type OaiPmhParserParameters = {
  /**
   * A DOMParser implementation (required in environments like Node.js where
   * DOMParser is not available).
   */
  domParser?: typeof DOMParser;
};

function safeGetDOMParser(): typeof DOMParser {
  if (typeof DOMParser === "undefined") {
    throw new Error(
      "environment doesn't have DOMParser, please provide it via options",
    );
  }

  return DOMParser;
}

export function getOaiPmhParser({ domParser }: OaiPmhParserParameters) {
  const parseXML = getXMLParser(domParser ?? safeGetDOMParser());

  function errorWrapper<TReturn>(
    xml: string,
    callback: (childNodes: NodeListOf<ChildNode>) => TReturn,
  ): NoInfer<TReturn> {
    const { childNodes } = parseXML(xml);

    try {
      return callback(childNodes);
    } catch (error) {
      if (error instanceof OaiPmhInnerValidationError) {
        throw new OaiPmhValidationError(error, xml);
      }

      throw error;
    }
  }

  return {
    parseIdentify(xml: string): OaiPmhIdentify {
      return errorWrapper(xml, parseIdentify);
    },

    parseGetRecord(xml: string): OaiPmhRecord {
      return errorWrapper(xml, parseGetRecordResponse);
    },

    parseListIdentifiers(xml: string): OaiPmhListResponse<OaiPmhHeader> {
      return errorWrapper(xml, parseListIdentifiersResponse);
    },

    parseListMetadataFormats(xml: string): OaiPmhMetadataFormat[] {
      return errorWrapper(xml, parseListMetadataFormats);
    },

    parseListRecords(xml: string): OaiPmhListResponse<OaiPmhRecord> {
      return errorWrapper(xml, parseListRecordsResponse);
    },

    parseListSets(xml: string): OaiPmhListResponse<OaiPmhSet> {
      return errorWrapper(xml, parseListSetsResponse);
    },
  };
}

export type OaiPmhParser = ReturnType<typeof getOaiPmhParser>;
