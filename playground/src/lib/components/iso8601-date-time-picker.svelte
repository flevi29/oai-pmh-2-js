<script module lang="ts">
  // import type { OaiPmhIdentify } from "oai-pmh-2-js/index";
  // import type { HTMLInputAttributes } from "svelte/elements";

  // function getInputType(
  //   granularity: OaiPmhIdentify["granularity"],
  // ): HTMLInputAttributes["type"] {
  //   switch (granularity) {
  //     case "YYYY-MM-DD":
  //       return "date";
  //     case "YYYY-MM-DDThh:mm:ssZ":
  //       return "datetime-local";
  //     default:
  //       throw new Error(`unknown granularity: ${granularity}`);
  //   }
  // }
  let cachedPickerValue: string | undefined = undefined;

  function getCachedPickerValue() {
    return cachedPickerValue;
  }

  function numberToZeroPaddedString(n: number, padding: number) {
    // repeatCount = `Math.trunc(Math.log10(n)) + 1`
    // would be the mathematically correct way
    // but performance-wise, not sure
    const str = String(n);
    return "0".repeat(padding - str.length) + str;
  }

  // TODO: Based on granularity might have to do YYYY-MM-DD
  function dateToISO8601String(value: string) {
    if (value === "") {
      return;
    }

    const date = new Date(value);
    const year = numberToZeroPaddedString(date.getFullYear(), 4);
    const month = numberToZeroPaddedString(date.getMonth() + 1, 2);
    const day = numberToZeroPaddedString(date.getDate(), 2);
    const hours = numberToZeroPaddedString(date.getHours(), 2);
    const minutes = numberToZeroPaddedString(date.getMinutes(), 2);
    return `${year}-${month}-${day}T${hours}:${minutes}:00Z`;
  }
</script>

<script lang="ts">
  const {
    label,
    onchange,
  }: { label: string; onchange: (v: string | undefined) => void } = $props();

  $effect(() => onchange(cachedPickerValue));
</script>

<label>
  {label}
  <input
    value={getCachedPickerValue()}
    type="datetime-local"
    onchange={({ currentTarget: { value } }) => {
      cachedPickerValue = value;
      onchange(dateToISO8601String(value));
    }}
  />
</label>
