import { getContext, setContext } from "svelte";
import type { GoleBuild } from "@gole-number-system/gole-core";

export interface GoleConfig {
  /** Font build loaded on the page. Default `"ligature"`. */
  build?: GoleBuild;
  /** Locale for `<GoleFormat>`, `<GoleCurrency>`, `<GoleDate>` and the other locale-aware components. Default: the runtime's locale. */
  locale?: string | string[];
}

const KEY = Symbol("gole");

/**
 * Sets defaults for every Gole component below the calling component. Only needed
 * when the app uses the PUA build or a fixed locale. Call it while the component
 * is set up, for example in the root layout:
 *
 * ```svelte
 * <script>
 *   import { setGoleContext } from "@gole-number-system/svelte-gole";
 *   setGoleContext({ build: "pua", locale: "en-IN" });
 * </script>
 * ```
 *
 * Pass a `$state` object to change the defaults later.
 */
export function setGoleContext(config: GoleConfig): GoleConfig {
  return setContext(KEY, config);
}

/** The Gole defaults set by the nearest `setGoleContext`, or `{}`. Call it while the component is set up. */
export function getGoleContext(): GoleConfig {
  return getContext<GoleConfig | undefined>(KEY) ?? {};
}
