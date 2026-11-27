<!-- Test helper: sets the Gole context, then renders one of every kind of component. -->
<script lang="ts">
  import { Gole, GoleCurrency, GoleSymbol, GoleText, setGoleContext, type GoleConfig } from "../src/lib/index.js";

  let { config }: { config: GoleConfig } = $props();

  // svelte-ignore state_referenced_locally
  setGoleContext(config);
</script>

<p data-testid="number"><Gole value={123} /></p>
<p data-testid="text"><GoleText text="Bill 7" /></p>
<p data-testid="symbol"><GoleSymbol value={5} /></p>
<p data-testid="currency"><GoleCurrency value={1234.5} currency="EUR" /></p>
