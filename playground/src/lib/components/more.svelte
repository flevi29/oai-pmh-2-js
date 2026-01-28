<script lang="ts">
  import type { SVGAttributes } from "svelte/elements";

  const {
    fill = "currentColor",
    viewBox = "0 0 16 16",
    ...props
  }: SVGAttributes<EventTarget> = $props();
</script>

<svg {fill} {viewBox} {...props}
  ><path
    d="M8 2a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm0 4.5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm1.5 6a1.5 1.5 0 1 0-3 0 1.5 1.5 0 0 0 3 0Z"
  /></svg
>
