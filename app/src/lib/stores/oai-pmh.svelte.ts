import { createContext } from "svelte";
import { OaiPmh } from "oai-pmh-2-js/index";
import type { Result } from "$lib/generic-result";

function getCorsProxiedUrl(input: string | URL | Request) {
  const { url } = new Request(input);
  return `https://corsproxy.io/?${encodeURIComponent(url)}`;
}

const LAST_OAI_PMH_URL_KEY = "lastOaiPmhUrl";

export function getLastOaiPmhUrl(): string {
  return localStorage.getItem(LAST_OAI_PMH_URL_KEY) ?? "";
}

export function setLastOaiPmhUrl(url: string): void {
  localStorage.setItem(LAST_OAI_PMH_URL_KEY, url);
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
          // TODO: usePost option
          paramsFn: getIsCorsProxied()
            ? (input, init) => [getCorsProxiedUrl(input), init]
            : undefined,
        }),
      };
    } catch (error) {
      return { success: false, value: error };
    }
  });

  setOaiPmhGetter(() => result);
}
