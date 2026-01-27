import type { ParsedXMLRecord } from "../model/xml.ts";
import type { ParserHelper } from "./helper/parse-helper.ts";

export function parseResumptionToken(
  helper: ParserHelper,
  record: ParsedXMLRecord,
): string | null {
  // TODO: Anything to do with the attributes?
  // https://www.openarchives.org/OAI/openarchivesprotocol.html#FlowControl
  const maybeToken = helper
    .parseXMLRecordEntry(record, "resumptionToken")
    .toMaybeString();

  if (maybeToken === undefined) {
    return null;
  }

  const [token] = maybeToken;

  return token === "" ? null : token;
}
