import type { ComponentRef, ForwardRefExoticComponent, ReactNode, RefAttributes } from "react";
import { Text } from "react-native";
import type { GoleSegment } from "@gole-number-system/gole-core";

/** What a `ref` on a Gole component points to: the same as a ref on `<Text>`. */
export type GoleRef = ComponentRef<typeof Text>;

/** A Gole component: its props plus a `ref` to the `<Text>` it renders. */
export type GoleComponent<P> = ForwardRefExoticComponent<P & RefAttributes<GoleRef>>;

/**
 * Segments as children of a `<Text>`. Only the digits get the Gole font: the font has
 * no other glyphs, so signs, separators and letters keep the font of the outer text.
 */
export function renderSegments(segments: GoleSegment[], fontFamily: string): ReactNode {
  const style = { fontFamily };
  return segments.map((segment, i) =>
    segment.type === "number"
      ? [
          <Text style={style} key={`${i}i`}>
            {segment.integer}
          </Text>,
          segment.separator,
          segment.fraction && (
            <Text style={style} key={`${i}f`}>
              {segment.fraction}
            </Text>
          ),
        ]
      : segment.text,
  );
}
