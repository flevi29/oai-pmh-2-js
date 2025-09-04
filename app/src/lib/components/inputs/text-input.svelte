<script lang="ts">
  import type { HTMLInputAttributes } from "svelte/elements";
  import type { SafeOmit } from "oai-pmh-2-js/model/oai-pmh";

  const {
    spellcheck = "false",
    value = "",
    placeholder,
    timeout = 700,
    onValueChanged,
    ...restOfProps
  }: SafeOmit<HTMLInputAttributes, "type"> & {
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
  type="text"
  {spellcheck}
  {value}
  {placeholder}
  oninput={(event) => changeValueWithDebounce(event.currentTarget.value)}
  onblur={(event) => changeValue(event.currentTarget.value)}
  {...restOfProps}
/>
