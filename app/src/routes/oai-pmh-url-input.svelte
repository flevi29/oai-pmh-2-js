<script module lang="ts">
  const SAVED_URLS_KEY = "saved-urls";

  const cachedUrls = (function (): Set<string> {
    const savedUrlsStr = localStorage.getItem(SAVED_URLS_KEY);
    if (savedUrlsStr === null) {
      return new Set();
    }

    try {
      const parsed = JSON.parse(savedUrlsStr);
      if (Array.isArray(parsed) && !parsed.some((v) => typeof v !== "string")) {
        return new Set(parsed as string[]);
      }
    } catch {}

    localStorage.removeItem(SAVED_URLS_KEY);
    return new Set();
  })();

  const savedUrlsListId = "saved-urls";

  // TODO: Only save urls, that successfully run
  //       And add datalist labels for their names perhaps combined with url
  function setSavedUrls(url: string) {
    cachedUrls.add(url);

    // maximum urls
    for (const savedUrl of cachedUrls) {
      if (cachedUrls.size <= 10) {
        break;
      }
      cachedUrls.delete(savedUrl);
    }

    localStorage.setItem(
      SAVED_URLS_KEY,
      JSON.stringify(Array.from(cachedUrls)),
    );
  }
</script>

<script lang="ts">
  import { setLastOaiPmhUrl } from "$lib/stores/oai-pmh.svelte";
  import DebouncedTextInput from "$lib/components/debounced-text-input.svelte";
  import Dialog from "$lib/components/dialog.svelte";
  import More from "$lib/components/svgs/more.svelte";
  import OaiPmhUrlList from "./oai-pmh-url-list.svelte";

  let {
    url = $bindable(),
    isCorsProxied = $bindable(),
  }: { url: string; isCorsProxied: boolean } = $props();

  const isUrlInvalid = $derived(!URL.canParse(url) || undefined);
  const urlsList = $derived.by(() => {
    if (!isUrlInvalid) {
      setSavedUrls(url);
      setLastOaiPmhUrl(url);
    }

    return Array.from(cachedUrls);
  });

  let dialogElement = $state.raw<Dialog | undefined>();
</script>

<Dialog bind:this={dialogElement} headerContent="Options">
  <fieldset>
    <label>
      <input type="checkbox" bind:checked={isCorsProxied} />
      <b>CORS Proxy</b>
    </label>

    <details>
      <summary><small><i>Why?</i></small></summary>

      <blockquote>
        <p>
          <a href="https://corsproxy.io/" rel="external" target="_blank"
            >CorsProxy</a
          > allows web applications to securely access resources from different domains,
          overcoming browser restrictions.
        </p>

        <p>
          Most OAI-PMH providers do not send proper <a
            href="https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Access-Control-Allow-Origin"
            rel="external"
            target="_blank"><code>Access-Control-Allow-Origin</code></a
          >
          headers, so modern browsers block their response from being read from ECMAScript
          code.
        </p>

        <p>
          This setting mitigates this problem by proxying the OAI-PMH server
          response through a service that adds the appropriate headers.
        </p>
      </blockquote>
    </details>
  </fieldset>

  <hr />

  <OaiPmhUrlList
    useUrl={(v) => {
      url = v;
      dialogElement?.close();
    }}
  />
</Dialog>

<datalist id={savedUrlsListId}>
  {#each urlsList as savedUrl}
    <option value={savedUrl}></option>
  {/each}
</datalist>

<!-- svelte-ignore a11y_no_redundant_roles: needed for picocss -->
<fieldset role="group">
  <DebouncedTextInput
    type="url"
    list={savedUrlsListId}
    aria-invalid={isUrlInvalid}
    placeholder="Type OAI-PMH URL here..."
    value={url}
    onValueChanged={(v) => {
      url = v;
    }}
  />

  <button type="button" onclick={() => dialogElement?.showModal()}>
    <More class="size-5" />
  </button>
</fieldset>
