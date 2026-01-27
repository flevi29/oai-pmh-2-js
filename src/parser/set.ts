import type { OaiPmhListResponse } from "../model/list.ts";
import type { OaiPmhSet } from "../model/oai-pmh-stuff.ts";
import { parseOaiPmh } from "./base-oai-pmh.ts";
import { parseResumptionToken } from "./resumption-token.ts";

export function parseListSetsResponse(
  childNodeList: NodeListOf<ChildNode>,
): OaiPmhListResponse<OaiPmhSet> {
  const [helper, listSetsRecord] = parseOaiPmh(childNodeList, "ListSets");

  return {
    records: helper
      .parseXMLRecordEntry(listSetsRecord, "set")
      .toRecords()
      .map(([helper, setRecord]) => {
        const [setSpec] = helper
          .parseXMLRecordEntry(setRecord, "setSpec")
          .toString();

        const [setName] = helper
          .parseXMLRecordEntry(setRecord, "setName")
          .toString();

        const { setDescription } = setRecord;

        return { setSpec, setName, setDescription };
      }),

    resumptionToken: parseResumptionToken(helper, listSetsRecord),
  };
}
