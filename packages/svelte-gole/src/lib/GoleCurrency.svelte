<!--
  @component
  Money: `<GoleCurrency value={1234.5} currency="INR" />` shows ₹[12][34].[50].
-->
<script lang="ts">
  import GoleFormat from "./GoleFormat.svelte";
  import type { GoleCurrencyProps } from "./types.js";

  let { currency, currencyDisplay, minimumFractionDigits, maximumFractionDigits, ...rest }: GoleCurrencyProps = $props();
</script>

<GoleFormat {...rest} options={{ style: "currency", currency, currencyDisplay, minimumFractionDigits, maximumFractionDigits }} />
