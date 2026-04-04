/// <reference lib="ESNEXT" />
import { OaiPmh } from "oai-pmh-2-js/index";

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

export async function testAllMethodsAndGetInfo(
  url: string,
  domParser?: typeof DOMParser,
): Promise<{
  accessControlAllowOrigin?: string | null;
  repositoryName: string;
}> {
  let headers: Headers | undefined = undefined;
  const oaiPmh = new OaiPmh({
    baseUrl: url,
    timeout: 30_000,
    domParser,
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

  const accessControlAllowOrigin = headers!.get("Access-Control-Allow-Origin");

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
      identifier ??= v[0]!.identifier;

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
