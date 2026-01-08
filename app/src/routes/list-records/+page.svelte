<script lang="ts" module>
  import type { OaiPmhRecord } from "oai-pmh-2-js/index";

  let initialValue: OaiPmhRecord[] | undefined = undefined;
</script>

<script lang="ts">
  import { getResultStore } from "$lib/stores/result.svelte";
  import Button from "$lib/components/buttons/button.svelte";
  import Loading from "$lib/components/loading.svelte";
  import TextInput from "$lib/components/inputs/styled-text-input.svelte";
  import SetPicker from "../list-sets/set-picker.svelte";
  import MetadataPrefixPicker from "../list-metadata-formats/metadata-prefix-picker.svelte";
  import JSONComponent from "$lib/components/json.svelte";

  // TODO: These have to be reset on URL change
  let from = $state<string>();
  let until = $state<string>();
  let set = $state<string>();
  let metadataPrefix = $state<string>();

  const r = getResultStore<OaiPmhRecord>(
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
    initialValue,
  );

  $effect(() => {
    initialValue = r.result.success ? r.result.value : undefined;
  });
</script>

<Button onclick={() => r.run()} disabled={r.isRunning}>Start</Button>

<Button onclick={() => r.stop()} disabled={!r.canBeStopped}>Stop</Button>

<Loading isLoading={r.isRunning} />

<TextInput
  value={from}
  placeholder="from"
  onValueChanged={(v) => {
    from = v;
  }}
/>

<TextInput
  value={until}
  placeholder="until"
  onValueChanged={(v) => {
    until = v;
  }}
/>

<SetPicker
  onValueChanged={(v) => {
    set = v;
  }}
/>

<MetadataPrefixPicker
  onValueChanged={(v) => {
    metadataPrefix = v;
  }}
/>

<JSONComponent
  result={r.result}
  pXMLElemArrKey="about"
  nodeListKey="metadata"
/>
