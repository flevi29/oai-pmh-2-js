<script lang="ts">
  import { cache } from "./+page.svelte";
  import { getOaiPmhGetter } from "$lib/stores/oai-pmh.svelte";
  import { getResultStore, resultStatus } from "$lib/stores/result.svelte";
  import Dialog from "$lib/components/dialog.svelte";
  import RadioInputList from "$lib/components/radio-input-list.svelte";
  import Loading from "$lib/components/loading.svelte";
  import ErrorComponent from "$lib/components/request-error.svelte";
  import type { OaiPmhSet } from "oai-pmh-2-js/index";

  const { onValueChanged }: { onValueChanged: (oaiPmhSet?: string) => void } =
    $props();

  let currentOaiPmhSet = $state.raw<string>();

  const r = getResultStore<OaiPmhSet>(
    getOaiPmhGetter(),
    (oaiPmh, signal) => oaiPmh.listSets({ init: { signal } }),
    cache,
  );

  let dialogComponent = $state.raw<Dialog>();

  export function open() {
    dialogComponent?.showModal();
    if (r.result.status !== resultStatus.success && !r.isRunning) {
      r.run();
    }
  }
</script>

<!-- TODO: This interferes with role=group, need to separate from button -->
<Dialog bind:this={dialogComponent} headerContent="Pick OAI-PMH Set">
  {#if r.result.status === resultStatus.success}
    <RadioInputList
      items={r.result.value.map((v) => ({
        name: v.setName,
        value: v.setSpec,
        isSelected: v.setSpec === currentOaiPmhSet,
      }))}
      onclick={(event) => {
        currentOaiPmhSet = event.currentTarget.value;
        onValueChanged(currentOaiPmhSet);
        dialogComponent?.close();
      }}
    />
  {:else if r.result.status === resultStatus.failure}
    <ErrorComponent error={r.result.value} />
  {:else}
    <Loading isLoading={r.isRunning} />

    <p class="text-center"><i>pending...</i></p>
  {/if}
</Dialog>
