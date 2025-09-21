import type { ListResponse, OaiPmhHeader } from "../model/oai-pmh-stuff.ts";
import type { ParsedXMLRecord } from "../model/xml.ts";
import type { AttrParser, ParserHelper } from "./helper.ts";
import { parseOaiPmh } from "./base-oai-pmh.ts";
import { parseResumptionToken } from "./resumption-token.ts";

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
): ListResponse<OaiPmhHeader> {
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
