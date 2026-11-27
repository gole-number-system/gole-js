import { isPlatformBrowser } from "@angular/common";
import {
  Directive,
  ElementRef,
  Input,
  LOCALE_ID,
  NgZone,
  PLATFORM_ID,
  Renderer2,
  booleanAttribute,
  inject,
  numberAttribute,
  type OnChanges,
  type OnDestroy,
} from "@angular/core";
import {
  goleDateLabel,
  goleDateSegments,
  type GoleBuild,
  type GoleDateInput,
  type GoleDateOptions,
} from "@gole-number-system/gole-core";
import { GOLE_CONFIG } from "./config";
import { renderNumber } from "./render";

type DateFormat = NonNullable<GoleDateOptions["format"]>;

/** What the two directives share: fill in the defaults and write one date or time into the host. */
function injectDateRenderer() {
  const host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  const renderer = inject(Renderer2);
  const config = inject(GOLE_CONFIG);
  const localeId = inject(LOCALE_ID);
  let shown: string | undefined;

  return (value: GoleDateInput | null | undefined, options: GoleDateOptions) => {
    const resolved = {
      ...options,
      locale: options.locale ?? config.locale ?? localeId,
      build: options.build ?? config.build,
    };
    const label = value == null ? "" : goleDateLabel(value, resolved);
    const key = `${resolved.build ?? ""}|${label}`;
    // A live clock calls this on every tick: leave the DOM alone while the text is the same.
    if (key === shown) return;
    shown = key;
    renderNumber(renderer, host, value == null ? [] : goleDateSegments(value, resolved), label);
  };
}

/**
 * A date in Gole. Day, month and each half of the year are one symbol each.
 *
 * ```html
 * <time [goleDate]="'2026-11-20'"></time>                                  <!-- [20]/[11]/[20][26] -->
 * <span [goleDate]="order.createdAt" goleDateFormat="DD.MM.YY"></span>
 * <span [goleDate]="today" [goleDateFormat]="{ dateStyle: 'medium' }" goleLocale="en-IN"></span>
 * ```
 *
 * `goleDateFormat` is a pattern of the tokens `YYYY YY MM DD HH hh mm ss A` (literal
 * text in `[brackets]`) or `Intl.DateTimeFormat` options. An invalid date renders nothing.
 */
@Directive({ selector: "[goleDate]" })
export class GoleDateDirective implements OnChanges {
  /** A `Date`, a timestamp in milliseconds or a date string. */
  @Input({ alias: "goleDate", required: true }) value: GoleDateInput | null | undefined;
  /** Pattern or `Intl.DateTimeFormat` options. Default `"DD/MM/YYYY"`. */
  @Input({ alias: "goleDateFormat" }) format: DateFormat = "DD/MM/YYYY";
  /** Locale for `Intl.DateTimeFormat` options. */
  @Input({ alias: "goleLocale" }) locale: string | string[] | undefined;
  /** Read the date in UTC instead of local time. */
  @Input({ alias: "goleUtc", transform: booleanAttribute }) utc = false;
  /** Font build. Default: from `provideGole`, otherwise `"ligature"`. */
  @Input({ alias: "goleBuild" }) build: GoleBuild | undefined;

  private readonly render = injectDateRenderer();

  ngOnChanges(): void {
    this.render(this.value, { format: this.format, locale: this.locale, utc: this.utc, build: this.build });
  }
}

/**
 * A time of day in Gole: hours, minutes and seconds are one symbol each. Without a
 * value it is a live clock.
 *
 * ```html
 * <time goleTime></time>                                        <!-- live clock, [12]:[05]:[09] -->
 * <time [goleTime]="order.createdAt" goleTimeFormat="HH:mm"></time>
 * ```
 *
 * The clock runs outside the Angular zone and writes straight to the DOM, so it never
 * starts a change detection. It runs in the browser only (on the server the element
 * stays empty) and stops when the directive is destroyed.
 */
@Directive({ selector: "[goleTime]" })
export class GoleTimeDirective implements OnChanges, OnDestroy {
  /** A fixed time to show. Leave out (or pass `null`) for a live clock. */
  @Input({ alias: "goleTime" }) value: GoleDateInput | null | undefined;
  /** Pattern or `Intl.DateTimeFormat` options. Default `"HH:mm:ss"`. */
  @Input({ alias: "goleTimeFormat" }) format: DateFormat = "HH:mm:ss";
  /** How often a live clock updates, in milliseconds. Default `1000`. */
  @Input({ alias: "goleInterval", transform: numberAttribute }) interval = 1000;
  /** Locale for `Intl.DateTimeFormat` options. */
  @Input({ alias: "goleLocale" }) locale: string | string[] | undefined;
  /** Read the time in UTC instead of local time. */
  @Input({ alias: "goleUtc", transform: booleanAttribute }) utc = false;
  /** Font build. Default: from `provideGole`, otherwise `"ligature"`. */
  @Input({ alias: "goleBuild" }) build: GoleBuild | undefined;

  private readonly render = injectDateRenderer();
  private readonly zone = inject(NgZone);
  private readonly browser = isPlatformBrowser(inject(PLATFORM_ID));
  private timer: ReturnType<typeof setInterval> | undefined;

  ngOnChanges(): void {
    this.ngOnDestroy();
    const options = { format: this.format, locale: this.locale, utc: this.utc, build: this.build };
    // `<time goleTime>` passes "": no value, so show the current time.
    if (this.value != null && this.value !== "") return this.render(this.value, options);
    if (!this.browser) return this.render(null, options);

    this.render(new Date(), options);
    this.zone.runOutsideAngular(() => {
      this.timer = setInterval(() => this.render(new Date(), options), this.interval);
    });
  }

  ngOnDestroy(): void {
    if (this.timer !== undefined) clearInterval(this.timer);
    this.timer = undefined;
  }
}
