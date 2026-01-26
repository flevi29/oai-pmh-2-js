import type { OaiPmhIdentify } from "#model/oai-pmh-stuff";
import { parseOaiPmh } from "./base-oai-pmh.ts";

export function parseIdentify(
  childNodeList: NodeListOf<ChildNode>,
): OaiPmhIdentify {
  const [helper, identify] = parseOaiPmh(childNodeList, "Identify");

  const [repositoryName] = helper
    .parseXMLRecordEntry(identify, "repositoryName")
    .toString();
  const [baseURL] = helper.parseXMLRecordEntry(identify, "baseURL").toString();
  const [protocolVersion] = helper
    .parseXMLRecordEntry(identify, "protocolVersion")
    .toString();
  const [earliestDatestamp] = helper
    .parseXMLRecordEntry(identify, "earliestDatestamp")
    .toString();
  const [deletedRecord] = helper
    .parseXMLRecordEntry(identify, "deletedRecord")
    .toString();
  const [granularity] = helper
    .parseXMLRecordEntry(identify, "granularity")
    .toString();
  const [adminEmail] = helper
    .parseXMLRecordEntry(identify, "adminEmail")
    .toString();
  const compression = helper
    .parseXMLRecordEntry(identify, "compression")
    .toMaybeStrings()
    ?.map(([text]) => text)
    .filter((text) => text !== undefined);

  return {
    repositoryName,
    baseURL,
    protocolVersion,
    earliestDatestamp,
    deletedRecord: deletedRecord as OaiPmhIdentify["deletedRecord"],
    granularity: granularity as OaiPmhIdentify["granularity"],
    adminEmail,
    compression,
    description: identify.description,
  };
}
