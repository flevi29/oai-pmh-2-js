<script lang="ts">
  import type { Result } from "../stores/result.svelte";
  import { tick, type ComponentProps } from "svelte";
  import { getPagination } from "../pagination.svelte";
  import JSONInnerComponent from "./json-inner.svelte";
  import NumberedPaginationComponent from "./numbered-pagination.svelte";
  import ErrorComponent from "./error.svelte";
  import InformationCircle from "./svgs/information-circle.svelte";

  const {
    result,
    valuesPerPage = 5,
    collapseLimit = 10,
    pXMLElemArrKey,
    nodeListKey,
  }: {
    result: Result<unknown[]>;
    valuesPerPage?: number;
    collapseLimit?: number;
    pXMLElemArrKey?: string;
    nodeListKey?: string;
  } = $props();

  const pagination = $derived(
    result.success ? getPagination(result.value, valuesPerPage) : null,
  );

  let topDivElement = $state<HTMLDivElement | null>(null);
</script>

{#snippet JSONInnerSnippet(props: ComponentProps<typeof JSONInnerComponent>)}
  <div
    class="border-b border-dotted border-gray-500 p-2 font-mono text-gray-700 first:rounded-t-xl
        last:rounded-b-xl last:border-b-0 hover:bg-gray-50/60"
  >
    <JSONInnerComponent {...props} />
  </div>
{/snippet}

<div bind:this={topDivElement}>
  <div class="break-all">
    {#if pagination !== null}
      {#each pagination.valuesForCurrentPage as value}
        {@render JSONInnerSnippet({
          value,
          pXMLElemArrKey,
          nodeListKey,
          collapseLimit,
        })}
      {/each}
    {:else if result.success}
      {#if result.value.length === 0}
        <div class="relative flex min-h-28 w-full items-center justify-center">
          <InformationCircle
            class="absolute inset-0 mx-auto size-28 text-gray-100/70"
          />

          <div class="relative size-max text-lg text-gray-400 italic">
            <span>No results to show</span>
          </div>
        </div>
      {:else}
        {@render JSONInnerSnippet({
          value: result.value,
          pXMLElemArrKey,
          nodeListKey,
          collapseLimit,
        })}
      {/if}
    {:else}
      <ErrorComponent error={result.value} />
    {/if}
  </div>

  {#if pagination !== null && pagination.totalPages > 1}
    <div class="w-full pt-2">
      <div class="mx-auto w-min">
        <NumberedPaginationComponent
          pages={pagination.pages}
          page={pagination.page}
          totalPages={pagination.totalPages}
          setPage={(p) => {
            pagination.setPage(p);
            tick().then(() =>
              topDivElement?.scrollIntoView({
                block: "start",
                inline: "nearest",
                behavior: "smooth",
              }),
            );
          }}
        />
      </div>
    </div>
  {/if}
</div>
