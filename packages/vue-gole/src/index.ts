export { GOLE_CONFIG, provideGole, useGoleConfig, type GoleConfig } from "./config";
export { Gole } from "./Gole";
export { GoleText } from "./GoleText";
export { GoleSymbol } from "./GoleSymbol";
export { GoleDate, GoleTime } from "./GoleDateTime";
export { GoleCompact, GoleCurrency, GoleFormat, GolePercent, GoleUnit } from "./GoleFormat";
export { createGoleDirective, vGole, type GoleDirective, type GoleDirectiveValue } from "./directive";
export { useGole, useGoleFontReady, type UseGoleResult } from "./composables";
export { GolePlugin } from "./plugin";
export { formatDatePattern } from "@gole-number-system/gole-core";
export type {
  GoleBuild,
  GoleDateInput,
  GoleNumberFormatOptions,
  GoleOptions,
  GoleSegment,
  GoleValue,
} from "@gole-number-system/gole-core";
