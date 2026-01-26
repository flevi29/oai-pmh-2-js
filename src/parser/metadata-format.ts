import type { OaiPmhMetadataFormat } from "#model/oai-pmh-stuff";
import { parseOaiPmh } from "./base-oai-pmh.ts";

export function parseListMetadataFormats(
  childNodeList: NodeListOf<ChildNode>,
): OaiPmhMetadataFormat[] {
  const [helper, listMetadataFormatsRecord] = parseOaiPmh(
    childNodeList,
    "ListMetadataFormats",
  );

  return helper
    .parseXMLRecordEntry(listMetadataFormatsRecord, "metadataFormat")
    .toRecords()
    .map(([nextHelper, metadataFormat]) => {
      const [metadataPrefix] = nextHelper
        .parseXMLRecordEntry(metadataFormat, "metadataPrefix")
        .toString();
      const [schema] = nextHelper
        .parseXMLRecordEntry(metadataFormat, "schema")
        .toString();
      const [metadataNamespace] = nextHelper
        .parseXMLRecordEntry(metadataFormat, "metadataNamespace")
        .toString();

      return { metadataPrefix, schema, metadataNamespace };
    });
}
