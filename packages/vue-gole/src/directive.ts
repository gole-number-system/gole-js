import { Text, isVNode, type Directive, type DirectiveBinding, type VNode } from "vue";
import { goleHTML, type GoleBuild, type GoleOptions, type GoleValue } from "@gole-number-system/gole-core";
import type { GoleConfig } from "./config";
import { splitSpace } from "./render";

/** What `v-gole` accepts: nothing, a value, or options with an optional `value`. */
export type GoleDirectiveValue = GoleValue | (GoleOptions & { value?: GoleValue }) | null | undefined;

export type GoleDirective = Directive<HTMLElement, GoleDirectiveValue, "pua" | "ligature", GoleBuild>;

/** What we read and wrote last time, to tell our own output from new text set by Vue. */
const rendered = new WeakMap<HTMLElement, { source: string; html: string; dom: string }>();

/** The text Vue rendered into the element, or `null` when it holds anything but text. */
function vnodeText({ children }: VNode): string | null {
  if (typeof children === "string") return children;
  if (!Array.isArray(children)) return null;
  let text = "";
  for (const child of children) {
    if (typeof child === "string" || typeof child === "number") text += child;
    else if (isVNode(child) && child.type === Text) text += String(child.children ?? "");
    else return null;
  }
  return text;
}

/**
 * Make a `v-gole` directive with its own defaults. `GolePlugin` does this for you;
 * use it directly to register the directive by hand with the PUA build:
 *
 * ```ts
 * app.directive("gole", createGoleDirective({ build: "pua" }));
 * ```
 */
export function createGoleDirective(defaults: GoleConfig = {}): GoleDirective {
  const update = (
    el: HTMLElement,
    binding: DirectiveBinding<GoleDirectiveValue, "pua" | "ligature", GoleBuild>,
    vnode: VNode,
  ) => {
    const bound = binding.value;
    const { value, ...options }: GoleOptions & { value?: GoleValue | null } =
      typeof bound === "object" && bound !== null ? bound : { value: bound };
    const build =
      binding.arg ??
      (binding.modifiers.pua ? "pua" : binding.modifiers.ligature ? "ligature" : (options.build ?? defaults.build));

    const last = rendered.get(el);
    // Without a bound value the element's text is the value: what Vue rendered, or else what the DOM holds.
    const source =
      value != null
        ? String(value)
        : (vnodeText(vnode) ?? (last && el.innerHTML === last.dom ? last.source : (el.textContent ?? "")));
    const [before, body, after] = splitSpace(source);
    const converted = goleHTML(body, {
      decimalSeparator: defaults.decimalSeparator,
      grouping: defaults.grouping,
      ...options,
      build,
    });
    const html = before + converted + after;
    if (!last || html !== last.html || el.innerHTML !== last.dom) el.innerHTML = html;
    rendered.set(el, { source, html, dom: el.innerHTML });
  };
  return { mounted: update, updated: update };
}

/**
 * Converts an element's text to Gole in place. Every run of digits becomes a labelled
 * number; other text is left alone.
 *
 * ```html
 * <td v-gole>Invoice 5055-002347</td>              <!-- the element's own text -->
 * <td v-gole="total"></td>                         <!-- a bound value -->
 * <td v-gole="{ value: total, decimals: 2 }"></td> <!-- with options -->
 * <td v-gole.pua="total"></td>                     <!-- PUA build; v-gole:pua also works -->
 * ```
 *
 * Use it on elements that hold only text. It runs in the browser; for server rendering use `<Gole>`.
 */
export const vGole: GoleDirective = createGoleDirective();
