<script lang="ts">
  import type { ComponentProps } from "svelte";
  import type { SafeOmit } from "oai-pmh-2-js/model/oai-pmh";
  import DebouncedTextInput from "./text-input.svelte";

  const props: SafeOmit<
    ComponentProps<typeof DebouncedTextInput>,
    "class"
  > = $props();
</script>

<DebouncedTextInput
  {...props}
  class="rounded-lg border border-gray-200 px-4 py-3 text-sm focus:border-blue-500 focus:ring-blue-500"
/>
