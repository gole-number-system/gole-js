import { createContext, useContext, useMemo, type ReactNode } from "react";
import type { GoleBuild, GoleOptions } from "@gole-number-system/gole-core";
import { goleFontFamily } from "./fonts";

export interface GoleConfig {
  /** Font build loaded in the app. Default `"pua"`. */
  build: GoleBuild;
  /** Name the font was loaded under. Default: `goleFontFamily(build)`. */
  fontFamily?: string;
  /** Locale for `<GoleFormat>`, `<GoleCurrency>` and the other locale-aware components. Default: the runtime's locale. */
  locale?: string | string[];
  /** Decimal separator used when converting mixed text. Default `"."`. */
  decimalSeparator?: GoleOptions["decimalSeparator"];
  /** Thousands separator to strip from numbers in mixed text. Default: none. */
  grouping?: GoleOptions["grouping"];
}

const GoleContext = createContext<GoleConfig>({ build: "pua" });

export interface GoleProviderProps extends Partial<GoleConfig> {
  children?: ReactNode;
}

/**
 * Sets defaults for every Gole component below it. Only needed when the app uses the
 * Ligature build, a font loaded under another name, or a fixed locale.
 *
 * ```tsx
 * <GoleProvider build="ligature" locale="en-IN">…</GoleProvider>
 * <GoleProvider fontFamily="MyGoleFont">…</GoleProvider>
 * ```
 */
export function GoleProvider({
  build = "pua",
  fontFamily,
  locale,
  decimalSeparator,
  grouping,
  children,
}: GoleProviderProps) {
  const localeKey = Array.isArray(locale) ? locale.join(",") : locale;
  const config = useMemo(
    () => ({ build, fontFamily, locale, decimalSeparator, grouping }),
    [build, fontFamily, localeKey, decimalSeparator, grouping],
  );
  return <GoleContext.Provider value={config}>{children}</GoleContext.Provider>;
}

/** The Gole defaults set by the nearest `<GoleProvider>`. */
export function useGoleConfig(): GoleConfig {
  return useContext(GoleContext);
}

/** Props shared by every component: which font build to write for and what the font is called. */
export interface GoleFontProps {
  /** Font build. Default: from `<GoleProvider>`, otherwise `"pua"`. */
  build?: GoleBuild;
  /** Name the font was loaded under. Default: from `<GoleProvider>`, otherwise `goleFontFamily(build)`. */
  fontFamily?: string;
}

/** Component props win over the provider; `undefined` props fall back to it. */
export function useGoleFont(props: GoleFontProps): { build: GoleBuild; fontFamily: string } {
  const config = useGoleConfig();
  const build = props.build ?? config.build;
  return { build, fontFamily: props.fontFamily ?? config.fontFamily ?? goleFontFamily(build) };
}
