<!-- Test helper: one element that uses the action with options, one that uses it on its own text. -->
<script lang="ts">
  import { gole, type GoleActionOptions } from "../src/lib/index.js";

  let { options }: { options?: GoleActionOptions } = $props();
</script>

<span data-testid="value" use:gole={options}></span>
<span data-testid="own" use:gole>Bill 505-2347</span>
