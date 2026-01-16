<script module lang="ts">
  import {
    getResultStore,
    getCachedResultValue,
  } from "$lib/stores/result.svelte";
  import type { OaiPmhSet } from "oai-pmh-2-js/index";

  export const cache = getCachedResultValue<OaiPmhSet>();
</script>

<script lang="ts">
  import { getOaiPmhGetter } from "$lib/stores/oai-pmh.svelte";
  import BaseFields from "$lib/components/base-fields.svelte";
  import PaginatedResult from "$lib/components/paginated-result.svelte";

  const r = getResultStore<OaiPmhSet>(
    getOaiPmhGetter(),
    (oaiPmh, signal) => oaiPmh.listSets({ init: { signal } }),
    cache,
  );
</script>

<BaseFields
  onstart={() => r.run()}
  isStartDisabled={r.isRunning}
  onstop={() => r.stop()}
  isStopDisabled={!r.canBeStopped}
  isLoading={r.isRunning}
/>

<PaginatedResult
  result={r.result}
  xmlPathPattern={/^\.setDescription\.\d+$/}
/>
