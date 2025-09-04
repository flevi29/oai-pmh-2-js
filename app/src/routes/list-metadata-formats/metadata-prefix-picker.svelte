<script lang="ts">
  import { getListMetadataFormatsResultStore } from "./list-metadata-formats.svelte";
  import Dialog from "$lib/components/dialog.svelte";
  import RadioInputList from "$lib/components/radio-input-list.svelte";
  import Button from "$lib/components/buttons/button.svelte";
  import Loading from "$lib/components/loading.svelte";

  const r = getListMetadataFormatsResultStore(() => undefined);

  let currentOaiPmhMetadataFormat = $state<string>();

  const {
    onValueChanged,
  }: { onValueChanged: (oaiPmhMetadataFormat?: string) => void } = $props();

  $effect(() => {
    onValueChanged(currentOaiPmhMetadataFormat);
  });

  let dialogComponent = $state<ReturnType<typeof Dialog>>();
</script>

<Dialog bind:this={dialogComponent}>
  {#if r.isRunning}
    <div class="w-full rounded-lg bg-white p-2 text-center text-sm shadow-sm">
      <div class="mx-auto w-max">
        <Loading isLoading />
      </div>
    </div>
  {:else if !r.result.success}
    <!-- TODO: Shared error component -->
    <div
      class="w-full rounded-lg border border-red-500 bg-red-100 p-2 text-red-700 shadow-sm"
    >
      <p>Error fetching available sets.</p>
    </div>
  {:else}
    <RadioInputList
      items={r.result.value.map((v) => ({
        value: v.metadataPrefix,
        isSelected: v.metadataPrefix === currentOaiPmhMetadataFormat,
      }))}
      onclick={(event) => {
        currentOaiPmhMetadataFormat = event.currentTarget.value;
        dialogComponent?.close();
      }}
    />
  {/if}
</Dialog>

<Button
  onclick={() => {
    dialogComponent?.showModal();
    if ((!r.result.success || r.result.value.length === 0) && !r.isRunning) {
      r.run();
    }
  }}>{currentOaiPmhMetadataFormat ?? "<select metadataPrefix>"}</Button
>
