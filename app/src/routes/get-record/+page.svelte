<script lang="ts" module>
  import {
    getResultStore,
    getCachedResultValue,
  } from "$lib/stores/result.svelte";
  import type { OaiPmhRecord } from "oai-pmh-2-js/index";

  const cache = getCachedResultValue<OaiPmhRecord>();
</script>

<script lang="ts">
  import { getOaiPmhGetter } from "$lib/stores/oai-pmh.svelte";
  import MetadataPrefixPicker from "../list-metadata-formats/metadata-prefix-picker.svelte";
  import PaginatedResult from "$lib/components/paginated-result.svelte";
  import BaseFields from "$lib/components/base-fields.svelte";
  import DebouncedTextInput from "$lib/components/debounced-text-input.svelte";

  let identifier = $state.raw<string>();
  let metadataPrefix = $state.raw<string>();

  const r = getResultStore<OaiPmhRecord>(
    getOaiPmhGetter(),
    async function* (oaiPmh, signal) {
      yield [
        await oaiPmh.getRecord(identifier!, metadataPrefix!, {
          init: { signal },
        }),
      ];
    },
    cache,
  );

  let metadataPrefixPicker = $state.raw<MetadataPrefixPicker>();
</script>

<MetadataPrefixPicker
  bind:this={metadataPrefixPicker}
  onValueChanged={(v) => {
    metadataPrefix = v;
  }}
/>

<BaseFields
  onstart={() => r.run()}
  isStartDisabled={r.isRunning}
  onstop={() => r.stop()}
  isStopDisabled={!r.canBeStopped}
  isLoading={r.isRunning}
>
  <button type="button" onclick={() => metadataPrefixPicker?.open()}>
    <code>{metadataPrefix ?? "<select metadata prefix>"}</code>
  </button>

  <DebouncedTextInput
    value={identifier}
    placeholder="identifier"
    onValueChanged={(v) => {
      identifier = v;
    }}
  />
</BaseFields>

<PaginatedResult result={r.result} xmlPathPattern={/^\.about\.\d+$/} />
