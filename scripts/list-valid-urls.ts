/// <reference lib="ESNEXT" />
import { default as process } from "node:process";
import { mkdirSync, writeFileSync } from "node:fs";
import { DOMParser } from "linkedom";
import { getXMLParser } from "oai-pmh-2-js/parser/xml-parser";
import { ParserHelper } from "oai-pmh-2-js/parser/helper/parse-helper";
import { OaiPmh } from "oai-pmh-2-js/index";

// useful info on status of maintained OAI-PMH lists
// https://groups.google.com/g/oai-pmh/c/b11cH343bIo
// should probably implement one of the listed sources instead of the link underneath

const URL_LIST_URL =
  "https://www.openarchives.org/pmh/registry/ListFriends_HISTORICAL_2025-10-08.xml";

function getSemaphore(weight: number) {
  let promiseChain = Promise.resolve(() => {});
  let p = Promise.withResolvers<void>();

  return {
    acquireLock(): Promise<() => void> {
      return (promiseChain = promiseChain.then(async () => {
        if (weight === 0) {
          await p.promise;
        }

        weight -= 1;

        let callback: (() => void) | null = () => {
          if (weight === 0) {
            p.resolve();
            p = Promise.withResolvers();
          }

          weight += 1;
        };

        return () => {
          if (callback !== null) {
            callback();
            callback = null;
          }
        };
      }));
    },
  };
}

function prepareErrorForSerialization(error: unknown): unknown {
  return error instanceof Error
    ? {
        text: String(error),
        cause: Object.hasOwn(error, "cause")
          ? prepareErrorForSerialization(error.cause)
          : undefined,
      }
    : error;
}

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
  for (const [i, [url, attr]] of urls.entries()) {
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

function mkdirIfNotExist(url: URL) {
  try {
    mkdirSync(url);
  } catch (error) {
    if (
      typeof error !== "object" ||
      error === null ||
      !("code" in error) ||
      error.code !== "EEXIST"
    ) {
      throw error;
    }
  }
}

const urlListDirUrl = new URL("../url-list/", import.meta.url);
mkdirIfNotExist(urlListDirUrl);
const errorsUrl = new URL("./error.jsonl", urlListDirUrl);
const okDirUrl = new URL("./ok/", urlListDirUrl);
mkdirIfNotExist(okDirUrl);

function appendErrorFile(str: string) {
  writeFileSync(errorsUrl, str + "\n", { flag: "a" });
}

let no = 0;
function writeOkFile(obj: unknown[]) {
  const fileUrl = new URL(`./providers-${no}.json`, okDirUrl);

  console.log(fileUrl.href);

  writeFileSync(fileUrl, JSON.stringify(obj));

  no += 1;
}

function writeDateFile(date: Date) {
  writeFileSync(
    new URL("./date.json", okDirUrl),
    JSON.stringify(date.toISOString()),
  );
}

async function fetchUrls() {
  const parse = getXMLParser(
    // @ts-expect-error: https://github.com/WebReflection/linkedom/issues/167
    DOMParser,
  );

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

async function wrapError<T extends (...params: any[]) => any>(
  fn: T,
  ...params: Parameters<T>
): Promise<ReturnType<T>> {
  try {
    return await fn(...params);
  } catch (error) {
    throw new Error(`${fn.name} failed`, { cause: error });
  }
}

async function testAllMethodsAndGetInfo(url: string): Promise<{
  accessControlAllowOrigin?: string | null;
  repositoryName: string;
}> {
  let headers: Headers | undefined = undefined;
  const oaiPmh = new OaiPmh({
    baseUrl: url,
    timeout: 30_000,
    // @ts-expect-error: https://github.com/WebReflection/linkedom/issues/167
    domParser: DOMParser,
    async requestFn(...params) {
      const response = await fetch(...params);
      const responseBodyAsText = await response.text();

      if (!response.ok) {
        return {
          success: false,
          value: `${response.status} ${response.statusText}: ${responseBodyAsText}`,
          details: response,
        };
      }

      headers = response.headers;
      return {
        success: true,
        value: responseBodyAsText,
      };
    },
  });

  const identify = await wrapError(oaiPmh.identify.bind(oaiPmh));
  if (Number(identify.protocolVersion) !== 2) {
    throw new Error("bad protocol version", { cause: identify });
  }

  const accessControlAllowOrigin = headers!?.get("Access-Control-Allow-Origin");

  const metadataFormats = await wrapError(
    oaiPmh.listMetadataFormats.bind(oaiPmh),
  );
  const { metadataPrefix } = metadataFormats[0]!;

  await wrapError(async function listSets() {
    await Array.fromAsync(oaiPmh.listSets());
  });

  let identifier: string | undefined = undefined;
  let count = 0;
  await wrapError(async function listIdentifiers() {
    for await (const v of oaiPmh.listIdentifiers({ metadataPrefix })) {
      if (identifier === undefined) {
        identifier = v[0]!.identifier;
      }

      count += 1;
      if (count === 2) {
        break;
      }
    }
  });

  count = 0;
  await wrapError(async function listRecords() {
    for await (const _ of oaiPmh.listRecords({ metadataPrefix })) {
      count += 1;
      if (count === 2) {
        break;
      }
    }
  });

  await wrapError(oaiPmh.getRecord.bind(oaiPmh), identifier!, metadataPrefix);

  return { accessControlAllowOrigin, repositoryName: identify.repositoryName };
}

try {
  const startDate = new Date();
  const urls = await fetchUrls();
  const semaphore = getSemaphore(50);

  let cached: unknown[] = [];
  function pushCached(value: unknown) {
    cached.push(value);

    if (cached.length >= 500) {
      writeOkFile(cached);
      cached = [];
    }
  }

  function flushCached() {
    writeOkFile(cached);
  }

  for (const url of urls) {
    const releaseLock = await semaphore.acquireLock();

    testAllMethodsAndGetInfo(url)
      .then(({ accessControlAllowOrigin, repositoryName }) => {
        pushCached({ url, repositoryName, accessControlAllowOrigin });
      })
      .catch((error) => {
        appendErrorFile(
          JSON.stringify({
            url,
            error: prepareErrorForSerialization(error),
          }),
        );
      })
      .finally(() => {
        releaseLock();
      });
  }

  const releaseLock = await semaphore.acquireLock();
  try {
    flushCached();
  } finally {
    releaseLock();
  }

  console.log(`finished after ${Date.now() - startDate.getTime()}ms`);

  writeDateFile(startDate);
} catch (error) {
  console.error(error);
  process.exitCode = 1;
}
