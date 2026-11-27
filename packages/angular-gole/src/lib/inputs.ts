import { numberAttribute } from "@angular/core";

/**
 * Input transform for optional numbers: accepts `goleDecimals="2"` as well as
 * `[goleDecimals]="2"`, and keeps `undefined`, `null` and `""` as "not set".
 */
export function optionalNumber(value: unknown): number | undefined {
  return value == null || value === "" ? undefined : numberAttribute(value);
}
