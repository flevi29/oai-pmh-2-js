/// <reference lib="ES2024" />
import { default as process } from "node:process";
import { writeFileSync } from "node:fs";
import { DOMParser } from "linkedom/worker";
import { getXMLParser } from "oai-pmh-2-js/parser/xml-parser";
import { getOaiPmhParser } from "oai-pmh-2-js/parser/oai-pmh-parser";
import { OaiPmhValidationError } from "oai-pmh-2-js/error/validation-error";
import { ParserHelper } from "#parser/helper/parse-helper";

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

    const id = attr.toMaybeRecord("id")?.id;

    if (i - lastI >= 300) {
      lastI = i;
      console.log(`${i}/${n}`);
    }

    yield [url, id] as const;
  }
}

const rootUrl = new URL("../..", import.meta.url);
const errorUrl = new URL("./error.jsonl", rootUrl);
const appProvidersUrl = new URL("./app/static/valid-providers/", rootUrl);

function appendErrorFile(obj: unknown) {
  writeFileSync(errorUrl, JSON.stringify(obj) + "\n", { flag: "a" });
}

let no = 0;
function writeOkFile(obj: unknown[]) {
  const fileUrl = new URL(`./providers-${no}.json`, appProvidersUrl);

  console.log(fileUrl.href);

  writeFileSync(fileUrl, JSON.stringify(obj));

  no += 1;
}

function writeDateFile(date: Date) {
  writeFileSync(
    new URL("./date.json", appProvidersUrl),
    JSON.stringify(date.toISOString()),
  );
}

async function fetchURLs() {
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

try {
  const startDate = new Date();
  const urls = await fetchURLs();
  const semaphore = getSemaphore(50);
  const parser = getOaiPmhParser(
    // @ts-expect-error: https://github.com/WebReflection/linkedom/issues/167
    DOMParser,
  );

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

  for (const [url, id] of urls) {
    const releaseLock = await semaphore.acquireLock();

    (async () => {
      const response = await fetch(`${url}?verb=Identify`, {
        signal: AbortSignal.timeout(30_000),
      });

      if (!response.ok) {
        // const { status, statusText } = response;
        // console.error({ url, status, statusText, responseBodyText });
        return;
      }

      const requiredHeader = response.headers.get(
        "Access-Control-Allow-Origin",
      );

      const responseBodyText = await response.text();
      const identify = parser.parseIdentify(responseBodyText);

      pushCached({
        url,
        id,
        name: identify.repositoryName,
        requiredHeader,
      });
    })()
      .catch((error) => {
        appendErrorFile({
          url,
          id,
          error:
            error instanceof OaiPmhValidationError
              ? { err: error.toString(), xml: error.xml }
              : typeof error === "object" &&
                  error !== null &&
                  "toString" in error &&
                  typeof error.toString === "function"
                ? error.toString()
                : JSON.stringify(error),
        });
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
