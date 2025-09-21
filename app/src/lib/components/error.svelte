<script lang="ts">
  import ExclamationCircle from "./svgs/exclamation-circle.svelte";

  type TransformedError = {
    name?: string;
    message: string;
    cause?: TransformedError;
  };

  function transformError(error: unknown): TransformedError {
    if (
      typeof error === "object" &&
      error !== null &&
      "name" in error &&
      typeof error.name === "string" &&
      "message" in error &&
      typeof error.message === "string"
    ) {
      const transError: TransformedError = {
        name: error.name,
        message: error.message,
      };

      if ("cause" in error) {
        transError.cause = transformError(error.cause);
      }

      return transError;
    }

    return {
      message:
        typeof error === "string" ? error : JSON.stringify(error, null, 2),
    };
  }

  const { error }: { error: unknown } = $props();

  $effect(() => console.error(error));

  const transformedError = $derived(transformError(error));
</script>

<div
  class="relative rounded-lg border border-red-500 bg-red-100 p-4 text-red-800"
>
  <div class="absolute inset-0 size-full overflow-hidden text-red-200/50">
    <ExclamationCircle class="relative -left-7 -top-7 size-56" />
  </div>

  {#snippet errorDisplay(transformedError: TransformedError)}
    <h2 class="text-lg font-semibold">{transformedError.name}</h2>

    <p class="whitespace-pre-wrap">{transformedError.message}</p>

    {#if transformedError.cause !== undefined}
      <p>caused by:</p>

      <div class="pl-2">
        {@render errorDisplay(transformedError.cause)}
      </div>
    {/if}
  {/snippet}

  <div class="relative">
    {@render errorDisplay(transformedError)}

    <p class="text-sm">(check console for more details)</p>
  </div>
</div>
