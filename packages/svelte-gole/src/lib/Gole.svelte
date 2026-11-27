<!--
  @component
  One number in Gole.

  ```svelte
  <Gole value={987654} />               [98][76][54]
  <Gole value={12747.2} decimals={2} /> [01][27][47].[20]
  <Gole value={-4.5} />                 -[04].[50]
  ```

  The padding is added for you. Screen readers get the decimal value, and with the
  Ligature build copy-paste gives plain digits.
-->
<script lang="ts">
  import { goleLabel, goleSegments } from "@gole-number-system/gole-core";
  import { getGoleContext } from "./context.js";
  import Segments from "./Segments.svelte";
  import type { GoleProps } from "./types.js";

  let { value, decimals, minPairs, build, label, tag = "span", class: className, ...rest }: GoleProps = $props();

  const context = getGoleContext();
  const options = $derived({ build: build ?? context.build, decimals, minPairs });
  const text = $derived(label ?? goleLabel(value, options));
</script>

<svelte:element this={tag} role="img" aria-label={text} data-value={text} {...rest} class={className ? `gole-number ${className}` : "gole-number"}><Segments segments={goleSegments(value, options)} /></svelte:element>
