import { untrack } from "svelte";
import { OaiPmh } from "oai-pmh-2-js/mod";

const LAST_OAI_PMH_URL_KEY = "lastOaiPmhUrl";

export let globalOaiPmh = (() => {
  let value = $state<OaiPmh>();

  return {
    get value() {
      return value;
    },
    setValue(v?: OaiPmh) {
      value = v;
    },
  };
})();

export function getOaiPmhStore() {
  let isCorsProxied = $state(true);
  let url = $state(localStorage.getItem(LAST_OAI_PMH_URL_KEY) ?? "");

  let oaiConstructionError = $state<unknown>();

  const oaiPmh = $derived.by(() => {
    untrack(() => {
      oaiConstructionError = undefined;
    });

    try {
      return new OaiPmh({
        baseUrl: url,
        requestFn: isCorsProxied
          ? async (input, init) => {
              const { url } = new Request(input);
              // TODO: Should add option whether we want to proxy it or not, enabled by default
              const corsProxiedUrl = `https://corsproxy.io/?${encodeURIComponent(url)}`;

              const resp = await fetch(corsProxiedUrl, init);
              const parsedBody = await resp.text();

              return resp.ok
                ? { success: true, value: parsedBody, headers: resp.headers }
                : { success: false, value: parsedBody, details: resp };
            }
          : undefined,
      });
    } catch (error) {
      untrack(() => {
        oaiConstructionError = error;
      });
    }
  });

  $effect(() => {
    oaiPmh;

    return untrack(() => {
      globalOaiPmh.setValue(oaiPmh);
      return () => {
        globalOaiPmh.setValue();
      };
    });
  });

  return {
    get url() {
      return url;
    },
    get oaiPmh() {
      return oaiPmh;
    },
    setUrl(value: string): void {
      url = value;
      localStorage.setItem(LAST_OAI_PMH_URL_KEY, value);
    },
    get isCorsProxied() {
      return isCorsProxied;
    },
    setIsCorsProxied(v: boolean) {
      isCorsProxied = v;
    },
  };
}
