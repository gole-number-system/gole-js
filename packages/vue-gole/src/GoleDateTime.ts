import { defineComponent, h, onBeforeUnmount, onMounted, ref, watch, type PropType } from "vue";
import { goleDateLabel, goleDateSegments, type GoleBuild, type GoleDateInput } from "@gole-number-system/gole-core";
import { useGoleConfig } from "./config";
import { buildProp, renderFlat } from "./render";

const dateInput = [Date, Number, String] as PropType<GoleDateInput>;

const baseProps = {
  /**
   * A pattern of the tokens `YYYY YY MM DD HH hh mm ss A` (literal text in `[brackets]`), or
   * `Intl.DateTimeFormat` options such as `{ dateStyle: "medium" }` for locale-aware text.
   */
  format: [String, Object] as PropType<string | Intl.DateTimeFormatOptions>,
  /** Locale for `Intl.DateTimeFormat` options. Default: from `provideGole()`, otherwise the runtime's locale. */
  locale: [String, Array] as PropType<string | string[]>,
  /** Read the date in UTC instead of local time. */
  utc: Boolean,
  build: buildProp,
} as const;

interface BaseProps {
  format?: string | Intl.DateTimeFormatOptions;
  locale?: string | string[];
  utc: boolean;
  build?: GoleBuild;
}

function useTimeRenderer(props: BaseProps, defaultFormat: string) {
  const config = useGoleConfig();
  return (value: GoleDateInput) => {
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) return null;
    const options = {
      format: props.format ?? defaultFormat,
      locale: props.locale ?? config.value.locale,
      utc: props.utc,
      build: props.build ?? config.value.build,
    };
    return h(
      "time",
      { datetime: date.toISOString(), "aria-label": goleDateLabel(date, options) },
      renderFlat(goleDateSegments(date, options)),
    );
  };
}

/**
 * A date in Gole inside a `<time>` element. Day, month and each half of the year
 * are one symbol each: `<GoleDate value="2026-11-20" />` shows `[20]/[11]/[20][26]`.
 * Default format `"DD/MM/YYYY"`. Renders nothing for an invalid date.
 */
export const GoleDate = defineComponent({
  name: "GoleDate",
  props: {
    /** A `Date`, a timestamp or a date string. */
    value: { type: dateInput, required: true },
    ...baseProps,
  },
  setup(props) {
    const render = useTimeRenderer(props, "DD/MM/YYYY");
    return () => render(props.value);
  },
});

/**
 * A time of day in Gole: hours, minutes and seconds are one symbol each.
 *
 * ```html
 * <GoleTime />                                        <!-- live clock, [12]:[05]:[09] -->
 * <GoleTime :value="order.createdAt" format="HH:mm" />
 * ```
 *
 * A live clock renders an empty `<time>` on the server and starts when the component
 * is mounted, so hydration matches. Default format `"HH:mm:ss"`.
 */
export const GoleTime = defineComponent({
  name: "GoleTime",
  props: {
    /** A fixed time to show. Leave out for a live clock that shows the current time. */
    value: dateInput,
    /** How often a live clock updates, in milliseconds. Default `1000`. */
    interval: { type: Number, default: 1000 },
    ...baseProps,
  },
  setup(props) {
    const render = useTimeRenderer(props, "HH:mm:ss");
    const now = ref<Date | null>(null);
    let timer: ReturnType<typeof setInterval> | undefined;

    const stop = () => {
      if (timer !== undefined) clearInterval(timer);
      timer = undefined;
    };
    const start = () => {
      stop();
      if (props.value !== undefined) return;
      now.value = new Date();
      timer = setInterval(() => (now.value = new Date()), props.interval);
    };

    // The clock runs only while mounted, so nothing ticks during server rendering.
    let mounted = false;
    onMounted(() => {
      mounted = true;
      start();
    });
    watch(
      () => [props.value === undefined, props.interval],
      () => mounted && start(),
    );
    onBeforeUnmount(stop);

    return () => {
      if (props.value !== undefined) return render(props.value);
      return now.value ? render(now.value) : h("time");
    };
  },
});
