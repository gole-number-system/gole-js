import { InjectionToken, type Provider } from "@angular/core";
import type { GoleBuild } from "@gole-number-system/gole-core";

/** Defaults for every Gole pipe and directive, see `provideGole`. */
export interface GoleConfig {
  /** Font build loaded on the page. Default `"ligature"`. */
  build?: GoleBuild;
  /** Locale for `[goleFormat]`, `[goleDate]` and `[goleTime]`. Default: Angular's `LOCALE_ID`. */
  locale?: string | string[];
}

/** Holds the defaults set by `provideGole`. Without a provider the Ligature build is used. */
export const GOLE_CONFIG = new InjectionToken<GoleConfig>("GOLE_CONFIG", {
  providedIn: "root",
  factory: () => ({}),
});

/**
 * Sets defaults for the Gole pipes and directives. Only needed when the app loads
 * the PUA build of the font or formats numbers for a fixed locale.
 *
 * ```ts
 * bootstrapApplication(AppComponent, {
 *   providers: [provideGole({ build: "pua", locale: "en-IN" })],
 * });
 * ```
 *
 * It also works in the `providers` of a component, for one part of the page.
 */
export function provideGole(config: GoleConfig = {}): Provider {
  return { provide: GOLE_CONFIG, useValue: config };
}
