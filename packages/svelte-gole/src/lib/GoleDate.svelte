<!--
  @component
  A date in Gole inside a `<time>` element. Day, month and each half of the year
  are one symbol each: `<GoleDate value="2026-11-20" />` shows `[20]/[11]/[20][26]`.
  Default format `"DD/MM/YYYY"`. Renders nothing for an invalid date.

  ```svelte
  <GoleDate value={order.createdAt} format="DD/MM/YY HH:mm" />
  <GoleDate value={order.createdAt} format={{ dateStyle: "medium" }} locale="en-IN" />
  ```
-->
<script lang="ts">
  import { goleDateLabel, goleSegments } from "@gole-number-system/gole-core";
  import { getGoleContext } from "./context.js";
  import Segments from "./Segments.svelte";
  import type { GoleDateProps } from "./types.js";

  let { value, format = "DD/MM/YYYY", locale, utc, build, class: className, ...rest }: GoleDateProps = $props();

  const context = getGoleContext();
  const date = $derived(value instanceof Date ? value : new Date(value));
  const valid = $derived(!Number.isNaN(date.getTime()));
  const text = $derived(valid ? goleDateLabel(date, { format, locale: locale ?? context.locale, utc }) : "");
  const segments = $derived(goleSegments(text, { build: build ?? context.build, decimalSeparator: false }));
</script>

{#if valid}<time datetime={date.toISOString()} role="img" aria-label={text} {...rest} class={className ? `gole-number ${className}` : "gole-number"}><Segments {segments} /></time>{/if}
