<script lang="ts">
  import { cache } from "./+page.svelte";
  import { getOaiPmhGetter } from "$lib/stores/oai-pmh.svelte";
  import { getResultStore, resultStatus } from "$lib/stores/result.svelte";
  import Dialog from "$lib/components/dialog.svelte";
  import RadioInputList from "$lib/components/radio-input-list.svelte";
  import Loading from "$lib/components/loading.svelte";
  import ErrorComponent from "$lib/components/request-error.svelte";
  import type { OaiPmhMetadataFormat } from "oai-pmh-2-js/index";

  const {
    onValueChanged,
  }: { onValueChanged: (oaiPmhMetadataFormat?: string) => void } = $props();

  // TODO: have to be reset on URL change
  let currentOaiPmhMetadataFormat = $state.raw<string>();

  const r = getResultStore<OaiPmhMetadataFormat>(
    getOaiPmhGetter(),
    async function* (oaiPmh, signal) {
      yield await oaiPmh.listMetadataFormats(undefined, { init: { signal } });
    },
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

<Dialog
  bind:this={dialogComponent}
  headerContent="Pick OAI-PMH Metadata Prefix"
>
  {#if r.result.status === resultStatus.success}
    <RadioInputList
      items={r.result.value.map((v) => ({
        name: v.metadataPrefix,
        value: v.metadataPrefix,
        isSelected: v.metadataPrefix === currentOaiPmhMetadataFormat,
      }))}
      onclick={(event) => {
        currentOaiPmhMetadataFormat = event.currentTarget.value;
        onValueChanged(currentOaiPmhMetadataFormat);
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
