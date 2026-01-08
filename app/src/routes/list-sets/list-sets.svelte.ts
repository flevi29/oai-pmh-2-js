import type { OaiPmhSet } from "oai-pmh-2-js/index";
import { getResultStore } from "$lib/stores/result.svelte";

let initialValue: OaiPmhSet[] | undefined = undefined;

export function getListSetsResultStore() {
  const r = getResultStore<OaiPmhSet>(
    (oaiPmh, signal) => oaiPmh.listSets({ init: { signal } }),
    initialValue,
  );

  $effect(() => {
    initialValue = r.result.success ? r.result.value : undefined;
  });

  return r;
}
