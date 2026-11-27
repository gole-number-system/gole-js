import {
  computed,
  hasInjectionContext,
  inject,
  provide,
  toValue,
  type ComputedRef,
  type InjectionKey,
  type MaybeRefOrGetter,
} from "vue";
import type { GoleBuild, GoleOptions } from "@gole-number-system/gole-core";

export interface GoleConfig {
  /** Font build loaded on the page. Default `"ligature"`. */
  build?: GoleBuild;
  /** Locale for `<GoleFormat>`, `<GoleCurrency>` and the other locale-aware components. Default: the runtime's locale. */
  locale?: string | string[];
  /** Decimal separator used when converting mixed text. Default `"."`. */
  decimalSeparator?: GoleOptions["decimalSeparator"];
  /** Thousands separator to strip from numbers in mixed text. Default: none. */
  grouping?: GoleOptions["grouping"];
}

/** Injection key of the Gole defaults. Use `provideGole()` and `useGoleConfig()` instead where you can. */
export const GOLE_CONFIG: InjectionKey<ComputedRef<GoleConfig>> = Symbol("gole");

const DEFAULTS = computed<GoleConfig>(() => ({}));

/** Settings that are `undefined` do not hide the ones below them. */
export function mergeConfig(base: GoleConfig, over: GoleConfig): GoleConfig {
  return {
    build: over.build ?? base.build,
    locale: over.locale ?? base.locale,
    decimalSeparator: over.decimalSeparator ?? base.decimalSeparator,
    grouping: over.grouping ?? base.grouping,
  };
}

/** The Gole defaults set by the nearest `provideGole()` or by `GolePlugin`. */
export function useGoleConfig(): ComputedRef<GoleConfig> {
  return hasInjectionContext() ? inject(GOLE_CONFIG, DEFAULTS) : DEFAULTS;
}

/**
 * Sets defaults for every Gole component below the current one. Call it in `setup()`.
 * Only needed when the app uses the PUA build, a locale or a non-default separator.
 *
 * ```ts
 * provideGole({ build: "pua", locale: "en-IN" });
 * provideGole(() => ({ locale: locale.value }));   // a ref or getter keeps it reactive
 * ```
 *
 * Settings that are left out keep the value from further up (or from `GolePlugin`).
 */
export function provideGole(config: MaybeRefOrGetter<GoleConfig>): void {
  const parent = useGoleConfig();
  provide(
    GOLE_CONFIG,
    computed(() => mergeConfig(parent.value, toValue(config))),
  );
}

/** Component props win over the provided defaults; `undefined` props fall back to them. */
export function useGoleOptions(props: () => GoleOptions): ComputedRef<GoleOptions> {
  const config = useGoleConfig();
  return computed(() => {
    const { build, decimals, minPairs, decimalSeparator, grouping } = props();
    return {
      build: build ?? config.value.build,
      decimals,
      minPairs,
      decimalSeparator: decimalSeparator ?? config.value.decimalSeparator,
      grouping: grouping ?? config.value.grouping,
    };
  });
}
