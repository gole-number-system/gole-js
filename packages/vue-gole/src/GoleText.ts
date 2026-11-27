import { Comment, Fragment, Text, defineComponent, h, isVNode, type PropType, type VNode, type VNodeChild } from "vue";
import { goleSegments, type GoleOptions } from "@gole-number-system/gole-core";
import { useGoleOptions } from "./config";
import { buildProp, renderLabelled, splitSpace, tagProps } from "./render";

function convert(children: VNodeChild[], options: GoleOptions): VNodeChild[] {
  const out: VNodeChild[] = [];
  let text = "";
  const flush = () => {
    if (text) {
      const [before, body, after] = splitSpace(text);
      out.push(before, ...renderLabelled(goleSegments(body, options)), after);
    }
    text = "";
  };
  // Neighbouring pieces of text are joined first, so a number split over two nodes converts as one.
  const visit = (child: VNodeChild) => {
    if (Array.isArray(child)) child.forEach(visit);
    else if (typeof child === "string" || typeof child === "number") text += String(child);
    else if (!isVNode(child) || child.type === Comment) return;
    else if (child.type === Text) text += String(child.children ?? "");
    else if (child.type === Fragment) visit(child.children as VNodeChild[]);
    else {
      flush();
      out.push(convertElement(child, options));
    }
  };
  children.forEach(visit);
  flush();
  return out;
}

/** Elements keep their props and get converted children. Components are left as they are. */
function convertElement(vnode: VNode, options: GoleOptions): VNode {
  const { children } = vnode;
  if (typeof vnode.type !== "string" || children == null || (typeof children === "object" && !Array.isArray(children))) {
    return vnode;
  }
  // h(vnode) clones it. The clone's children are always an array now (shape flag 8 marks text
  // children), and it gives up the compiler's patch hints because they describe the old children.
  const clone = h(vnode as never, null, convert(Array.isArray(children) ? children : [children], options));
  clone.shapeFlag &= ~8;
  clone.patchFlag = -2;
  return clone;
}

/**
 * Mixed text with every number shown in Gole. Letters, punctuation and units keep
 * the surrounding font; each run of digits is padded on its own.
 *
 * ```html
 * <GoleText>Invoice 5055-002347 · 20/11/2026 · 12:05</GoleText>
 * <GoleText grouping=",">Total 1,234.5 kg</GoleText>
 * <GoleText tag="p">Order <b>{{ orderId }}</b> ships in {{ days }} days</GoleText>
 * ```
 *
 * Text inside nested elements is converted too. Child components are left as they are.
 */
export const GoleText = defineComponent({
  name: "GoleText",
  props: {
    build: buildProp,
    minPairs: Number,
    /** Decimal separator. Default `"."`; `false` treats every run of digits as a whole number. */
    decimalSeparator: { type: [String, Boolean] as PropType<GoleOptions["decimalSeparator"]>, default: undefined },
    /** Thousands separator to remove, for example `","`. Default: none. */
    grouping: { type: [String, Boolean] as PropType<GoleOptions["grouping"]>, default: undefined },
    ...tagProps,
  },
  setup(props, { slots }) {
    const options = useGoleOptions(() => props);
    return () => h(props.tag ?? props.as ?? "span", null, convert(slots.default?.() ?? [], options.value));
  },
});
