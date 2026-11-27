import { Pipe, inject, type PipeTransform } from "@angular/core";
import { goleLabel, toGole, type GoleOptions, type GoleValue } from "@gole-number-system/gole-core";
import { GOLE_CONFIG } from "./config";

const toOptions = (options: number | GoleOptions | undefined, build: GoleOptions["build"]): GoleOptions =>
  typeof options === "number" ? { build, decimals: options } : { build, ...options };

/**
 * A value as Gole text, for use inside an element that has the Gole font (class `gole`).
 *
 * ```html
 * <span class="gole">{{ 123 | gole }}</span>                 <!-- 0123, shows [01][23] -->
 * <span class="gole">{{ count | gole: { minPairs: 2 } }}</span>
 * {{ 12747.2 | gole: 2 }}                                   <!-- "012747.20" -->
 * ```
 *
 * The argument is the number of decimals or an options object. The pipe returns text
 * only; to keep the decimal point and the sign in the page font and to add a label
 * for screen readers, use the `[gole]` directive instead.
 */
@Pipe({ name: "gole" })
export class GolePipe implements PipeTransform {
  private readonly config = inject(GOLE_CONFIG);

  transform(value: GoleValue | null | undefined, options?: number | GoleOptions): string {
    return value == null ? "" : toGole(value, toOptions(options, this.config.build));
  }
}

/**
 * The ordinary decimal text of a value, for `aria-label` or `title` next to the `gole` pipe.
 *
 * ```html
 * <span class="gole" role="img" [attr.aria-label]="price | goleLabel: 2">{{ price | gole: 2 }}</span>
 * ```
 */
@Pipe({ name: "goleLabel" })
export class GoleLabelPipe implements PipeTransform {
  transform(value: GoleValue | null | undefined, options?: number | GoleOptions): string {
    return value == null ? "" : goleLabel(value, toOptions(options, undefined));
  }
}
