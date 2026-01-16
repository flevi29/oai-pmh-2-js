<script lang="ts" module>
  import {
    getResultStore,
    getCachedResultValue,
  } from "$lib/stores/result.svelte";
  import type { OaiPmhIdentify } from "oai-pmh-2-js/index";

  const cache = getCachedResultValue<OaiPmhIdentify>();
</script>

<script lang="ts">
  import { getOaiPmhGetter } from "$lib/stores/oai-pmh.svelte";
  import BaseFields from "$lib/components/base-fields.svelte";
  import PaginatedResult from "$lib/components/paginated-result.svelte";

  const r = getResultStore<OaiPmhIdentify>(
    getOaiPmhGetter(),
    async function* (oaiPmh, signal) {
      yield [await oaiPmh.identify({ init: { signal } })];
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
/>

<PaginatedResult
  result={r.result}
  xmlPathPattern={/^\.description\.\d+$/}
/>
