import { computed, defineComponent, h, type PropType } from "vue";
import { createGoleNumberFormat, type GoleNumberFormatOptions } from "@gole-number-system/gole-core";
import { useGoleConfig } from "./config";
import { buildProp, renderNumber, tagProps, valueProp } from "./render";

const sharedProps = {
  /** The number to show. */
  value: valueProp,
  /** Locale. Default: from `provideGole()` or `GolePlugin`, otherwise the runtime's locale. */
  locale: [String, Array] as PropType<string | string[]>,
  /** Minimum number of Gole symbols in the whole part. */
  minPairs: Number,
  /** Font build. Default: from `provideGole()` or `GolePlugin`, otherwise `"ligature"`. */
  build: buildProp,
  ...tagProps,
  /** Text for screen readers. Default: the ordinary decimal text, such as `"₹1,234.50"`. */
  label: String,
} as const;

/**
 * A number formatted for a locale, in Gole. The currency sign, percent sign, unit
 * and compact suffix keep the page font; only the digits are Gole symbols.
 *
 * ```html
 * <GoleFormat :value="1234.5" :options="{ style: 'currency', currency: 'INR' }" />  <!-- ₹[12][34].[50] -->
 * ```
 *
 * For the common cases use `<GoleCurrency>`, `<GolePercent>`, `<GoleCompact>` or `<GoleUnit>`.
 */
export const GoleFormat = defineComponent({
  name: "GoleFormat",
  props: {
    ...sharedProps,
    /**
     * `Intl.NumberFormat` options: `{ style: "currency", currency: "INR" }`,
     * `{ notation: "compact" }`, `{ minimumFractionDigits: 2 }`, …
     */
    options: Object as PropType<Intl.NumberFormatOptions>,
  },
  setup(props) {
    const config = useGoleConfig();
    // Keyed by content, so an inline `:options="{ … }"` object does not rebuild the formatter on every render.
    const key = computed(() =>
      JSON.stringify({
        ...props.options,
        locale: props.locale ?? config.value.locale,
        build: props.build ?? config.value.build,
        minPairs: props.minPairs,
      } satisfies GoleNumberFormatOptions),
    );
    const formatter = computed(() => createGoleNumberFormat(JSON.parse(key.value) as GoleNumberFormatOptions));
    return () =>
      renderNumber(
        props.tag ?? props.as ?? "span",
        props.label ?? formatter.value.label(props.value),
        formatter.value.segments(props.value),
      );
  },
});

const presetProps = {
  ...sharedProps,
  /** Fewest fraction digits to show. */
  minimumFractionDigits: Number,
  /** Most fraction digits to show; the value is rounded to fit. */
  maximumFractionDigits: Number,
} as const;

/** Money: `<GoleCurrency :value="1234.5" currency="INR" />` shows ₹[12][34].[50]. */
export const GoleCurrency = defineComponent({
  name: "GoleCurrency",
  props: {
    ...presetProps,
    /** ISO 4217 code: `"INR"`, `"USD"`, `"EUR"`. */
    currency: { type: String, required: true },
    /** How to show the currency: `"symbol"` (₹, default), `"code"` (INR) or `"name"` (Indian rupees). */
    currencyDisplay: String as PropType<Intl.NumberFormatOptions["currencyDisplay"]>,
  },
  setup(props) {
    return () => {
      const { currency, currencyDisplay, minimumFractionDigits, maximumFractionDigits, ...rest } = props;
      const options = { style: "currency", currency, currencyDisplay, minimumFractionDigits, maximumFractionDigits };
      return h(GoleFormat, { ...rest, options: options as Intl.NumberFormatOptions });
    };
  },
});

/** A ratio as a percentage: `<GolePercent :value="0.456" />` shows [46]%. The value is multiplied by 100. */
export const GolePercent = defineComponent({
  name: "GolePercent",
  props: presetProps,
  setup(props) {
    return () => {
      const { minimumFractionDigits, maximumFractionDigits, ...rest } = props;
      return h(GoleFormat, { ...rest, options: { style: "percent", minimumFractionDigits, maximumFractionDigits } });
    };
  },
});

/**
 * A short form for large numbers: `<GoleCompact :value="1234567" />` shows [01].[20]M.
 * With `locale="en-IN"` the names are lakh and crore.
 */
export const GoleCompact = defineComponent({
  name: "GoleCompact",
  props: {
    ...presetProps,
    /** `"short"` (1.2M, default) or `"long"` (1.2 million). */
    compactDisplay: String as PropType<Intl.NumberFormatOptions["compactDisplay"]>,
  },
  setup(props) {
    return () => {
      const { compactDisplay, minimumFractionDigits, maximumFractionDigits, ...rest } = props;
      const options = { notation: "compact", compactDisplay, minimumFractionDigits, maximumFractionDigits };
      return h(GoleFormat, { ...rest, options: options as Intl.NumberFormatOptions });
    };
  },
});

/** A measurement: `<GoleUnit :value="72" unit="kilometer-per-hour" />` shows [72] km/h. */
export const GoleUnit = defineComponent({
  name: "GoleUnit",
  props: {
    ...presetProps,
    /** A unit `Intl.NumberFormat` knows: `"kilogram"`, `"celsius"`, `"kilometer-per-hour"`, … */
    unit: { type: String, required: true },
    /** `"short"` (kg, default), `"narrow"` or `"long"` (kilograms). */
    unitDisplay: String as PropType<Intl.NumberFormatOptions["unitDisplay"]>,
  },
  setup(props) {
    return () => {
      const { unit, unitDisplay, minimumFractionDigits, maximumFractionDigits, ...rest } = props;
      const options = { style: "unit", unit, unitDisplay, minimumFractionDigits, maximumFractionDigits };
      return h(GoleFormat, { ...rest, options: options as Intl.NumberFormatOptions });
    };
  },
});
