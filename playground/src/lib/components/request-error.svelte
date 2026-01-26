<script module lang="ts">
  type TransformedError = {
    name?: string;
    message?: string;
    cause?: TransformedError;
    otherProperties?: string;
  };

  function transformError(error: unknown): TransformedError {
    // TODO: Arrays?
    if (typeof error === "object" && error !== null) {
      const te: TransformedError = {};

      if ("name" in error && typeof error.name === "string") {
        te.name = error.name;
      }

      if ("message" in error && typeof error.message === "string") {
        te.message = error.message;
      }

      if ("cause" in error) {
        te.cause = transformError(error.cause);
      }

      const otherPropertyNames = Object.getOwnPropertyNames(error).filter(
        (v) => !["name", "message", "cause"].includes(v),
      );

      if (otherPropertyNames.length !== 0) {
        te.otherProperties = JSON.stringify(
          Object.fromEntries(
            otherPropertyNames.map((key) => [
              key,
              error[key as keyof typeof error],
            ]),
          ),
          null,
          "\t",
        );
      }

      return te;
    }

    return {
      message: typeof error === "string" ? error : String(error),
    };
  }
</script>

<script lang="ts">
  const { error }: { error: unknown } = $props();
  const transformedError = $derived.by(() => {
    console.error(error);
    return transformError(error);
  });
</script>

{#snippet errorSnippet({
  name,
  message,
  cause,
  otherProperties,
}: TransformedError)}
  {#if name !== undefined || message !== undefined}
    <pre><code
        >{#if name !== undefined}<b>{name}</b
          >{": "}{/if}{#if message !== undefined}{message}{:else}<i
            >&lt;no message&gt;</i
          >{/if}</code
      ></pre>
  {:else}
    <p><i>&lt;no error name and message&gt;</i></p>
  {/if}

  {#if otherProperties !== undefined}
    <details>
      <summary><small>other properties</small></summary>

      <pre><code>{otherProperties}</code></pre>
    </details>
  {/if}

  {#if cause !== undefined}
    <p><small>caused by:</small></p>

    {@render errorSnippet(cause)}
  {/if}
{/snippet}

<hr />

<h2>⚠️Error</h2>
{@render errorSnippet(transformedError)}

<hr />

<small>(check console for more details)</small>
