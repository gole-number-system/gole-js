<!--
  @component
  A number formatted for a locale, in Gole. The currency sign, percent sign, unit
  and compact suffix keep the page font; only the digits are Gole symbols.

  ```svelte
  <GoleFormat value={1234.5} options={{ style: "currency", currency: "INR" }} />  ₹[12][34].[50]
  ```

  For the common cases use `<GoleCurrency>`, `<GolePercent>`, `<GoleCompact>` or `<GoleUnit>`.
-->
<script lang="ts">
  import { createGoleNumberFormat } from "@gole-number-system/gole-core";
  import { getGoleContext } from "./context.js";
  import Segments from "./Segments.svelte";
  import type { GoleFormatProps } from "./types.js";

  let { value, options, locale, minPairs, build, label, tag = "span", class: className, ...rest }: GoleFormatProps =
    $props();

  const context = getGoleContext();
  const formatter = $derived(
    createGoleNumberFormat({ ...options, locale: locale ?? context.locale, build: build ?? context.build, minPairs }),
  );
  const text = $derived(label ?? formatter.label(value));
</script>

<svelte:element this={tag} role="img" aria-label={text} data-value={text} {...rest} class={className ? `gole-number ${className}` : "gole-number"}><Segments segments={formatter.segments(value)} /></svelte:element>
