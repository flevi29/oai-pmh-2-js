<script lang="ts">
  import { getListSetsResultStore } from "./list-sets.svelte";
  import Button from "$lib/components/buttons/button.svelte";
  import JSONComponent from "$lib/components/json.svelte";
  import Loading from "$lib/components/loading.svelte";

  const r = getListSetsResultStore();
</script>

<Button onclick={() => r.run()} disabled={r.isRunning}>Start</Button>

<Button onclick={() => r.stop()} disabled={!r.canBeStopped}>Stop</Button>

<Loading isLoading={r.isRunning} />

<JSONComponent result={r.result} pXMLElemArrKey="setDescription" />
