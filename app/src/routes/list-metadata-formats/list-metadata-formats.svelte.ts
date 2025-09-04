import type { OaiPmhMetadataFormat } from "oai-pmh-2-js/mod";
import { getResultStore } from "$lib/stores/result.svelte";

let initialValue: OaiPmhMetadataFormat[] | undefined = undefined;

export function getListMetadataFormatsResultStore(
  identifier: () => string | undefined,
) {
  const r = getResultStore<OaiPmhMetadataFormat>(async function* (
    oaiPmh,
    signal,
  ) {
    yield await oaiPmh.listMetadataFormats(identifier(), { init: { signal } });
  }, initialValue);

  $effect(() => {
    initialValue = r.result.success ? r.result.value : undefined;
  });

  return r;
}
