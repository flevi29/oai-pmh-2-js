<script lang="ts">
  import type { SVGAttributes } from "svelte/elements";

  const {
    fill = "none",
    stroke = "currentColor",
    viewBox = "0 0 24 24",
    "stroke-width": strokeWidth = "1.5",
    ...props
  }: SVGAttributes<EventTarget> = $props();
</script>

<svg {fill} {stroke} stroke-width={strokeWidth} {viewBox} {...props}>
  <path
    stroke-linecap="round"
    stroke-linejoin="round"
    d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244"
  />
</svg>
