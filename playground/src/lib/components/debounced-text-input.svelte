<script lang="ts">
  import type { HTMLInputAttributes } from "svelte/elements";

  const {
    type = "text",
    spellcheck = "false",
    value = "",
    placeholder,
    timeout = 700,
    onValueChanged,
    ...restOfProps
  }: HTMLInputAttributes & {
    timeout?: number;
    onValueChanged: (value: string) => void;
  } = $props();

  let to: ReturnType<typeof setTimeout> | null = null;

  function changeValueWithDebounce(value: string): void {
    if (to !== null) {
      clearTimeout(to);
    }

    to = setTimeout(() => {
      to = null;
      onValueChanged(value);
    }, timeout);
  }

  function changeValue(value: string): void {
    if (to !== null) {
      clearTimeout(to);
    }

    onValueChanged(value);
  }
</script>

<input
  {type}
  {spellcheck}
  {value}
  {placeholder}
  oninput={(event) => changeValueWithDebounce(event.currentTarget.value)}
  onblur={(event) => changeValue(event.currentTarget.value)}
  {...restOfProps}
/>
