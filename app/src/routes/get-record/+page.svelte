<script lang="ts" module>
  import type { OaiPmhRecord } from "oai-pmh-2-js/mod";

  let initialValue: OaiPmhRecord[] | undefined = undefined;
</script>

<script lang="ts">
  import { getResultStore } from "$lib/stores/result.svelte";
  import Button from "$lib/components/buttons/button.svelte";
  import Loading from "$lib/components/loading.svelte";
  import TextInput from "$lib/components/inputs/styled-text-input.svelte";
  import MetadataPrefixPicker from "../list-metadata-formats/metadata-prefix-picker.svelte";
  import JSONComponent from "$lib/components/json.svelte";

  // TODO: These have to be reset on URL change
  let identifier = $state<string>();
  let metadataPrefix = $state<string>();

  const r = getResultStore<OaiPmhRecord>(async function* (oaiPmh, signal) {
    yield [await oaiPmh.getRecord(identifier!, metadataPrefix!, { init: { signal } })];
  }, initialValue);

  $effect(() => {
    initialValue = r.result.success ? r.result.value : undefined;
  });
</script>

<Button onclick={() => r.run()} disabled={r.isRunning}>Start</Button>

<Button onclick={() => r.stop()} disabled={!r.canBeStopped}>Stop</Button>

<Loading isLoading={r.isRunning} />

<TextInput
  value={identifier}
  placeholder="identifier"
  onValueChanged={(v) => {
    identifier = v;
  }}
/>

<MetadataPrefixPicker
  onValueChanged={(v) => {
    metadataPrefix = v;
  }}
/>

<JSONComponent
  result={r.result}
  collapseLimit={100}
  pXMLElemArrKey="about"
  nodeListKey="metadata"
/>
