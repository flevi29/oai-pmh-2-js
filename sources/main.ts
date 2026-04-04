import { default as process } from "node:process";
import { mkdir, writeFile } from "node:fs/promises";
import { DOMParser } from "linkedom";
import { getXMLParser } from "oai-pmh-2-js/parser/xml-parser";
import { ParserHelper } from "oai-pmh-2-js/parser/helper/parse-helper";
import { getSemaphore } from "./util/semaphore.ts";
import { testAllMethodsAndGetInfo } from "./tester.ts";

// useful info on status of maintained OAI-PMH lists
// https://groups.google.com/g/oai-pmh/c/b11cH343bIo
// should probably implement one of the listed sources instead of the link underneath

const URL_LIST_URL =
  "https://www.openarchives.org/pmh/registry/ListFriends_HISTORICAL_2025-10-08.xml";

/** Has side effect of logging remaining URLs. */
function* parseBaseURLs(childNodeList: NodeListOf<ChildNode>) {
  const helper = new ParserHelper();

  const xmlRecord = helper.parseChildNodeListToXMLRecord(childNodeList);
  const [nextHelper, baseUrlsRecord, baseUrlsAttr] = helper
    .parseXMLRecordEntry(xmlRecord, "BaseURLs")
    .toRecord();

  const { number: n } = baseUrlsAttr.toRecord("number");

  const urls = nextHelper
    .parseXMLRecordEntry(baseUrlsRecord, "baseURL")
    .toStrings();

  let lastI = 0;
  for (const [i, [url]] of urls.entries()) {
    if (url === undefined) {
      throw nextHelper.getErr("expected no missing text nodes");
    }

    if (i - lastI >= 300) {
      lastI = i;
      console.log(`${i}/${n}`);
    }

    yield url;
  }
}

// TODO: Should also remove dir if it exists
async function mkdirIfNotExist(url: URL) {
  await mkdir(url).catch((error) => {
    if (
      typeof error !== "object" ||
      error === null ||
      !("code" in error) ||
      error.code !== "EEXIST"
    ) {
      throw error;
    }
  });
}

const urlListDirUrl = new URL("./url-list/", import.meta.url);
await mkdirIfNotExist(urlListDirUrl);

function getFileAppender(name: string) {
  const fileUrl = new URL(`./${name}.jsonl`, urlListDirUrl);
  console.log(fileUrl.href);

  return async function (obj: unknown) {
    await writeFile(fileUrl, JSON.stringify(obj) + "\n", {
      flag: "a",
    });
  };
}

const appendErrorFile = getFileAppender("error");
const appendOkFile = getFileAppender("ok");

async function writeDateFile(date: Date) {
  await writeFile(
    new URL("./date.json", urlListDirUrl),
    JSON.stringify(date.toISOString()),
  );
}

async function fetchUrls() {
  const parse = getXMLParser(DOMParser as typeof globalThis.DOMParser);

  const response = await fetch(URL_LIST_URL);

  if (!response.ok) {
    const responseBody = await response.text();
    const { status, statusText } = response;

    throw new Error(`${status} ${statusText}: ${responseBody}`, {
      cause: response,
    });
  }

  const xml = await response.text();
  const { childNodes } = parse(xml);

  return parseBaseURLs(childNodes);
}

try {
  const startDate = new Date();
  const semaphore = getSemaphore(50);

  for (const url of await fetchUrls()) {
    const releaseLock = await semaphore.acquireLock();

    testAllMethodsAndGetInfo(url, DOMParser as typeof globalThis.DOMParser)
      .then(async ({ accessControlAllowOrigin, repositoryName }) => {
        await appendOkFile({ url, repositoryName, accessControlAllowOrigin });
      })
      .catch(async (error) => {
        await appendErrorFile({
          url,
          error,
        });
      })
      .finally(() => {
        releaseLock();
      });
  }

  await semaphore.finish();

  await writeDateFile(startDate);

  console.log(`finished after ${Date.now() - startDate.getTime()}ms`);
} catch (error) {
  console.error(error);
  process.exitCode = 1;
}
