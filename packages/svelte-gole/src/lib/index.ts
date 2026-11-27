export { getGoleContext, setGoleContext, type GoleConfig } from "./context.js";
export { gole, type GoleActionOptions } from "./action.js";
export { default as Gole } from "./Gole.svelte";
export { default as GoleText } from "./GoleText.svelte";
export { default as GoleSymbol } from "./GoleSymbol.svelte";
export { default as GoleDate } from "./GoleDate.svelte";
export { default as GoleTime } from "./GoleTime.svelte";
export { default as GoleFormat } from "./GoleFormat.svelte";
export { default as GoleCurrency } from "./GoleCurrency.svelte";
export { default as GolePercent } from "./GolePercent.svelte";
export { default as GoleCompact } from "./GoleCompact.svelte";
export { default as GoleUnit } from "./GoleUnit.svelte";
export type {
  GoleCompactProps,
  GoleCurrencyProps,
  GoleDateProps,
  GoleFormatProps,
  GolePercentProps,
  GoleProps,
  GoleSymbolProps,
  GoleTextProps,
  GoleTimeProps,
  GoleUnitProps,
} from "./types.js";
export type { GoleBuild, GoleNumberFormatOptions, GoleOptions, GoleSegment, GoleValue } from "@gole-number-system/gole-core";
