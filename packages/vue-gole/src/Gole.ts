import { defineComponent } from "vue";
import { goleLabel, goleSegments } from "@gole-number-system/gole-core";
import { useGoleOptions } from "./config";
import { buildProp, renderNumber, tagProps, valueProp } from "./render";

/**
 * One number in Gole.
 *
 * ```html
 * <Gole :value="987654" />                <!-- [98][76][54] -->
 * <Gole :value="12747.2" :decimals="2" /> <!-- [01][27][47].[20] -->
 * <Gole :value="-4.5" />                  <!-- -[04].[50] -->
 * ```
 *
 * The padding is added for you. Screen readers get the decimal value, and with the
 * Ligature build copy-paste gives plain digits.
 */
export const Gole = defineComponent({
  name: "Gole",
  props: {
    /** The number to show: `123`, `"12.5"`, `10n`. Dates, times and codes such as `"12:05"` also work. */
    value: valueProp,
    /** Fixed number of fraction digits, rounded half away from zero. */
    decimals: Number,
    /** Minimum number of Gole symbols in the whole part. */
    minPairs: Number,
    /** Font build. Default: from `provideGole()` or `GolePlugin`, otherwise `"ligature"`. */
    build: buildProp,
    ...tagProps,
    /** Text for screen readers. Default: the decimal value. */
    label: String,
  },
  setup(props) {
    const options = useGoleOptions(() => props);
    return () =>
      renderNumber(
        props.tag ?? props.as ?? "span",
        props.label ?? goleLabel(props.value, options.value),
        goleSegments(props.value, options.value),
      );
  },
});
