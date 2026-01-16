<script lang="ts">
  const { isLoading }: { isLoading: boolean } = $props();
</script>

<progress style:visibility={isLoading ? undefined : "hidden"} max="100"
></progress>
