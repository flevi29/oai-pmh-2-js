<script module lang="ts">
  export type EnclosingType =
    | "curly-braces"
    | "square-brackets"
    | "angle-brackets"
    | "empty";

  function getEnclosingCharacters(
    kind: EnclosingType,
  ): [opening: string, closing: string] {
    switch (kind) {
      case "curly-braces":
        return ["{", "}"];
      case "square-brackets":
        return ["[", "]"];
      case "angle-brackets":
        return ["<", ">"];
      case "empty":
        return ["", ""];
    }
  }

  const color = "#458588";
</script>

<script lang="ts">
  import type { Snippet } from "svelte";

  const { kind, children }: { kind: EnclosingType; children?: Snippet } =
    $props();

  const [opening, closing] = $derived(getEnclosingCharacters(kind));
</script>

<span style:color>{opening}</span
>{#if children !== undefined}{@render children()}{/if}<span style:color
  >{closing}</span
>
