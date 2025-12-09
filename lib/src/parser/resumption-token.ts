import type { ParsedXMLRecord } from "#model/xml";
import type { ParserHelper } from "./helper/parse-helper.ts";

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
