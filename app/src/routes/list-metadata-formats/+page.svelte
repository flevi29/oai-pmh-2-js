<script lang="ts">
  import { getListMetadataFormatsResultStore } from "./list-metadata-formats.svelte";
  import Button from "$lib/components/buttons/button.svelte";
  import TextInput from "$lib/components/inputs/styled-text-input.svelte";
  import JSONComponent from "$lib/components/json.svelte";
  import Loading from "$lib/components/loading.svelte";

  let identifier = $state<string>();

  const r = getListMetadataFormatsResultStore(() => identifier);
</script>

<Button onclick={() => r.run()} disabled={r.isRunning}>Start</Button>

<Button onclick={() => r.stop()} disabled={!r.canBeStopped}>Stop</Button>

<Loading isLoading={r.isRunning} />

<TextInput
  value={identifier}
  placeholder="identifier"
  onValueChanged={(v) => {
    identifier = v || undefined;
  }}
/>

<JSONComponent result={r.result} valuesPerPage={10} />
