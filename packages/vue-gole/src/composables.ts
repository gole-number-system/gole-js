import { computed, getCurrentInstance, onMounted, ref, toValue, watch, type ComputedRef, type MaybeRefOrGetter, type Ref } from "vue";
import {
  goleReady,
  goleSegments,
  type GoleBuild,
  type GoleOptions,
  type GoleSegment,
  type GoleValue,
} from "@gole-number-system/gole-core";
import { useGoleConfig, useGoleOptions } from "./config";

export interface UseGoleResult {
  /** Text to display in the Gole font. */
  text: ComputedRef<string>;
  /** The decimal text it stands for, for `aria-label`. */
  label: ComputedRef<string>;
  /** The digit pairs behind the symbols. */
  pairs: ComputedRef<string[]>;
  /** Number of Gole symbols. */
  count: ComputedRef<number>;
  /** Numbers and the text between them, for custom rendering. */
  segments: ComputedRef<GoleSegment[]>;
}

/**
 * Convert a value for custom rendering, using the build from `provideGole()` or `GolePlugin`.
 * Use it where a component cannot go: canvas, SVG attributes, `title`, document titles.
 *
 * ```ts
 * const { text, label } = useGole(() => props.total, { decimals: 2 });
 * ```
 *
 * The value and the options can be plain values, refs or getters.
 */
export function useGole(value: MaybeRefOrGetter<GoleValue>, options: MaybeRefOrGetter<GoleOptions> = {}): UseGoleResult {
  const resolved = useGoleOptions(() => toValue(options));
  const segments = computed(() => goleSegments(toValue(value), resolved.value));
  const pairs = computed(() => segments.value.flatMap((segment) => (segment.type === "number" ? segment.pairs : [])));
  return {
    text: computed(() => segments.value.map((segment) => segment.text).join("")),
    label: computed(() =>
      segments.value.map((segment) => (segment.type === "number" ? segment.value : segment.text)).join(""),
    ),
    pairs,
    count: computed(() => pairs.value.length),
    segments,
  };
}

/**
 * `true` once the GoleStandard font has loaded. Wait for it before measuring text
 * widths, drawing to a canvas or taking a screenshot. Stays `false` on the server.
 */
export function useGoleFontReady(build?: MaybeRefOrGetter<GoleBuild | undefined>): Ref<boolean> {
  const config = useGoleConfig();
  const ready = ref(false);
  const wanted = () => toValue(build) ?? config.value.build;
  const load = () => {
    const current = wanted();
    ready.value = false;
    goleReady(current).then(
      () => current === wanted() && (ready.value = true),
      () => undefined,
    );
  };
  if (getCurrentInstance()) {
    onMounted(() => {
      load();
      watch(wanted, load);
    });
  } else if (typeof document !== "undefined") {
    load();
  }
  return ready;
}
