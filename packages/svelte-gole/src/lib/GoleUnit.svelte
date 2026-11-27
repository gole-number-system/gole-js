<!--
  @component
  A measurement: `<GoleUnit value={72} unit="kilometer-per-hour" />` shows [72] km/h.
-->
<script lang="ts">
  import GoleFormat from "./GoleFormat.svelte";
  import type { GoleUnitProps } from "./types.js";

  let { unit, unitDisplay, minimumFractionDigits, maximumFractionDigits, ...rest }: GoleUnitProps = $props();
</script>

<GoleFormat {...rest} options={{ style: "unit", unit, unitDisplay, minimumFractionDigits, maximumFractionDigits }} />
