<!--
  @component
  A short form for large numbers: `<GoleCompact value={1234567} />` shows [01].[20]M.
  With `locale="en-IN"` the names are lakh and crore.
-->
<script lang="ts">
  import GoleFormat from "./GoleFormat.svelte";
  import type { GoleCompactProps } from "./types.js";

  let { compactDisplay, minimumFractionDigits, maximumFractionDigits, ...rest }: GoleCompactProps = $props();
</script>

<GoleFormat {...rest} options={{ notation: "compact", compactDisplay, minimumFractionDigits, maximumFractionDigits }} />
