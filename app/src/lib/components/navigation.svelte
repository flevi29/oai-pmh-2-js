<script lang="ts">
  import { page } from "$app/state";
  import { resolve } from "$app/paths";
  import { setLastVisitedOaiPmhAction } from "$lib/stores/last-visited-oai-pmh-action";

  const {
    navigationObjects,
  }: {
    navigationObjects: [name: string, route: Parameters<typeof resolve>[0]][];
  } = $props();

  const resolvedNavigationObjects = $derived(
    navigationObjects.map(([name, route]) => {
      const resolvedPathname = resolve(route);

      return {
        name,
        resolvedPathname,
        isActive: page.url.pathname.indexOf(resolvedPathname) === 0,
      };
    }),
  );

  const currentPageName = $derived(
    resolvedNavigationObjects.find((v) => v.isActive)?.name ??
      "<no active page>",
  );

  let isOpen = $state.raw(false);
</script>

<svelte:head>
  <title>{currentPageName}</title>
</svelte:head>

<nav>
  <ul class="grow max-w-full text-center" style:margin-left="0">
    <li class="grow p-0">
      <details class="dropdown" bind:open={isOpen}>
        <!-- svelte-ignore a11y_no_redundant_roles -->
        <summary role="button" class="outline text-center"
          ><u>{currentPageName}</u></summary
        >

        <ul class="text-center">
          {#each resolvedNavigationObjects as { name, resolvedPathname, isActive }}
            {#if !isActive}
              <li>
                <a
                  href={resolvedPathname}
                  onclick={() => {
                    isOpen = false;
                    setLastVisitedOaiPmhAction(resolvedPathname);
                  }}
                >
                  {name}
                </a>
              </li>
            {/if}
          {/each}
        </ul>
      </details>
    </li>
  </ul>
</nav>
