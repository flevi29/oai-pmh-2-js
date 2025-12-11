<script lang="ts">
  import { getOaiPmhStore } from "$lib/stores/oai-pmh.svelte";
  import DebouncedTextInput from "$lib/components/inputs/text-input.svelte";
  import Button from "$lib/components/buttons/button.svelte";
  import MicroAlert from "$lib/components/svgs/micro-alert.svelte";
  import LinkSvg from "$lib/components/svgs/link-svg.svelte";
  import TriangleDownSvg from "$lib/components/svgs/triangle-down-svg.svelte";

  const r = getOaiPmhStore();
  let { isInUrlSelectionMode = false }: { isInUrlSelectionMode?: boolean } =
    $props();

  const isUrlValid = $derived(r.url === "" || r.oaiPmh !== undefined);
</script>

<div class:hidden={isInUrlSelectionMode}>
  <div class="flex">
    <details>
      <summary
        class="inline-flex h-8
        min-w-max cursor-pointer items-center gap-1 rounded-l-md border px-3
        text-sm font-medium break-words duration-75
        select-none focus-visible:outline-2 active:transition-none"
      >
        <span>Select URL</span>

        <TriangleDownSvg class="-mr-1 size-4" />
      </summary>

      <details-menu>huh</details-menu>
    </details>

    <div class="text-dim-gray relative w-full">
      <DebouncedTextInput
        class="block w-full rounded-r-md border py-[5px] pr-3
        pl-8 align-middle text-sm break-words duration-75
        focus:bg-white focus-visible:outline-none"
        placeholder="Type OAI-PMH URL here..."
        value={r.url}
        onValueChanged={r.setUrl}
      />

      <LinkSvg class="pointer-events-none absolute top-[9px] left-2 size-4" />
    </div>

    <!-- <div class="whitespace-nowrap">
      <Button
        text="Select URL"
        onclick={() => {
          isInURLSelectionMode = true;
        }}
      />
    </div> -->
  </div>

  {#if !isUrlValid}
    <span class="mt-2 pl-3 text-xs font-semibold">
      <MicroAlert class="inline-block size-3" />
      <span>Please enter a valid URL</span>
    </span>
  {/if}
</div>

{#if isInUrlSelectionMode}
  <div class="rounded-xl border p-6 shadow-sm">
    <Button
      onclick={() => {
        isInUrlSelectionMode = false;
      }}>"Close"</Button
    >

    <div class="flex flex-col">
      <!-- {#each URL_LIST as { name, url }}
        {#if url !== oai.url}
          <button
            type="button"
            class="border"
            onclick={() => {
              oai.setUrl(url);
              isInURLSelectionMode = false;
            }}>{name}</button
          >
        {/if}
      {/each} -->
    </div>
  </div>
{/if}
