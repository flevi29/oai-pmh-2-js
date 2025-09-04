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

<div class="min-w-52 rounded-lg bg-white p-1 shadow-md">
  {#each items as { name, value, isSelected }, i}
    {@const id = `${i}${componentId}`}
    {@const text = name !== undefined ? `${name} (${value})` : value}
    <label
      for={id}
      class="flex cursor-pointer items-center rounded-lg p-2.5 hover:bg-gray-100"
    >
      <span
        class="grow cursor-pointer pr-0.5 font-mono font-semibold text-gray-800"
        >{text}</span
      >
      <input {id} type="radio" {value} checked={isSelected} {onclick} />
    </label>
  {/each}
</div>
