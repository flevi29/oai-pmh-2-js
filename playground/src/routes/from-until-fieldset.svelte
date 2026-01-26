<script lang="ts">
  import Iso8601DateTimePicker from "$lib/components/iso8601-date-time-picker.svelte";

  // import type { HTMLInputAttributes } from "svelte/elements";

  // import { getOaiPmhGetter } from "$lib/stores/oai-pmh.svelte";
  // import { getResultStore, resultStatus } from "$lib/stores/result.svelte";
  // import { cache } from "./+page.svelte";

  // const r = getResultStore<OaiPmhIdentify>(
  //   getOaiPmhGetter(),
  //   async function* (oaiPmh, signal) {
  //     yield [await oaiPmh.identify({ init: { signal } })];
  //   },
  //   cache,
  // );

  // //
  // const fizz = $derived.by(() => {
  //   if (r.result.status === resultStatus.pending) {
  //     return;
  //   }

  //   if (
  //     r.result.status === resultStatus.failure ||
  //     r.result.value.length !== 1
  //   ) {
  //     return {};
  //   }

  //   const { earliestDatestamp, granularity } = r.result.value[0]!;
  //   const inputType = getInputType(granularity);

  //   // YYYY-MM-DDTHH:mm
  //   // yyyy-mm-dd
  //   const parsedDate = new Date(earliestDatestamp);

  //   const year = numberToString(parsedDate.getUTCFullYear(), 4);
  //   const month = numberToString(parsedDate.getUTCMonth(), 2);
  //   const day = numberToString(parsedDate.getUTCDay(), 2);

  //   let htmlDatePickerCompliantDate = `${year}-${month}-${day}`;
  //   if (inputType === "datetime-local") {
  //     const hours = numberToString(parsedDate.getUTCHours(), 2);
  //     const minutes = numberToString(parsedDate.getUTCMinutes(), 2);
  //     htmlDatePickerCompliantDate += `T${hours}:${minutes}`;
  //   }

  //   console.log(htmlDatePickerCompliantDate);

  //   return { htmlDatePickerCompliantDate, inputType };
  // });

  // r.run();

  type OnChange = (v: string | undefined) => void;
  const { onFrom, onUntil }: { onFrom: OnChange; onUntil: OnChange } = $props();
</script>

<div class="grid">
  <Iso8601DateTimePicker label="From" onchange={onFrom} />

  <Iso8601DateTimePicker label="Until" onchange={onUntil} />
</div>
