import {
  Children,
  cloneElement,
  forwardRef,
  isValidElement,
  type ElementType,
  type HTMLAttributes,
  type ReactElement,
  type ReactNode,
} from "react";
import { goleSegments, type GoleBuild, type GoleOptions } from "@gole-number-system/gole-core";
import { useGoleOptions } from "./context";
import { renderLabelled } from "./render";

export interface GoleTextProps extends HTMLAttributes<HTMLElement> {
  /** Text, or elements containing text. Every run of digits in it is shown in Gole. */
  children?: ReactNode;
  build?: GoleBuild;
  minPairs?: number;
  /** Decimal separator. Default `"."`; `false` treats every run of digits as a whole number. */
  decimalSeparator?: GoleOptions["decimalSeparator"];
  /** Thousands separator to remove, for example `","`. Default: none. */
  grouping?: GoleOptions["grouping"];
  /** Element to render. Default `"span"`. */
  as?: ElementType;
}

function convert(node: ReactNode, options: GoleOptions, path: string): ReactNode {
  const out: ReactNode[] = [];
  let text = "";
  const flush = () => {
    if (text) out.push(renderLabelled(goleSegments(text, options), `${path}.${out.length}.`));
    text = "";
  };
  // Neighbouring strings and numbers are joined first, so "Total: {count}" converts as one text.
  Children.forEach(node, (child) => {
    if (typeof child === "string" || typeof child === "number" || typeof child === "bigint") {
      text += String(child);
    } else if (isValidElement(child)) {
      flush();
      const element = child as ReactElement<{ children?: ReactNode }>;
      const key = element.key ?? `${path}.${out.length}`;
      out.push(
        element.props.children === undefined
          ? cloneElement(element, { key })
          : cloneElement(element, { key }, convert(element.props.children, options, `${path}.${out.length}`)),
      );
    }
  });
  flush();
  return out;
}

/**
 * Mixed text with every number shown in Gole. Letters, punctuation and units keep
 * the surrounding font; each run of digits is padded on its own.
 *
 * ```tsx
 * <GoleText>Invoice 5055-002347 · 20/11/2026 · 12:05</GoleText>
 * <GoleText grouping=",">Total 1,234.5 kg</GoleText>
 * <GoleText as="p">Order <b>{orderId}</b> ships in {days} days</GoleText>
 * ```
 */
export const GoleText = forwardRef<HTMLElement, GoleTextProps>(function GoleText(
  { children, build, minPairs, decimalSeparator, grouping, as: Tag = "span", ...rest },
  ref,
) {
  const options = useGoleOptions({ build, minPairs, decimalSeparator, grouping });
  return (
    <Tag ref={ref} {...rest}>
      {convert(children, options, "g")}
    </Tag>
  );
});
