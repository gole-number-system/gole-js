<!--
  @component
  A ratio as a percentage: `<GolePercent value={0.456} />` shows [46]%. The value is multiplied by 100.
-->
<script lang="ts">
  import GoleFormat from "./GoleFormat.svelte";
  import type { GolePercentProps } from "./types.js";

  let { minimumFractionDigits, maximumFractionDigits, ...rest }: GolePercentProps = $props();
</script>

<GoleFormat {...rest} options={{ style: "percent", minimumFractionDigits, maximumFractionDigits }} />
