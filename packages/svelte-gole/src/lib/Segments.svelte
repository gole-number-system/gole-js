<!--
  Internal: the digits of each number in the Gole font, everything else as plain text.
  With `labelled` every number is its own labelled element, for use inside running text.
  The markup stays on one line so no whitespace ends up between the parts.
-->
<script lang="ts">
  import type { GoleNumberSegment, GoleSegment } from "@gole-number-system/gole-core";

  let { segments, labelled = false }: { segments: GoleSegment[]; labelled?: boolean } = $props();
</script>

{#snippet digits(segment: GoleNumberSegment)}<span class="gole">{segment.integer}</span>{segment.separator}{#if segment.fraction}<span class="gole">{segment.fraction}</span>{/if}{/snippet}

{#each segments as segment}{#if segment.type === "text"}{segment.text}{:else if labelled}<span class="gole-number" role="img" aria-label={segment.value}>{@render digits(segment)}</span>{:else}{@render digits(segment)}{/if}{/each}
