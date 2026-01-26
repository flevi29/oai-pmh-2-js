<script module lang="ts">
  import {
    getResultStore,
    getCachedResultValue,
  } from "$lib/stores/result.svelte";
  import type { OaiPmhMetadataFormat } from "oai-pmh-2-js/index";

  export const cache = getCachedResultValue<OaiPmhMetadataFormat>();
</script>

<script lang="ts">
  import { getOaiPmhGetter } from "$lib/stores/oai-pmh.svelte";
  import BaseFields from "$lib/components/base-fields.svelte";
  import DebouncedTextInput from "$lib/components/debounced-text-input.svelte";
  import PaginatedResult from "$lib/components/paginated-result.svelte";

  let identifier = $state.raw<string>();

  const r = getResultStore<OaiPmhMetadataFormat>(
    getOaiPmhGetter(),
    async function* (oaiPmh, signal) {
      yield await oaiPmh.listMetadataFormats(identifier, { init: { signal } });
    },
    cache,
  );
</script>

<BaseFields
  onstart={() => r.run()}
  isStartDisabled={r.isRunning}
  onstop={() => r.stop()}
  isStopDisabled={!r.canBeStopped}
  isLoading={r.isRunning}
>
  <DebouncedTextInput
    type="text"
    value={identifier}
    placeholder="identifier"
    onValueChanged={(v) => {
      identifier = v || undefined;
    }}
  />
</BaseFields>

<PaginatedResult result={r.result} valuesPerPage={10} />
