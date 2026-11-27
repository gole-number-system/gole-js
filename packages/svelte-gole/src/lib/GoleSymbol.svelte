<!--
  @component
  A single Gole symbol, for glyph tables, legends and teaching material: `<GoleSymbol value={35} />`.
-->
<script lang="ts">
  import { goleSymbol } from "@gole-number-system/gole-core";
  import { getGoleContext } from "./context.js";
  import type { GoleSymbolProps } from "./types.js";

  let { value, build, class: className, ...rest }: GoleSymbolProps = $props();

  const context = getGoleContext();
</script>

<span role="img" aria-label={String(value)} {...rest} class={className ? `gole gole-symbol ${className}` : "gole gole-symbol"}>{goleSymbol(value, build ?? context.build)}</span>
