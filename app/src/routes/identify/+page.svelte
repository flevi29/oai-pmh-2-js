<script lang="ts" module>
  import type { OaiPmhIdentify } from "oai-pmh-2-js/index";

  let initialValue: OaiPmhIdentify[] | undefined = undefined;
</script>

<script lang="ts">
  import { getResultStore } from "$lib/stores/result.svelte";
  import Button from "$lib/components/buttons/button.svelte";
  import Loading from "$lib/components/loading.svelte";
  import JSONComponent from "$lib/components/json.svelte";

  const r = getResultStore<OaiPmhIdentify>(async function* (oaiPmh, signal) {
    yield [await oaiPmh.identify({ init: { signal } })];
  }, initialValue);

  $effect(() => {
    initialValue = r.result.success ? r.result.value : undefined;
  });
</script>

<Button onclick={() => r.run()} disabled={r.isRunning}>Start</Button>

<Button onclick={() => r.stop()} disabled={!r.canBeStopped}>Stop</Button>

<Loading isLoading={r.isRunning} />

<JSONComponent
  result={r.result}
  collapseLimit={100}
  pXMLElemArrKey="description"
/>
