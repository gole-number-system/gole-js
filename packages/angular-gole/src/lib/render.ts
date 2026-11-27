import type { Renderer2 } from "@angular/core";
import type { GoleNumberSegment, GoleSegment } from "@gole-number-system/gole-core";

function clear(renderer: Renderer2, host: Element): void {
  for (const child of Array.from(host.childNodes)) renderer.removeChild(host, child);
}

/** The digits of one number in `<span class="gole">`; the decimal separator stays a plain text node. */
function appendDigits(renderer: Renderer2, parent: Element, segment: GoleNumberSegment): void {
  const digits = (text: string) => {
    if (!text) return;
    const span = renderer.createElement("span");
    renderer.addClass(span, "gole");
    renderer.appendChild(span, renderer.createText(text));
    renderer.appendChild(parent, span);
  };
  digits(segment.integer);
  if (segment.separator) renderer.appendChild(parent, renderer.createText(segment.separator));
  digits(segment.fraction);
}

/**
 * Replace the content of `host` with one labelled number: the host gets the class
 * `gole-number`, `role="img"` and `aria-label`. An empty label clears the host.
 */
export function renderNumber(renderer: Renderer2, host: Element, segments: GoleSegment[], label: string): void {
  clear(renderer, host);
  renderer.addClass(host, "gole-number");
  if (!label) {
    renderer.removeAttribute(host, "role");
    renderer.removeAttribute(host, "aria-label");
    return;
  }
  renderer.setAttribute(host, "role", "img");
  renderer.setAttribute(host, "aria-label", label);
  for (const segment of segments) {
    if (segment.type === "number") appendDigits(renderer, host, segment);
    else renderer.appendChild(host, renderer.createText(segment.text));
  }
}

/** Replace the content of `host` with running text in which every number is its own labelled element. */
export function renderText(renderer: Renderer2, host: Element, segments: GoleSegment[]): void {
  clear(renderer, host);
  for (const segment of segments) {
    if (segment.type === "text") {
      renderer.appendChild(host, renderer.createText(segment.text));
      continue;
    }
    const number = renderer.createElement("span");
    renderer.addClass(number, "gole-number");
    renderer.setAttribute(number, "role", "img");
    renderer.setAttribute(number, "aria-label", segment.value);
    appendDigits(renderer, number, segment);
    renderer.appendChild(host, number);
  }
}
