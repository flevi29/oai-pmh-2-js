<script module lang="ts">
  // https://picocss.com/docs/modal#utilities
  const modalOpenClass = "modal-is-open";
  let openDialogs = 0;

  function incrementOpenDialogs() {
    openDialogs += 1;

    if (openDialogs === 1) {
      document.body.classList.add(modalOpenClass);
    }
  }

  function decrementOpenDialogs() {
    openDialogs -= 1;

    if (openDialogs === 0) {
      document.body.classList.remove(modalOpenClass);
    }
  }
</script>

<script lang="ts">
  import type { HTMLDialogAttributes } from "svelte/elements";

  const {
    headerContent,
    children,
    onclose,
    ...restOfProps
  }: HTMLDialogAttributes & { headerContent: string } = $props();

  let dialogElement = $state.raw<HTMLDialogElement | null>(null);

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

  export { close, showModal };
</script>

<dialog
  bind:this={dialogElement}
  onclose={(...args) => {
    decrementOpenDialogs();
    onclose?.(...args);
  }}
  {...restOfProps}
>
  <article>
    <header>
      <!-- svelte-ignore a11y_invalid_attribute -->
      <a
        href="javascript:void(0)"
        aria-label="Close"
        rel="prev"
        onclick={(event) => {
          event.preventDefault();
          close();
        }}
      ></a>

      <p>
        <b>{headerContent}</b>
      </p>
    </header>

    {@render children?.()}
  </article>
</dialog>
