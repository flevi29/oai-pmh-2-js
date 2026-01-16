<script lang="ts" generics="T">
  import { getTabs } from "$lib/tabs";
  import Enclosing, { type EnclosingType } from "./enclosing.svelte";
  import type { Snippet } from "svelte";

  const {
    list,
    depth,
    kind,
    inside,
  }: {
    list: T[];
    depth: number;
    kind: EnclosingType;
    inside: Snippet<[listItem: T, indentationStr: string, newDepth: number, i: number]>;
  } = $props();

  const newDepth = $derived(depth + 1);
</script>

{#if list.length !== 0}
  <Enclosing {kind}>
    {@const tabs = getTabs(newDepth)}
    {#each list as listItem, i}
      {@render inside(listItem, `\n${tabs}`, newDepth, i)}
    {/each}{"\n"}{getTabs(depth)}
  </Enclosing>
{:else}
  <Enclosing {kind} />
{/if}
