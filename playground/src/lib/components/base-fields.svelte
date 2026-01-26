<script lang="ts">
  import type { Snippet } from "svelte";
  import Loading from "./loading.svelte";

  const {
    children,
    onstart,
    onstop,
    isStartDisabled,
    isStopDisabled,
    isLoading,
  }: {
    children?: Snippet;
    onstart: () => void;
    onstop: () => void;
    isStartDisabled: boolean;
    isStopDisabled: boolean;
    isLoading: boolean;
  } = $props();
</script>

<Loading {isLoading} />

<fieldset>
  {#if children !== undefined}
    <details open>
      <summary>Options:</summary>

      {@render children()}
    </details>
  {/if}

  <div role="group">
    <button type="button" onclick={() => onstart()} disabled={isStartDisabled}>
      Start
    </button>

    <button
      type="button"
      class="secondary"
      onclick={() => onstop()}
      disabled={isStopDisabled}
    >
      Stop
    </button>
  </div>
</fieldset>
