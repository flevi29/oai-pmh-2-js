<script lang="ts">
  import "@picocss/pico/css/pico.sand.min.css";
  import "../app.css";
  import { PUBLIC_REPOSITORY_URL } from "$env/static/public";
  import { getLastOaiPmhUrl, setupOaiPmh } from "$lib/stores/oai-pmh.svelte";
  import OaiPmhURLInput from "./oai-pmh-url-input.svelte";
  import Navigation from "$lib/components/navigation.svelte";

  const { children } = $props();

  let url = $state(getLastOaiPmhUrl());
  let isCorsProxied = $state(true);
  let isUsingPost = $state(false);

  setupOaiPmh(
    () => url,
    () => isCorsProxied,
    () => isUsingPost,
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
  <div style:padding-top="calc(var(--spacing) * 4)">
    <OaiPmhURLInput bind:url bind:isCorsProxied bind:isUsingPost />
  </div>

  <section class="mx-auto" style:max-width="52rem">
    {@render children()}
  </section>
</main>

<footer class="text-center">
  <hr />
  <p><a href={PUBLIC_REPOSITORY_URL}><small><i>repository</i></small></a></p>
</footer>
