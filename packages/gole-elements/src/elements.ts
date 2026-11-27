import {
  createGoleNumberFormat,
  goleDateLabel,
  goleDateSegments,
  goleHTML,
  goleLabel,
  goleSegments,
  type GoleBuild,
  type GoleNumberFormatOptions,
  type GoleSegment,
} from "@gole-number-system/gole-core";

export interface GoleElementDefaults {
  /** Font build loaded on the page. Default `"ligature"`. */
  build?: GoleBuild;
  /** Locale for `format`, and for `<gole-date>` with `date-style` / `time-style`. Default: the page's locale. */
  locale?: string;
}

const defaults: GoleElementDefaults = {};

/** Defaults for every Gole element on the page. Elements already on the page are rendered again. */
export function setGoleElementDefaults(next: GoleElementDefaults): void {
  Object.assign(defaults, next);
  if (typeof document === "undefined") return;
  for (const element of document.querySelectorAll<GoleElement>("gole-number,gole-text,gole-date,gole-time")) {
    if (element instanceof GoleElement) element.update();
  }
}

const escapeHTML = (text: string) => text.replace(/[&<>"']/g, (char) => `&#${char.charCodeAt(0)};`);

/** Digits in `<span class="gole">`, everything else as text. The host element carries the label. */
const flatHTML = (segments: GoleSegment[]) =>
  segments
    .map((segment) => {
      if (segment.type === "text") return escapeHTML(segment.text);
      const digits = (text: string) => (text ? `<span class="gole">${escapeHTML(text)}</span>` : "");
      return digits(segment.integer) + escapeHTML(segment.separator) + digits(segment.fraction);
    })
    .join("");

// Outside the browser (server rendering) there is no HTMLElement; importing must still work.
const Base = (typeof HTMLElement === "undefined" ? class {} : HTMLElement) as typeof HTMLElement;

/**
 * Shared behaviour. The elements render into their own light DOM (no shadow root),
 * so the page's font, colour and the `.gole` class from gole.css apply directly.
 */
export abstract class GoleElement extends Base {
  /** The text the element had before its first render, used when there is no `value` attribute. */
  protected source: string | null = null;
  private rendered: string | null = null;

  connectedCallback(): void {
    this.update();
  }

  attributeChangedCallback(): void {
    if (this.isConnected) this.update();
  }

  /** The value as an attribute or property; falls back to the element's text. */
  get value(): string {
    return this.getAttribute("value") ?? this.source ?? "";
  }
  set value(next: string | number | bigint | null | undefined) {
    if (next === null || next === undefined) this.removeAttribute("value");
    else this.setAttribute("value", String(next));
  }

  protected get build(): GoleBuild {
    return this.getAttribute("build") === "pua" ? "pua" : (defaults.build ?? "ligature");
  }

  protected get locale(): string | undefined {
    return this.getAttribute("locale") ?? defaults.locale;
  }

  protected number(name: string): number | undefined {
    const raw = this.getAttribute(name);
    return raw === null || raw.trim() === "" || Number.isNaN(Number(raw)) ? undefined : Number(raw);
  }

  /** Render again. Called automatically when an attribute changes. */
  update(): void {
    // Text that differs from what was rendered last was set by the page: take it as the new source.
    if (this.rendered === null || this.innerHTML !== this.rendered) this.source = this.textContent ?? "";
    const { html, label } = this.render();
    this.innerHTML = html;
    this.rendered = this.innerHTML;
    this.applyLabel(label);
  }

  protected applyLabel(label: string): void {
    if (label) {
      this.setAttribute("role", "img");
      this.setAttribute("aria-label", label);
    } else {
      this.removeAttribute("role");
      this.removeAttribute("aria-label");
    }
  }

  protected abstract render(): { html: string; label: string };
}

/**
 * One number.
 *
 * ```html
 * <gole-number value="123"></gole-number>
 * <gole-number decimals="2">12747.2</gole-number>
 * <gole-number value="1234.5" format="currency" currency="INR" locale="en-IN"></gole-number>
 * <gole-number value="0.456" format="percent"></gole-number>
 * <gole-number value="1234567" format="compact"></gole-number>
 * <gole-number value="72" format="unit" unit="kilometer-per-hour"></gole-number>
 * ```
 */
export class GoleNumberElement extends GoleElement {
  static observedAttributes = [
    "value",
    "decimals",
    "min-pairs",
    "build",
    "format",
    "currency",
    "currency-display",
    "unit",
    "unit-display",
    "compact-display",
    "min-fraction-digits",
    "max-fraction-digits",
    "locale",
  ];

  protected render(): { html: string; label: string } {
    const value = this.value.trim();
    if (value === "") return { html: "", label: "" };
    const { build } = this;
    const minPairs = this.number("min-pairs");
    const format = this.getAttribute("format");

    if (!format) {
      const options = { build, minPairs, decimals: this.number("decimals") };
      return { html: flatHTML(goleSegments(value, options)), label: goleLabel(value, options) };
    }

    const options: GoleNumberFormatOptions = {
      build,
      minPairs,
      locale: this.locale,
      minimumFractionDigits: this.number("min-fraction-digits"),
      maximumFractionDigits: this.number("max-fraction-digits"),
    };
    const attr = (name: string) => this.getAttribute(name) ?? undefined;
    if (format === "currency") {
      options.style = "currency";
      options.currency = attr("currency");
      options.currencyDisplay = attr("currency-display") as GoleNumberFormatOptions["currencyDisplay"];
    } else if (format === "percent") {
      options.style = "percent";
    } else if (format === "unit") {
      options.style = "unit";
      options.unit = attr("unit");
      options.unitDisplay = attr("unit-display") as GoleNumberFormatOptions["unitDisplay"];
    } else if (format === "compact") {
      options.notation = "compact";
      options.compactDisplay = attr("compact-display") as GoleNumberFormatOptions["compactDisplay"];
    }
    try {
      const formatter = createGoleNumberFormat(options);
      return { html: flatHTML(formatter.segments(value)), label: formatter.label(value) };
    } catch {
      // A missing or unknown currency, unit or locale: show the plain number instead of nothing.
      return { html: flatHTML(goleSegments(value, { build, minPairs })), label: goleLabel(value) };
    }
  }
}

/**
 * Mixed text: every run of digits in it is shown in Gole.
 *
 * ```html
 * <gole-text>Invoice 5055-002347 · 20/11/2026 · 12:05</gole-text>
 * <gole-text grouping=",">Total 1,234.5 kg</gole-text>
 * ```
 *
 * The content is treated as plain text; markup inside it is not kept.
 * `decimal-separator="none"` treats every run of digits as a whole number.
 */
export class GoleTextElement extends GoleElement {
  static observedAttributes = ["value", "min-pairs", "build", "decimal-separator", "grouping"];

  protected render(): { html: string; label: string } {
    const separator = this.getAttribute("decimal-separator");
    const html = goleHTML(this.value, {
      build: this.build,
      minPairs: this.number("min-pairs"),
      decimalSeparator: separator === null ? undefined : separator === "none" || separator === "" ? false : separator,
      grouping: this.getAttribute("grouping") || false,
    });
    // Every number inside is labelled on its own, so the host needs no label.
    return { html, label: "" };
  }
}

/**
 * A date or time.
 *
 * ```html
 * <gole-date value="2026-11-20"></gole-date>                       <!-- [20]/[11]/[20][26] -->
 * <gole-date value="2026-11-20T09:05" format="DD.MM.YY HH:mm"></gole-date>
 * <gole-date value="2026-11-20" date-style="medium" locale="en-IN"></gole-date>
 * ```
 *
 * `format` takes the tokens `YYYY YY MM DD HH hh mm ss A`. Without a value the
 * element shows the current date.
 */
export class GoleDateElement extends GoleElement {
  static observedAttributes = ["value", "format", "date-style", "time-style", "utc", "build", "locale"];
  protected defaultFormat = "DD/MM/YYYY";

  protected date(): Date {
    const value = this.value.trim();
    if (value === "") return new Date();
    return new Date(/^\d+$/.test(value) ? Number(value) : value);
  }

  protected render(): { html: string; label: string } {
    const dateStyle = this.getAttribute("date-style") as Intl.DateTimeFormatOptions["dateStyle"] | null;
    const timeStyle = this.getAttribute("time-style") as Intl.DateTimeFormatOptions["timeStyle"] | null;
    const options = {
      format:
        dateStyle || timeStyle
          ? { ...(dateStyle && { dateStyle }), ...(timeStyle && { timeStyle }) }
          : (this.getAttribute("format") ?? this.defaultFormat),
      locale: this.locale,
      utc: this.hasAttribute("utc"),
      build: this.build,
    };
    const date = this.date();
    try {
      return { html: flatHTML(goleDateSegments(date, options)), label: goleDateLabel(date, options) };
    } catch {
      return { html: "", label: "" };
    }
  }
}

/**
 * A time of day. Without a value it is a live clock.
 *
 * ```html
 * <gole-time></gole-time>                                  <!-- live, [12]:[05]:[09] -->
 * <gole-time value="2026-11-20T09:05" format="HH:mm"></gole-time>
 * <gole-time interval="60000" format="HH:mm"></gole-time>  <!-- live, updates every minute -->
 * ```
 */
export class GoleTimeElement extends GoleDateElement {
  static observedAttributes = [...GoleDateElement.observedAttributes, "interval"];
  protected defaultFormat = "HH:mm:ss";
  private timer: ReturnType<typeof setInterval> | undefined;

  connectedCallback(): void {
    super.connectedCallback();
    this.schedule();
  }

  disconnectedCallback(): void {
    clearInterval(this.timer);
    this.timer = undefined;
  }

  attributeChangedCallback(): void {
    super.attributeChangedCallback();
    if (this.isConnected) this.schedule();
  }

  private schedule(): void {
    clearInterval(this.timer);
    this.timer = undefined;
    if (this.value.trim() !== "") return;
    this.timer = setInterval(() => this.update(), this.number("interval") ?? 1000);
  }

  update(): void {
    super.update();
    // A live clock has no text of its own; do not keep the rendered time as the value.
    if (!this.hasAttribute("value")) this.source = "";
  }
}

const registry: Record<string, CustomElementConstructor> = {
  "gole-number": GoleNumberElement,
  "gole-text": GoleTextElement,
  "gole-date": GoleDateElement,
  "gole-time": GoleTimeElement,
};

/**
 * Register `<gole-number>`, `<gole-text>`, `<gole-date>` and `<gole-time>`.
 * Safe to call more than once, and does nothing outside the browser.
 */
export function defineGoleElements(elementDefaults?: GoleElementDefaults): void {
  if (elementDefaults) Object.assign(defaults, elementDefaults);
  if (typeof customElements === "undefined") return;
  for (const [name, constructor] of Object.entries(registry)) {
    if (!customElements.get(name)) customElements.define(name, constructor);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "gole-number": GoleNumberElement;
    "gole-text": GoleTextElement;
    "gole-date": GoleDateElement;
    "gole-time": GoleTimeElement;
  }
}
