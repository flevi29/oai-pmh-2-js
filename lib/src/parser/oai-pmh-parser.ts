import type {
  ListResponse,
  OaiPmhHeader,
  OaiPmhIdentify,
  OaiPmhMetadataFormat,
  OaiPmhRecord,
  OaiPmhSet,
} from "#model/oai-pmh-stuff";
import { getXMLParser } from "./xml-parser.ts";
import {
  OaiPmhInnerValidationError,
  OaiPmhValidationError,
} from "#error/validation-error";
import { parseIdentify } from "./identify.ts";
import { parseGetRecordResponse, parseListRecordsResponse } from "./record.ts";
import { parseListIdentifiersResponse } from "./header.ts";
import { parseListMetadataFormats } from "./metadata-format.ts";
import { parseListSetsResponse } from "./set.ts";

// TODO: provide a callback for XSD validation
//       for instance https://github.com/nikku/node-xsd-schema-validator
export function getOaiPmhParser(domParser: typeof DOMParser) {
  const parseXML = getXMLParser(domParser);

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

    parseListIdentifiers(xml: string): ListResponse<OaiPmhHeader> {
      return errorWrapper(xml, parseListIdentifiersResponse);
    },

    parseListMetadataFormats(xml: string): OaiPmhMetadataFormat[] {
      return errorWrapper(xml, parseListMetadataFormats);
    },

    parseListRecords(xml: string): ListResponse<OaiPmhRecord> {
      return errorWrapper(xml, parseListRecordsResponse);
    },

    parseListSets(xml: string): ListResponse<OaiPmhSet> {
      return errorWrapper(xml, parseListSetsResponse);
    },
  };
}

export type OaiPmhParser = ReturnType<typeof getOaiPmhParser>;
