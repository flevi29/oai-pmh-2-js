<script lang="ts">
  import { resultStatus, type OaiPmhResult } from "../stores/result.svelte";
  import JsonXml from "./json-xml/json-xml.svelte";
  import Pagination from "./pagination.svelte";
  import RequestError from "./request-error.svelte";

  const {
    result,
    valuesPerPage,
    xmlPathPattern,
  }: {
    result: OaiPmhResult<unknown[]>;
    valuesPerPage?: number;
    xmlPathPattern?: RegExp;
  } = $props();

  let pagination = $state.raw<Pagination<unknown>>();

  let cachedValues: unknown[] | undefined = undefined;
  const values = $derived.by(() => {
    if (result.status === resultStatus.success) {
      cachedValues = cachedValues?.concat(result.value) ?? result.value;
      return cachedValues;
    }

    cachedValues = undefined;
  });
</script>

{#if result.status === resultStatus.failure}
  <RequestError error={result.value} />
{:else}
  <article>
    <Pagination bind:this={pagination} {values} {valuesPerPage}>
      {#snippet valueSnippet(valuesSlice)}
        {#each valuesSlice as value}
          <JsonXml {value} {xmlPathPattern} />
          <hr class="horizontal-rule" />
        {/each}
      {/snippet}
      {#snippet pendingSnippet()}
        <hr />
        <p class="text-center"><small>ℹ️ <i>results pending</i></small></p>
        <hr />
      {/snippet}
    </Pagination>
  </article>
{/if}

<style>
  .horizontal-rule:last-child {
    display: none;
  }
</style>
