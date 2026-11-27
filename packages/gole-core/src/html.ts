import { GOLE_FONT_FAMILY, type GoleBuild } from "./constants";
import type { GoleValue } from "./decimal";
import { goleSegments, type GoleNumberSegment, type GoleOptions, type GoleSegment } from "./gole";

export interface GoleHTMLOptions extends GoleOptions {
  /** Class of the element around each number. Default `"gole-number"`. */
  numberClass?: string;
  /** Class of the elements that hold Gole digits and need the Gole font. Default `"gole"`. */
  digitsClass?: string;
}

const escapeHTML = (text: string) => text.replace(/[&<>"']/g, (char) => `&#${char.charCodeAt(0)};`);

/**
 * Convert a value to an HTML string. Every number becomes
 *
 * ```html
 * <span class="gole-number" role="img" aria-label="12.5"><span class="gole">12</span>.<span class="gole">50</span></span>
 * ```
 *
 * Only the digits get the Gole font, so the decimal point and the text around the
 * number keep the font of the page. Screen readers read the decimal value from
 * `aria-label`. All other text is escaped.
 */
export function goleHTML(value: GoleValue, options: GoleHTMLOptions = {}): string {
  return segmentsHTML(goleSegments(value, options), options);
}

/**
 * Segments → HTML. Without `label` every number is its own labelled element; with
 * `label` the whole run is one element that carries the label.
 * Not part of the public API.
 */
export function segmentsHTML(segments: GoleSegment[], options: GoleHTMLOptions = {}, label?: string): string {
  const numberClass = escapeHTML(options.numberClass ?? "gole-number");
  const digitsClass = escapeHTML(options.digitsClass ?? "gole");
  const digits = (text: string) => (text ? `<span class="${digitsClass}">${escapeHTML(text)}</span>` : "");
  const open = (text: string) => `<span class="${numberClass}" role="img" aria-label="${escapeHTML(text)}">`;
  const number = (segment: GoleNumberSegment) =>
    digits(segment.integer) + escapeHTML(segment.separator) + digits(segment.fraction);

  if (label !== undefined) {
    return (
      open(label) +
      segments.map((segment) => (segment.type === "text" ? escapeHTML(segment.text) : number(segment))).join("") +
      "</span>"
    );
  }
  return segments
    .map((segment) =>
      segment.type === "text" ? escapeHTML(segment.text) : open(segment.value) + number(segment) + "</span>",
    )
    .join("");
}

export interface RenderGoleOptions extends GoleHTMLOptions {
  /** Elements to convert. Default `"[data-gole]"`. */
  selector?: string;
}

/**
 * Convert every `[data-gole]` element under `root` in place.
 *
 * ```html
 * <span data-gole>123</span>  <td data-gole data-gole-decimals="2">12747.2</td>
 * <script type="module">
 *   import { renderGole } from "@gole-number-system/gole-core";
 *   renderGole();
 * </script>
 * ```
 *
 * The original text is kept in `data-gole-value`, so calling this again (after the
 * page changes) is safe: set a new `data-gole-value` or new text and re-run.
 * Per-element overrides: `data-gole-decimals`, `data-gole-min-pairs`, `data-gole-build`.
 */
export function renderGole(root: ParentNode = document, options: RenderGoleOptions = {}): void {
  const { selector = "[data-gole]", ...rest } = options;
  for (const element of root.querySelectorAll<HTMLElement>(selector)) {
    const { dataset } = element;
    const rendered = dataset.goleRendered;
    // Text that differs from what we rendered last time was changed by the page: take it as the new value.
    const source =
      rendered !== undefined && element.innerHTML === rendered
        ? (dataset.goleValue ?? "")
        : (element.textContent ?? "");
    const html = goleHTML(source, {
      ...rest,
      ...(dataset.goleDecimals !== undefined && { decimals: Number(dataset.goleDecimals) }),
      ...(dataset.goleMinPairs !== undefined && { minPairs: Number(dataset.goleMinPairs) }),
      ...(dataset.goleBuild && { build: dataset.goleBuild as GoleBuild }),
    });
    element.innerHTML = html;
    dataset.goleValue = source;
    dataset.goleRendered = element.innerHTML;
  }
}

/**
 * Resolves once the GoleStandard font is loaded, for code that measures text or
 * takes screenshots. Resolves immediately outside the browser.
 */
export async function goleReady(build: GoleBuild = "ligature", fontFamily = GOLE_FONT_FAMILY): Promise<void> {
  if (typeof document === "undefined" || !document.fonts) return;
  await document.fonts.load(`16px "${fontFamily}"`, build === "pua" ? "" : "00");
}
