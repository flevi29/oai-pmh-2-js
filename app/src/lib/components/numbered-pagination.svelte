<script lang="ts">
  const {
    page,
    totalPages,
    setPage,
  }: {
    page: number;
    totalPages: number;
    setPage: (page: number) => void;
  } = $props();
</script>

<nav>
  <button type="button" disabled={page === 1} onclick={() => setPage(page - 1)}>
    Prev
  </button>

  <small><code>{page}/{totalPages}</code></small>

  <button
    type="button"
    disabled={page === totalPages}
    onclick={() => setPage(page + 1)}
  >
    Next
  </button>
</nav>
