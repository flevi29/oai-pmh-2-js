<script module lang="ts">
  import { asset } from "$app/paths";

  type ValidProviderObject = {
    url: string;
    repositoryName: string;
  };

  const urlListPath = asset("/valid-providers/cors.json");
</script>

<script lang="ts">
  import Pagination from "$lib/components/pagination.svelte";

  const { useUrl }: { useUrl: (url: string) => void } = $props();

  // TODO: Find out why the following doesn't work
  // import(asset("/valid-providers/date.json"), { with: { type: "json" } });

  const datePromise = fetch(asset("/valid-providers/date.json")).then(
    (response) => {
      if (!response.ok) {
        throw new Error("failed to fetch");
      }

      return response.json() as Promise<string>;
    },
  );

  // TODO: how about the full list, should give URL?

  let i = $state(0);
  let parsedValues = $state.raw<ValidProviderObject[]>();
  let canFetch = $state(true);

  let isFetching = $state(false);
  function fetchList() {
    isFetching = true;
    fetch(urlListPath)
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
        canFetch = false;
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
    onclick={() => fetchList()}
    disabled={isFetching || !canFetch}>{title}</button
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

<Pagination values={parsedValues}>
  {#snippet valueSnippet(valuesSlice)}
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
  {/snippet}
  {#snippet pendingSnippet()}
    {@render buttonSnippet("Fetch valid providers")}
  {/snippet}
</Pagination>
