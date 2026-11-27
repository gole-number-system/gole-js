import {
  Directive,
  ElementRef,
  Input,
  LOCALE_ID,
  Renderer2,
  booleanAttribute,
  inject,
  type OnChanges,
  type SimpleChanges,
} from "@angular/core";
import {
  createGoleNumberFormat,
  type GoleBuild,
  type GoleNumberFormat,
  type GoleValue,
} from "@gole-number-system/gole-core";
import { GOLE_CONFIG } from "./config";
import { optionalNumber } from "./inputs";
import { renderNumber } from "./render";

/**
 * A number formatted for a locale, in Gole: currency, percent, compact or with a unit.
 * The currency sign, percent sign, unit and compact suffix keep the page font; only
 * the digits are Gole symbols.
 *
 * ```html
 * <span [goleFormat]="1234.5" goleCurrency="INR"></span>           <!-- ₹[12][34].[50] -->
 * <span [goleFormat]="0.456" golePercent></span>                   <!-- [46]% -->
 * <span [goleFormat]="1234567" goleCompact></span>                 <!-- [01].[20]M -->
 * <span [goleFormat]="72" goleUnit="kilometer-per-hour"></span>    <!-- [72] km/h -->
 * <span [goleFormat]="3.14159" [goleOptions]="{ maximumFractionDigits: 2 }"></span>
 * ```
 *
 * The locale comes from `goleLocale`, then `provideGole`, then Angular's `LOCALE_ID`.
 */
@Directive({ selector: "[goleFormat]" })
export class GoleFormatDirective implements OnChanges {
  /** The number to show. */
  @Input({ alias: "goleFormat", required: true }) value: GoleValue | null | undefined;
  /** ISO 4217 code such as `"INR"`: formats the value as money. */
  @Input({ alias: "goleCurrency" }) currency: string | undefined;
  /** Formats a ratio as a percentage; the value is multiplied by 100, as in `Intl`. */
  @Input({ alias: "golePercent", transform: booleanAttribute }) percent = false;
  /** Short form for large numbers: 1.2M, or lakh and crore with `en-IN`. */
  @Input({ alias: "goleCompact", transform: booleanAttribute }) compact = false;
  /** A unit `Intl.NumberFormat` knows: `"kilogram"`, `"celsius"`, `"kilometer-per-hour"`, … */
  @Input({ alias: "goleUnit" }) unit: string | undefined;
  /** Any other `Intl.NumberFormat` options, for example `{ minimumFractionDigits: 2 }`. */
  @Input({ alias: "goleOptions" }) options: Intl.NumberFormatOptions | undefined;
  /** BCP 47 locale, for example `"en-IN"`. */
  @Input({ alias: "goleLocale" }) locale: string | string[] | undefined;
  /** Minimum number of Gole symbols in the whole part. */
  @Input({ alias: "goleMinPairs", transform: optionalNumber }) minPairs: number | undefined;
  /** Font build. Default: from `provideGole`, otherwise `"ligature"`. */
  @Input({ alias: "goleBuild" }) build: GoleBuild | undefined;
  /** Text for screen readers. Default: the ordinary formatted text, such as `"₹1,234.50"`. */
  @Input({ alias: "goleLabel" }) label: string | undefined;

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly renderer = inject(Renderer2);
  private readonly config = inject(GOLE_CONFIG);
  private readonly localeId = inject(LOCALE_ID);
  private formatter?: GoleNumberFormat;

  ngOnChanges(changes: SimpleChanges): void {
    // A new value or label reuses the formatter; any other input changes how numbers are formatted.
    if (!this.formatter || Object.keys(changes).some((name) => name !== "value" && name !== "label")) {
      const intl: Intl.NumberFormatOptions = {};
      if (this.currency) Object.assign(intl, { style: "currency", currency: this.currency });
      if (this.unit) Object.assign(intl, { style: "unit", unit: this.unit });
      if (this.percent) intl.style = "percent";
      if (this.compact) intl.notation = "compact";
      this.formatter = createGoleNumberFormat({
        ...intl,
        ...this.options,
        locale: this.locale ?? this.config.locale ?? this.localeId,
        build: this.build ?? this.config.build,
        minPairs: this.minPairs,
      });
    }
    const { value, formatter } = this;
    if (value == null) renderNumber(this.renderer, this.host, [], "");
    else renderNumber(this.renderer, this.host, formatter.segments(value), this.label ?? formatter.label(value));
  }
}
