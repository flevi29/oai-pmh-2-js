<script module lang="ts">
  import { asset } from "$app/paths";
  import type { Asset } from "$app/types";

  type ValidProviderObject = {
    url: string;
    repositoryName: string;
    accessControlAllowOrigin: string | null;
  };

  type ValidProviders = Exclude<
    Asset,
    "/favicon.png" | "/robots.txt" | "/valid-providers/date.json"
  >;

  // TODO: This doesn't err if non-existent keys appear because of `(string & {})`
  const validProviderAssetPaths = Object.keys({
    "/valid-providers/providers-0.json": true,
    "/valid-providers/providers-1.json": true,
    "/valid-providers/providers-2.json": true,
    "/valid-providers/providers-3.json": true,
    "/valid-providers/providers-4.json": true,
    "/valid-providers/providers-5.json": true,
  } satisfies { [TKey in ValidProviders]: true }).map(asset);
</script>

<script lang="ts">
  import Pagination from "$lib/components/pagination.svelte";

  const { useUrl }: { useUrl: (url: string) => void } = $props();

  // TODO: Find out why the following doesn't work
  // import(asset("/valid-providers/date.json"), { with: { type: "json" } });

  let pagination = $state.raw<Pagination<ValidProviderObject>>();

  // TODO: Fetch only when parent dialog is opened
  const datePromise = fetch(asset("/valid-providers/date.json")).then(
    (response) => {
      if (!response.ok) {
        throw new Error("failed to fetch");
      }

      return response.json() as Promise<string>;
    },
  );

  let i = $state(0);
  let parsedValues = $state.raw<ValidProviderObject[]>();
  const canParseNext = $derived(i < validProviderAssetPaths.length);

  let isFetching = $state(false);
  function fetchNext() {
    if (!canParseNext) {
      throw new Error("there are no more files to parse");
    }

    isFetching = true;
    fetch(validProviderAssetPaths[i]!)
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(
            `${response.status} ${response.statusText}: ${await response.text()}`,
            { cause: response },
          );
        }

        const responseJson = (await response.json()) as ValidProviderObject[];
        i += 1;

        parsedValues = responseJson;
      })
      .catch((reason) => {
        console.error(reason);
        parsedValues = undefined;
      })
      .finally(() => {
        isFetching = false;
      });
  }
</script>

{#snippet buttonSnippet(title: string)}
  <button
    type="button"
    onclick={() => fetchNext()}
    disabled={isFetching || !canParseNext}>{title}</button
  >
{/snippet}

<h3>URL List</h3>

<p>
  <small>
    <i>
      last updated:
      {#await datePromise}
        ...loading
      {:then date}
        {@const localDate = new Date(date).toString()}
        {localDate}
      {:catch}
        &lt;failed to fetch date&gt;
      {/await}
    </i>
  </small>
</p>

<Pagination bind:this={pagination} values={parsedValues}>
  {#snippet valueSnippet(valuesSlice, isLastPage)}
    <ul>
      {#each valuesSlice as value}
        <li>
          <!-- svelte-ignore a11y_invalid_attribute -->
          <a href="javascript:void(0)" onclick={() => useUrl(value.url)}
            >{value.repositoryName}</a
          >
        </li>
      {/each}
    </ul>

    {#if isLastPage}
      <div role="group">
        {@render buttonSnippet("More")}
      </div>
    {/if}
  {/snippet}
  {#snippet pendingSnippet()}
    {@render buttonSnippet("Fetch valid providers")}
  {/snippet}
</Pagination>
