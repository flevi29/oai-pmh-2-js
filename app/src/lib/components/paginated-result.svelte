<script lang="ts">
  import { tick } from "svelte";
  import { resultStatus, type OaiPmhResult } from "../stores/result.svelte";
  import JsonXml from "./json-xml/json-xml.svelte";
  import NumberedPaginationComponent from "./numbered-pagination.svelte";
  import RequestError from "./request-error.svelte";

  const {
    result,
    valuesPerPage = 10,
    xmlPathPattern,
  }: {
    result: OaiPmhResult<unknown[]>;
    valuesPerPage?: number;
    xmlPathPattern?: RegExp;
  } = $props();

  function splitIntoPaginatedValues(values: unknown[], valuesPerPage: number) {
    if (valuesPerPage < 1) {
      throw new RangeError('"values per page" must be greater than 0');
    }

    const valuesByPage: unknown[][] = [];

    let multiplier = 1;
    for (let i = 0; i < values.length; i += valuesPerPage) {
      valuesByPage.push(values.slice(i, multiplier * valuesPerPage));
      multiplier += 1;
    }

    return valuesByPage;
  }

  let cachedValues: unknown[] = [];
  let values = $derived.by(() => {
    switch (result.status) {
      case resultStatus.pending:
        break;
      case resultStatus.success:
        cachedValues = cachedValues.concat(result.value);
        break;
      case resultStatus.failure:
        cachedValues = [];
    }

    return cachedValues;
  });
  let page = $state.raw(1);

  const paginatedValues = $derived(
    splitIntoPaginatedValues(values, valuesPerPage),
  );
  const totalPages = $derived(paginatedValues.length);
  const valuesForCurrentPage = $derived(paginatedValues[page - 1] ?? []);

  function resetValues(): void {
    cachedValues = [];
    values = cachedValues;
  }

  function setPage(newPage: number): void {
    if (newPage < 1) {
      throw new RangeError("page must be greater than 0");
    }

    if (newPage > totalPages) {
      throw new RangeError("page cannot be greater than total pages");
    }

    page = newPage;
  }

  let topElement = $state.raw<HTMLElement>();

  // TODO: Make pagination be able to fetch next values from list type OAI-PMH method
</script>

{#snippet paginationSnippet(scroll = true)}
  {#if totalPages > 1}
    <NumberedPaginationComponent
      {page}
      {totalPages}
      setPage={(p) => {
        setPage(p);
        if (scroll) {
          tick().then(() =>
            topElement?.scrollIntoView({
              block: "start",
              inline: "nearest",
              behavior: "smooth",
            }),
          );
        }
      }}
    />
  {/if}
{/snippet}

{#if result.status === resultStatus.success}
  {#if valuesForCurrentPage.length !== 0}
    <article bind:this={topElement}>
      {@render paginationSnippet(false)}

      <div>
        {#each valuesForCurrentPage as value}
          <JsonXml {value} {xmlPathPattern} />
          <hr class="horizontal-rule" />
        {/each}
      </div>

      {@render paginationSnippet()}
    </article>
  {:else}
    <hr />
    <p class="text-center"><small>⚠️ <i>no results</i></small></p>
    <hr />
  {/if}
{:else if result.status === resultStatus.pending}
  <hr />
  <p class="text-center"><small>ℹ️ <i>results pending</i></small></p>
  <hr />
{:else}
  <RequestError error={result.value} />
{/if}

<style>
  .horizontal-rule:last-child {
    display: none;
  }
</style>
