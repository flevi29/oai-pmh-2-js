import type { ParsedXMLRecord } from "../model/xml.ts";
import type { OaiPmhRecord } from "../model/oai-pmh-stuff.ts";
import type { ParserHelper } from "./helper/parse-helper.ts";
import type { OaiPmhListResponse } from "../model/list.ts";
import { parseOaiPmh } from "./base-oai-pmh.ts";
import { parseHeader } from "./header.ts";
import { parseResumptionToken } from "./resumption-token.ts";

function parseRecord(
  helper: ParserHelper,
  recordRecord: ParsedXMLRecord,
): OaiPmhRecord {
  const header = parseHeader(
    ...helper.parseXMLRecordEntry(recordRecord, "header").toRecord(),
  );
  const { metadata, about } = recordRecord;

  if (metadata === undefined && !header.isDeleted) {
    throw helper.getErr("expected `metadata` child node element");
  }

  return { header, metadata: metadata?.[0]?.value, about };
}

export function parseGetRecordResponse(
  childNodeList: NodeListOf<ChildNode>,
): OaiPmhRecord {
  const [helper, getRecordRecord] = parseOaiPmh(childNodeList, "GetRecord");

  const [nextHelper, recordRecord] = helper
    .parseXMLRecordEntry(getRecordRecord, "record")
    .toRecord();

  return parseRecord(nextHelper, recordRecord);
}

export function parseListRecordsResponse(
  childNodeList: NodeListOf<ChildNode>,
): OaiPmhListResponse<OaiPmhRecord> {
  const [helper, listRecordsRecord] = parseOaiPmh(childNodeList, "ListRecords");

  return {
    records: helper
      .parseXMLRecordEntry(listRecordsRecord, "record")
      .toRecords()
      .map(([helper, recordRecord]) => parseRecord(helper, recordRecord)),
    resumptionToken: parseResumptionToken(helper, listRecordsRecord),
  };
}
