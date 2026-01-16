<script module lang="ts">
  import type { Asset } from "$app/types";

  type ValidProviders = Exclude<
    Asset,
    "/favicon.png" | "/robots.txt" | "/valid-providers/date.json"
  >;

  const validProviderAssetPaths = Object.keys({
    "/valid-providers/providers-0.json": true,
    "/valid-providers/providers-1.json": true,
    "/valid-providers/providers-2.json": true,
    "/valid-providers/providers-3.json": true,
    "/valid-providers/providers-4.json": true,
    "/valid-providers/providers-5.json": true,
    "/valid-providers/providers-6.json": true,
    "/valid-providers/providers-7.json": true,
  } satisfies { [TKey in ValidProviders]: true }) as ValidProviders[];
</script>

<script lang="ts">
  import { asset } from "$app/paths";

  // TODO: Find out why the following doesn't work
  // import(asset("/valid-providers/date.json"), { with: { type: "json" } });

  // TODO: Fetch only when parent dialog is opened
  const datePromise = fetch(asset("/valid-providers/date.json")).then(
    (response) => {
      if (!response.ok) {
        throw new Error("failed to fetch");
      }

      return response.json();
    },
  );

  let i = $state(0);
  let parsed = $state.raw<
    {
      url: string;
      id: string;
      name: string;
      requiredHeader: string | null;
    }[]
  >([]);
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

        const responseJson = await response.json();
        i += 1;

        parsed = parsed.concat(responseJson);
      })
      .catch(console.error)
      .finally(() => {
        isFetching = false;
      });
  }
</script>

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

<!-- TODO: Paginated list + better structure/styling -->
{#if parsed.length !== 0}
  <ul>
    {#each parsed as { url, name }}
      <li>
        {name}
        <ul><li><code>{url}</code></li></ul>
      </li>
    {/each}
  </ul>
{/if}

<button
  type="button"
  onclick={() => fetchNext()}
  disabled={isFetching || !canParseNext}>Fetch next</button
>
