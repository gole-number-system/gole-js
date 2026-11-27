import { Directive, ElementRef, Input, Renderer2, inject, type OnChanges } from "@angular/core";
import { goleLabel, goleSegments, type GoleBuild, type GoleValue } from "@gole-number-system/gole-core";
import { GOLE_CONFIG } from "./config";
import { optionalNumber } from "./inputs";
import { renderNumber } from "./render";

/**
 * One number in Gole, rendered inside the host element.
 *
 * ```html
 * <span [gole]="987654"></span>                      <!-- [98][76][54] -->
 * <td [gole]="12747.2" [goleDecimals]="2"></td>      <!-- [01][27][47].[20] -->
 * <span [gole]="7" [goleMinPairs]="2"></span>        <!-- [00][07] -->
 * ```
 *
 * The digits go into `<span class="gole">`; the sign and the decimal point keep the
 * page font. The host gets the class `gole-number`, `role="img"` and an `aria-label`
 * with the decimal value. `null` and `undefined` render nothing.
 */
@Directive({ selector: "[gole]" })
export class GoleDirective implements OnChanges {
  /** The number to show: `123`, `"12.5"`, `10n`. */
  @Input({ alias: "gole", required: true }) value: GoleValue | null | undefined;
  /** Fixed number of fraction digits, rounded half away from zero. */
  @Input({ alias: "goleDecimals", transform: optionalNumber }) decimals: number | undefined;
  /** Minimum number of Gole symbols in the whole part. */
  @Input({ alias: "goleMinPairs", transform: optionalNumber }) minPairs: number | undefined;
  /** Font build. Default: from `provideGole`, otherwise `"ligature"`. */
  @Input({ alias: "goleBuild" }) build: GoleBuild | undefined;
  /** Text for screen readers. Default: the decimal value. */
  @Input({ alias: "goleLabel" }) label: string | undefined;

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly renderer = inject(Renderer2);
  private readonly config = inject(GOLE_CONFIG);

  ngOnChanges(): void {
    const { value } = this;
    const options = { build: this.build ?? this.config.build, decimals: this.decimals, minPairs: this.minPairs };
    if (value == null) renderNumber(this.renderer, this.host, [], "");
    else renderNumber(this.renderer, this.host, goleSegments(value, options), this.label ?? goleLabel(value, options));
  }
}
