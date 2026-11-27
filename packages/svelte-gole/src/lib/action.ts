import type { Action } from "svelte/action";
import { goleHTML, type GoleHTMLOptions, type GoleValue } from "@gole-number-system/gole-core";

export interface GoleActionOptions extends GoleHTMLOptions {
  /** The value to show. Default: the text the element had when the action started. */
  value?: GoleValue;
}

/**
 * An action that shows a value, or the element's own text, in Gole.
 *
 * ```svelte
 * <span use:gole={{ value: total, decimals: 2 }}></span>
 * <td use:gole>Invoice 5055-002347</td>
 * ```
 *
 * The element's content is replaced with the markup of `goleHTML`, and again each
 * time the options change. Pass changing values as `value`: text written between
 * the tags is read once. The action does not read `setGoleContext`; pass
 * `build: "pua"` in the options when the page uses the PUA build.
 */
export const gole: Action<HTMLElement, GoleActionOptions | undefined> = (node, options) => {
  const source = node.textContent ?? "";
  const render = ({ value, ...rest }: GoleActionOptions = {}) => {
    node.innerHTML = goleHTML(value ?? source, rest);
  };
  render(options);
  return { update: render };
};
