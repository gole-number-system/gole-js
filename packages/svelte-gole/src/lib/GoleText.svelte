<!--
  @component
  Mixed text with every number shown in Gole. Letters, punctuation and units keep
  the surrounding font; each run of digits is padded on its own.

  ```svelte
  <GoleText text="Invoice 5055-002347 · 20/11/2026 · 12:05" />
  <GoleText text="Total 1,234.5 kg" grouping="," />
  <GoleText tag="p" text={`Order ${orderId} ships in ${days} days`} />
  ```
-->
<script lang="ts">
  import { goleSegments } from "@gole-number-system/gole-core";
  import { getGoleContext } from "./context.js";
  import Segments from "./Segments.svelte";
  import type { GoleTextProps } from "./types.js";

  let { text, build, minPairs, decimalSeparator, grouping, tag = "span", ...rest }: GoleTextProps = $props();

  const context = getGoleContext();
  const segments = $derived(
    goleSegments(text, { build: build ?? context.build, minPairs, decimalSeparator, grouping }),
  );
</script>

<svelte:element this={tag} {...rest}><Segments {segments} labelled /></svelte:element>
