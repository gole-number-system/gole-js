// A stand-in for react-native in the tests: just enough of Text, Platform and StyleSheet.
import { createElement, forwardRef, type ReactNode } from "react";

export const Platform = {
  OS: "ios",
  select: <T,>(spec: Record<string, T>): T | undefined => spec[Platform.OS] ?? spec.default,
};

export const StyleSheet = {
  create: <T,>(styles: T): T => styles,
  flatten: (style: unknown): unknown =>
    Array.isArray(style) ? Object.assign({}, ...style.map((item) => StyleSheet.flatten(item))) : (style ?? {}),
};

export const Text = forwardRef<unknown, { children?: ReactNode }>(function Text(props, ref) {
  return createElement("Text", { ...props, ref });
});
