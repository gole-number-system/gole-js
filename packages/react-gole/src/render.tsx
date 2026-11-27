import type { ReactNode } from "react";
import type { GoleNumberSegment, GoleSegment } from "@gole-number-system/gole-core";

export const cx = (...names: Array<string | false | null | undefined>) => names.filter(Boolean).join(" ");

/** The digits of one number in the Gole font; the decimal separator stays in the surrounding font. */
export function renderDigits(segment: GoleNumberSegment, key?: string | number): ReactNode {
  return [
    <span className="gole" key={`${key}i`}>
      {segment.integer}
    </span>,
    segment.separator,
    segment.fraction && (
      <span className="gole" key={`${key}f`}>
        {segment.fraction}
      </span>
    ),
  ];
}

/** Segments as one flat run, for use inside an element that already carries the label. */
export function renderFlat(segments: GoleSegment[]): ReactNode {
  return segments.map((segment, i) => (segment.type === "number" ? renderDigits(segment, i) : segment.text));
}

/** Segments where every number is its own labelled element, for use inside running text. */
export function renderLabelled(segments: GoleSegment[], keyPrefix: string | number = ""): ReactNode {
  return segments.map((segment, i) =>
    segment.type === "number" ? (
      <span className="gole-number" role="img" aria-label={segment.value} key={`${keyPrefix}${i}`}>
        {renderDigits(segment, i)}
      </span>
    ) : (
      segment.text
    ),
  );
}
