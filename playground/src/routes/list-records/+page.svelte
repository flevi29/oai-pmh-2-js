<script lang="ts" module>
  import {
    getResultStore,
    getCachedResultValue,
  } from "$lib/stores/result.svelte";
  import type { OaiPmhRecord } from "oai-pmh-2-js/index";

  export const cache = getCachedResultValue<OaiPmhRecord>();
</script>

<script lang="ts">
  import { getOaiPmhGetter } from "$lib/stores/oai-pmh.svelte";
  import SetPicker from "../list-sets/set-picker.svelte";
  import MetadataPrefixPicker from "../list-metadata-formats/metadata-prefix-picker.svelte";
  import BaseFields from "$lib/components/base-fields.svelte";
  import FromUntilFieldset from "../from-until-fieldset.svelte";
  import PaginatedResult from "$lib/components/paginated-result.svelte";

  let from = $state.raw<string>();
  let until = $state.raw<string>();
  let set = $state.raw<string>();
  let metadataPrefix = $state.raw<string>();

  const r = getResultStore<OaiPmhRecord>(
    getOaiPmhGetter(),
    (oaiPmh, signal) =>
      oaiPmh.listRecords(
        {
          from,
          until,
          set,
          // let OAI-PMH provider return error about this required property
          metadataPrefix: metadataPrefix!,
        },
        { init: { signal } },
      ),
    cache,
  );

  let metadataPrefixPicker = $state.raw<MetadataPrefixPicker>();
  let setPicker = $state.raw<SetPicker>();
</script>

<SetPicker
  bind:this={setPicker}
  onValueChanged={(v) => {
    set = v;
  }}
/>
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
  <div role="group">
    <button type="button" onclick={() => setPicker?.open()}>
      <code>{set ?? "<select set>"}</code>
    </button>

    <button type="button" onclick={() => metadataPrefixPicker?.open()}>
      <code>{metadataPrefix ?? "<select metadata prefix>"}</code>
    </button>
  </div>

  <FromUntilFieldset
    onFrom={(v) => {
      from = v;
    }}
    onUntil={(v) => {
      until = v;
    }}
  />
</BaseFields>

<PaginatedResult
  result={r.result}
  valuesPerPage={2}
  xmlPathPattern={/^\.\d+\.about\.\d+$/}
/>
