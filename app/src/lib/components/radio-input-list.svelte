<script lang="ts">
  import type { HTMLInputAttributes } from "svelte/elements";

  const {
    items,
    onclick,
  }: {
    items: { name?: string; value: string; isSelected: boolean }[];
  } & Pick<HTMLInputAttributes, "onclick"> = $props();
  const componentId = $props.id();
</script>

<!-- TODO: Option to reset? -->
<fieldset>
  <!-- TODO: <legend></legend> -->
  {#each items as { name, value, isSelected }, i}
    {@const id = `${componentId}.${i}`}
    {@const text = name !== undefined ? `${name} (${value})` : value}

    <label for={id}>
      <input {id} type="radio" {value} checked={isSelected} {onclick} />
      <code style:display="inline">{text}</code>
    </label>
  {/each}
</fieldset>
