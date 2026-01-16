import { createContext } from "svelte";
import { OaiPmh } from "oai-pmh-2-js/index";
import type { Result } from "$lib/generic-result";

function getCorsProxiedUrl(url: string) {
  return `https://corsproxy.io/?${encodeURIComponent(url)}`;
}

const LAST_OAI_PMH_URL_KEY = "lastOaiPmhUrl";

export function getLastOaiPmhUrl(): string {
  return localStorage.getItem(LAST_OAI_PMH_URL_KEY) ?? "";
}

const [getOaiPmhGetter, setOaiPmhGetter] =
  createContext<() => Result<OaiPmh>>();

export { getOaiPmhGetter };

export function setupOaiPmh(
  getUrl: () => string,
  getIsCorsProxied: () => boolean,
): void {
  const result = $derived.by<Result<OaiPmh>>(() => {
    try {
      return {
        success: true,
        value: new OaiPmh({
          baseUrl: getUrl(),
          requestFn: getIsCorsProxied()
            ? async (input, init) => {
                const { url } = new Request(input);
                const corsProxiedUrl = getCorsProxiedUrl(url);

                const resp = await fetch(corsProxiedUrl, init);
                const parsedBody = await resp.text();

                return resp.ok
                  ? { success: true, value: parsedBody, headers: resp.headers }
                  : { success: false, value: parsedBody, details: resp };
              }
            : undefined,
        }),
      };
    } catch (error) {
      return { success: false, value: error };
    }
  });

  setOaiPmhGetter(() => result);
}
