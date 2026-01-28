import type { AttrParser } from "./helper/attr-parser.ts";
import type { ParserHelper } from "./helper/parse-helper.ts";
import { parseOaiPmh } from "./base-oai-pmh.ts";
import {
  parseResumptionToken,
  type OaiPmhListResponse,
} from "./resumption-token.ts";
import type { OaiPmhHeader } from "./model/header.ts";
import type { ParsedXMLRecord } from "./model/xml.ts";

export function parseHeader(
  helper: ParserHelper,
  headerRecord: ParsedXMLRecord,
  headerAttr: AttrParser,
): OaiPmhHeader {
  const isDeleted = headerAttr.toMaybeRecord("status")?.status === "deleted";

  const [identifier] = helper
    .parseXMLRecordEntry(headerRecord, "identifier")
    .toString();

  const [datestamp] = helper
    .parseXMLRecordEntry(headerRecord, "datestamp")
    .toString();

  const setSpec = helper
    .parseXMLRecordEntry(headerRecord, "setSpec")
    .toMaybeStrings()
    ?.map(([text]) => text)
    .filter((text) => text !== undefined);

  return { isDeleted, identifier, datestamp, setSpec };
}

export function parseListIdentifiersResponse(
  childNodeList: NodeListOf<ChildNode>,
): OaiPmhListResponse<OaiPmhHeader> {
  const [helper, listIdentifiersRecord] = parseOaiPmh(
    childNodeList,
    "ListIdentifiers",
  );

  return {
    records: helper
      .parseXMLRecordEntry(listIdentifiersRecord, "header")
      .toRecords()
      .map((v) => parseHeader(...v)),
    resumptionToken: parseResumptionToken(helper, listIdentifiersRecord),
  };
}
