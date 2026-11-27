import { h, type PropType, type VNodeChild } from "vue";
import type { GoleBuild, GoleNumberSegment, GoleSegment, GoleValue } from "@gole-number-system/gole-core";

/** Props shared by the components. */
export const valueProp = { type: [Number, String, BigInt] as PropType<GoleValue>, required: true } as const;
export const buildProp = String as PropType<GoleBuild>;
export const tagProps = {
  /** Element to render. Default `"span"`. */
  tag: String,
  /** Same as `tag`, for parity with the React components. */
  as: String,
} as const;

/** The digits of one number in the Gole font; the decimal separator stays in the surrounding font. */
export function renderDigits(segment: GoleNumberSegment): VNodeChild[] {
  const out: VNodeChild[] = [h("span", { class: "gole" }, segment.integer)];
  if (segment.separator) out.push(segment.separator);
  if (segment.fraction) out.push(h("span", { class: "gole" }, segment.fraction));
  return out;
}

/** Segments as one flat run, for use inside an element that already carries the label. */
export function renderFlat(segments: GoleSegment[]): VNodeChild[] {
  return segments.flatMap((segment) => (segment.type === "number" ? renderDigits(segment) : [segment.text]));
}

/** Segments where every number is its own labelled element, for use inside running text. */
export function renderLabelled(segments: GoleSegment[]): VNodeChild[] {
  return segments.map((segment) =>
    segment.type === "number"
      ? h("span", { class: "gole-number", role: "img", "aria-label": segment.value }, renderDigits(segment))
      : segment.text,
  );
}

/** One whole value as a labelled element: the root of `<Gole>`, `<GoleFormat>` and friends. */
export function renderNumber(tag: string, label: string, segments: GoleSegment[]) {
  return h(tag, { class: "gole-number", role: "img", "aria-label": label, "data-value": label }, renderFlat(segments));
}
