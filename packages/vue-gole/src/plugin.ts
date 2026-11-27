import { computed, type App, type Plugin } from "vue";
import { GOLE_CONFIG, type GoleConfig } from "./config";
import { createGoleDirective } from "./directive";
import { Gole } from "./Gole";
import { GoleDate, GoleTime } from "./GoleDateTime";
import { GoleCompact, GoleCurrency, GoleFormat, GolePercent, GoleUnit } from "./GoleFormat";
import { GoleSymbol } from "./GoleSymbol";
import { GoleText } from "./GoleText";

const components = {
  Gole,
  GoleText,
  GoleSymbol,
  GoleDate,
  GoleTime,
  GoleFormat,
  GoleCurrency,
  GolePercent,
  GoleCompact,
  GoleUnit,
};

/**
 * Registers every component and the `v-gole` directive globally and sets the defaults.
 *
 * ```ts
 * createApp(App).use(GolePlugin).mount("#app");
 * createApp(App).use(GolePlugin, { build: "pua", locale: "en-IN" }).mount("#app");
 * ```
 */
export const GolePlugin: Plugin<[options?: GoleConfig]> = {
  install(app: App, options: GoleConfig = {}) {
    app.provide(
      GOLE_CONFIG,
      computed(() => options),
    );
    for (const [name, component] of Object.entries(components)) app.component(name, component);
    app.directive("gole", createGoleDirective(options));
  },
};
