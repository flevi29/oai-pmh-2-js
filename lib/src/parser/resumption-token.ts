import type { ParsedXMLRecord } from "../model/xml.ts";
import type { ParserHelper } from "./helper.ts";

export function parseResumptionToken(
  helper: ParserHelper,
  record: ParsedXMLRecord,
): string | null {
  const maybeToken = helper
    .parseXMLRecordEntry(record, "resumptionToken")
    .toMaybeString();

  if (maybeToken === undefined) {
    return null;
  }

  const [token] = maybeToken;

  return token;
}
