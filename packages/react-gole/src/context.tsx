import { createContext, useContext, useMemo, type ReactNode } from "react";
import type { GoleBuild, GoleOptions } from "@gole-number-system/gole-core";

export interface GoleConfig {
  /** Font build loaded on the page. Default `"ligature"`. */
  build: GoleBuild;
  /** Decimal separator used when converting mixed text. Default `"."`. */
  decimalSeparator?: GoleOptions["decimalSeparator"];
  /** Thousands separator to strip from numbers in mixed text. Default: none. */
  grouping?: GoleOptions["grouping"];
  /** Locale for `<GoleFormat>`, `<GoleCurrency>` and the other locale-aware components. Default: the runtime's locale. */
  locale?: string | string[];
}

const GoleContext = createContext<GoleConfig>({ build: "ligature" });

export interface GoleProviderProps extends Partial<GoleConfig> {
  children?: ReactNode;
}

/**
 * Sets defaults for every Gole component below it. Only needed when the app uses the
 * PUA build or a non-default separator; without a provider the Ligature build is assumed.
 */
export function GoleProvider({ build = "ligature", decimalSeparator, grouping, locale, children }: GoleProviderProps) {
  const localeKey = Array.isArray(locale) ? locale.join(",") : locale;
  const config = useMemo(
    () => ({ build, decimalSeparator, grouping, locale }),
    [build, decimalSeparator, grouping, localeKey],
  );
  return <GoleContext.Provider value={config}>{children}</GoleContext.Provider>;
}

/** The Gole defaults set by the nearest `<GoleProvider>`. */
export function useGoleConfig(): GoleConfig {
  return useContext(GoleContext);
}

/** Component props win over the provider; `undefined` props fall back to it. */
export function useGoleOptions(props: GoleOptions): GoleOptions {
  const config = useGoleConfig();
  return {
    build: props.build ?? config.build,
    decimals: props.decimals,
    minPairs: props.minPairs,
    decimalSeparator: props.decimalSeparator ?? config.decimalSeparator,
    grouping: props.grouping ?? config.grouping,
  };
}
