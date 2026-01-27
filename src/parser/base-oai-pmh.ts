import type { OaiPmhErrorCode } from "../model/oai-pmh-stuff.ts";
import { OaiPmhResponseError } from "../error/response-error.ts";
import { ParserHelper } from "./helper/parse-helper.ts";

export function parseOaiPmh(
  childNodeList: NodeListOf<ChildNode>,
  oaiPmhMethodKey: string,
) {
  const helper = new ParserHelper();

  const [nextHelper, oaiPmhRecord] = helper
    .parseXMLRecordEntry(
      helper.parseChildNodeListToXMLRecord(childNodeList),
      "OAI-PMH",
    )
    .toRecord();

  const errors = nextHelper
    .parseXMLRecordEntry(oaiPmhRecord, "error")
    .toMaybeStrings();

  if (errors !== undefined) {
    const [request, reqAttr] = nextHelper
      .parseXMLRecordEntry(oaiPmhRecord, "request")
      .toString();

    const [responseDate] = nextHelper
      .parseXMLRecordEntry(oaiPmhRecord, "responseDate")
      .toString();

    throw new OaiPmhResponseError({
      errors: errors.map(([text, attr]) => ({
        text,
        ...(attr.toRecord("code") as { code: OaiPmhErrorCode }),
      })),

      request: {
        value: request,
        attr: reqAttr.toMaybeRecord(
          "verb",
          "identifier",
          "metadataPrefix",
          "from",
          "until",
          "set",
          "resumptionToken",
        ),
      },

      responseDate,
    });
  }

  return nextHelper
    .parseXMLRecordEntry(oaiPmhRecord, oaiPmhMethodKey)
    .toRecord();
}
