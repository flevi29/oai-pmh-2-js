<script module lang="ts">
  const BODY_CLASSES = ["blur-sm"];
  let openDialogs = 0;

  function incrementOpenDialogs() {
    openDialogs += 1;

    if (openDialogs === 1) {
      document.body.classList.add(...BODY_CLASSES);
    }
  }

  function decrementOpenDialogs() {
    openDialogs -= 1;

    if (openDialogs === 0) {
      document.body.classList.remove(...BODY_CLASSES);
    }
  }
</script>

<script lang="ts">
  import type { HTMLDialogAttributes } from "svelte/elements";
  import XMark from "./svgs/x-mark.svelte";

  const {
    class: cls,
    children,
    onclose,
    ...restOfProps
  }: HTMLDialogAttributes = $props();

  let dialogElement = $state<HTMLDialogElement | null>(null);

  function close(): void {
    if (dialogElement?.open) {
      dialogElement.close();
    }
  }

  function showModal(): void {
    if (dialogElement !== null && !dialogElement.open) {
      dialogElement.showModal();
      incrementOpenDialogs();
    }
  }

  $effect(() => close);

  export { close, showModal };
</script>

<dialog
  class={[
    "m-0 max-h-dvh max-w-none bg-transparent backdrop:bg-blue-300/20 focus:outline-none",
    cls,
  ]}
  bind:this={dialogElement}
  onclose={(...props) => {
    decrementOpenDialogs();
    onclose?.(...props);
  }}
  {...restOfProps}
>
  <div class="flex flex-col items-center gap-y-3 pt-10">
    <div class="self-end">
      <button
        class="rounded-full bg-gray-500/20 p-1 text-gray-800 hover:bg-gray-500/50"
        type="button"
        onclick={() => dialogElement?.close()}
      >
        <XMark />
      </button>
    </div>

    {@render children?.()}
  </div>
</dialog>
