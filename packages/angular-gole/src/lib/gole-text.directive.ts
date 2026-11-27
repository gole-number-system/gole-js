import { Directive, ElementRef, Input, Renderer2, inject, type OnChanges } from "@angular/core";
import { goleSegments, type GoleBuild, type GoleOptions } from "@gole-number-system/gole-core";
import { GOLE_CONFIG } from "./config";
import { optionalNumber } from "./inputs";
import { renderText } from "./render";

/**
 * Mixed text with every number shown in Gole. Letters, punctuation and units keep
 * the page font; each run of digits is padded on its own and gets its own label.
 *
 * ```html
 * <p [goleText]="'Invoice 5055-002347 · 20/11/2026 · 12:05'"></p>
 * <p [goleText]="'Total 1,234.5 kg'" goleGrouping=","></p>
 * ```
 *
 * The text replaces the content of the host element.
 */
@Directive({ selector: "[goleText]" })
export class GoleTextDirective implements OnChanges {
  /** The text to convert. */
  @Input({ alias: "goleText", required: true }) text: string | number | null | undefined;
  /** Thousands separator to remove from numbers, for example `","`. Default: none. */
  @Input({ alias: "goleGrouping" }) grouping: GoleOptions["grouping"];
  /** Decimal separator. Default `"."`; `false` treats every run of digits as a whole number. */
  @Input({ alias: "goleDecimalSeparator" }) decimalSeparator: GoleOptions["decimalSeparator"];
  /** Minimum number of Gole symbols in each whole part. */
  @Input({ alias: "goleMinPairs", transform: optionalNumber }) minPairs: number | undefined;
  /** Font build. Default: from `provideGole`, otherwise `"ligature"`. */
  @Input({ alias: "goleBuild" }) build: GoleBuild | undefined;

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly renderer = inject(Renderer2);
  private readonly config = inject(GOLE_CONFIG);

  ngOnChanges(): void {
    const options = {
      build: this.build ?? this.config.build,
      minPairs: this.minPairs,
      decimalSeparator: this.decimalSeparator,
      grouping: this.grouping,
    };
    // String() keeps a numeric value on the mixed-text path, where every run of digits is padded on its own.
    renderText(this.renderer, this.host, this.text == null ? [] : goleSegments(String(this.text), options));
  }
}
