<script lang="ts">
  import type { HTMLButtonAttributes } from "svelte/elements";
  import type { SafeOmit } from "oai-pmh-2-js/model/oai-pmh";

  const {
    class: cls,
    children,
    ...restOfProps
  }: SafeOmit<HTMLButtonAttributes, "type"> = $props();
</script>

<button
  type="button"
  class={["border disabled:bg-gray-200", cls]}
  {...restOfProps}
>
  {@render children?.()}
</button>
