import { defineComponent, h } from "vue";
import { goleSymbol } from "@gole-number-system/gole-core";
import { useGoleConfig } from "./config";
import { buildProp } from "./render";

/** A single Gole symbol, for glyph tables, legends and teaching material: `<GoleSymbol :value="35" />`. */
export const GoleSymbol = defineComponent({
  name: "GoleSymbol",
  props: {
    /** An integer from 0 to 99. */
    value: { type: Number, required: true },
    build: buildProp,
  },
  setup(props) {
    const config = useGoleConfig();
    return () =>
      h(
        "span",
        { class: "gole gole-symbol", role: "img", "aria-label": String(props.value) },
        goleSymbol(props.value, props.build ?? config.value.build),
      );
  },
});
