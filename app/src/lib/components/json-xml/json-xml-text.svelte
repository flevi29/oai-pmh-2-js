<script module lang="ts">
  import { isWhitespaceOnly } from "$lib/is-whitespace-only";

  const stringType = Object.freeze({
    normal: 0,
    long: 1,
    whiteSpace: 2,
  });
  type StringTypeType = typeof stringType;

  function getStringWithType(value: string):
    | {
        kind: StringTypeType["normal"];
        value: string;
      }
    | { kind: StringTypeType["long"]; value: string; short: string }
    | { kind: StringTypeType["whiteSpace"] } {
    if (isWhitespaceOnly(value)) {
      return { kind: stringType.whiteSpace };
    } else if (value.length > 100) {
      return { kind: stringType.long, value, short: value.slice(0, 100) };
    } else {
      return { kind: stringType.normal, value };
    }
  }
</script>

<script lang="ts">
  import Dialog from "../dialog.svelte";

  const { value, emptyColor }: { value: string; emptyColor: string } = $props();
  const valueWithType = $derived(getStringWithType(value));

  let dialogElement = $state.raw<Dialog | undefined>();
</script>

{#if valueWithType.kind === stringType.normal}
  {valueWithType.value}
{:else if valueWithType.kind === stringType.whiteSpace}
  <i style:color={emptyColor}>&lt;empty string&gt;</i>
{:else if valueWithType.kind === stringType.long}
  <Dialog bind:this={dialogElement} headerContent="Full text">
    <p style:white-space="pre-wrap">{valueWithType.value}</p>
  </Dialog>{valueWithType.short}<!-- svelte-ignore a11y_invalid_attribute --><a
    href="javascript:void(0)"
    onclick={() => dialogElement?.showModal()}>…</a
  >
{/if}
