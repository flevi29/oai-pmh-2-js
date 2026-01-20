<script module lang="ts">
  function splitIntoPaginatedValues<T>(values: T[], valuesPerPage: number) {
    if (valuesPerPage < 1) {
      throw new RangeError('"values per page" must be greater than 0');
    }

    const valuesByPage: T[][] = [];

    let multiplier = 1;
    for (let i = 0; i < values.length; i += valuesPerPage) {
      valuesByPage.push(values.slice(i, multiplier * valuesPerPage));
      multiplier += 1;
    }

    return valuesByPage;
  }
</script>

<script lang="ts" generics="T">
  import { tick, type Snippet } from "svelte";

  const {
    values,
    valuesPerPage = 10,
    valueSnippet,
    pendingSnippet,
  }: {
    values: T[] | undefined;
    valuesPerPage?: number;
    valueSnippet: Snippet<[valuesSlice: T[], isLastPage: boolean]>;
    pendingSnippet?: Snippet;
  } = $props();

  let page = $derived.by(() => {
    values;
    return 0;
  });

  const p = $derived.by(() => {
    if (values === undefined) {
      return;
    }

    const paginatedValues = splitIntoPaginatedValues(values, valuesPerPage);

    return {
      paginatedValues,
      valuesForCurrentPage: paginatedValues[page]!,
      totalPages: paginatedValues.length,
      isOnlyOneElement: values.length === 1,
    };
  });

  const pageCountText = $derived(
    p !== undefined && p.totalPages > 0
      ? `${page + 1}/${p.totalPages}`
      : "no pages",
  );

  let topElement = $state.raw<HTMLElement>();

  function setPage(newPage: number, scroll: boolean): void {
    if (newPage < 0) {
      throw new RangeError("page must be greater or equal to 0");
    }

    if (p === undefined) {
      throw new Error("there are no values to paginate, cannot set page");
    }

    if (newPage >= p.totalPages) {
      throw new RangeError(
        "page must be less than paginated values array length",
      );
    }

    page = newPage;

    if (scroll) {
      tick()
        .then(() =>
          topElement?.scrollIntoView({
            block: "start",
            inline: "nearest",
            behavior: "smooth",
          }),
        )
        .catch(console.error);
    }
  }
</script>

<div bind:this={topElement}>
  {#if p === undefined}
    {@render pendingSnippet?.()}
  {:else if p.totalPages === 0}
    <hr />
    <p class="text-center"><small>⚠️ <i>no results</i></small></p>
    <hr />
  {:else}
    {#snippet navigationSnippet(scroll: boolean)}
      {#if !p.isOnlyOneElement}
        <nav>
          <button
            type="button"
            disabled={page === 0}
            onclick={() => setPage(page - 1, scroll)}
          >
            Prev
          </button>

          <small><code>{pageCountText}</code></small>

          <button
            type="button"
            disabled={p.totalPages === undefined ||
              p.totalPages === 0 ||
              page === p.totalPages - 1}
            onclick={() => setPage(page + 1, scroll)}
          >
            Next
          </button>
        </nav>
      {/if}
    {/snippet}

    {@render navigationSnippet(false)}

    <div>
      {@render valueSnippet(p.valuesForCurrentPage, page === p.totalPages - 1)}
    </div>

    {@render navigationSnippet(true)}
  {/if}
</div>
