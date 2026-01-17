<script lang="ts">
  import "@picocss/pico/css/pico.sand.min.css";
  import "../app.css";
  import { getLastOaiPmhUrl, setupOaiPmh } from "$lib/stores/oai-pmh.svelte";
  import OaiPmhURLInput from "./oai-pmh-url-input.svelte";
  import Navigation from "$lib/components/navigation.svelte";

  const { children } = $props();

  let url = $state.raw(getLastOaiPmhUrl());
  let isCorsProxied = $state.raw(true);

  setupOaiPmh(
    () => url,
    () => isCorsProxied,
  );
</script>

<header>
  <Navigation
    navigationObjects={[
      ["Identify", "/identify"],
      ["ListMetadataFormats", "/list-metadata-formats"],
      ["ListIdentifiers", "/list-identifiers"],
      ["ListRecords", "/list-records"],
      ["ListSets", "/list-sets"],
      ["GetRecord", "/get-record"],
    ]}
  />
</header>

<main class="mx-auto" style:max-width="64rem">
  <div class="pt-4">
    <OaiPmhURLInput bind:url bind:isCorsProxied />
  </div>

  <section class="mx-auto" style:max-width="52rem">
    {@render children()}
  </section>
</main>

<!-- TODO: page last updated, link to repository, license -->
<footer class="text-center"><p><small><i>FOOTER TODO</i></small></p></footer>
