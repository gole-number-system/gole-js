# @gole-number-system/vue-gole

Vue 3 components, a `v-gole` directive and composables for showing numbers in the **Gole Number System** (base 100: one symbol for each pair of decimal digits).

> **Licence:** the code is open source under MIT. Showing Gole symbols uses the GoleStandard font and the Gole Number System, which are under the [Gole Number System Community Licence v1.0](https://www.esetu.in/gole-number-system/licence). Free to use with attribution; conditions apply. See [Licence](#licence).

The padding rules come from [`@gole-number-system/gole-core`](https://github.com/gole-number-system/gole-js/tree/main/packages/gole-core); the symbols come from the [GoleStandard font](https://github.com/esetu-solutions/gole-number-system-fonts). Both are installed with this package.

## Install

```sh
npm install @gole-number-system/vue-gole
```

Needs Vue 3.3 or later.

## Use

Load the font once, in your entry file. The stylesheet imports the GoleStandard font and the two classes the components use (`gole` for digits, `gole-number` for a whole number), so it needs a bundler that resolves CSS imports from `node_modules` (Vite, Nuxt and webpack all do).

```ts
// main.ts
import { createApp } from "vue";
import "@gole-number-system/vue-gole/styles.css";
import { GolePlugin } from "@gole-number-system/vue-gole";
import App from "./App.vue";

createApp(App).use(GolePlugin).mount("#app");
```

`GolePlugin` registers every component and the `v-gole` directive globally:

```vue
<template>
  <Gole :value="123" />                       <!-- 0123, 2 symbols -->
  <Gole :value="12747.2" :decimals="2" />     <!-- 012747.20 -->
  <GoleText>Invoice 5055-002347, 3 items</GoleText>
  <GoleCurrency :value="1234.5" currency="INR" locale="en-IN" />
  <GoleDate value="2026-11-20" /> <GoleTime />
  <td v-gole>{{ order.reference }}</td>
</template>
```

Every component renders the digits in the Gole font and leaves signs, separators, currency signs and letters in your page font. The wrapper has `role="img"` and an `aria-label` with the decimal value, so screen readers read the number normally.

### Without the plugin

Import what you need; nothing has to be registered globally.

```vue
<script setup lang="ts">
import { Gole, GoleText, vGole } from "@gole-number-system/vue-gole";
</script>

<template>
  <Gole :value="total" :decimals="2" />
  <p v-gole>Order 123 ships in 3 days</p>
</template>
```

### The PUA build and other defaults

The font comes in two builds with the same family name; load only one. With the Ligature build (the default) the text stays as decimal digits. For the PUA build import `styles-pua.css` instead and set the build once:

```ts
import "@gole-number-system/vue-gole/styles-pua.css";

createApp(App).use(GolePlugin, { build: "pua", locale: "en-IN" });
```

To set defaults for one part of the app, call `provideGole()` in a component's `setup`. It takes a plain object, a ref or a getter, and settings you leave out keep the value from further up.

```ts
import { provideGole } from "@gole-number-system/vue-gole";

provideGole({ build: "pua" });
provideGole(() => ({ locale: locale.value }));
```

A `build` or `locale` prop on a component wins over both.

### The directive

`v-gole` converts an element's text in place. Use it on elements that hold only text.

```vue
<td v-gole>Invoice 5055-002347</td>               <!-- the element's own text -->
<td v-gole="total"></td>                          <!-- a bound value -->
<td v-gole="{ value: total, decimals: 2 }"></td>  <!-- a value with options -->
<td v-gole.pua="total"></td>                      <!-- PUA build; v-gole:pua also works -->
```

The directive takes its defaults from `GolePlugin`, not from `provideGole()`. To register it by hand with other defaults use `app.directive("gole", createGoleDirective({ build: "pua" }))`. It runs in the browser only; for server rendering use the components.

### Composables

```ts
import { useGole, useGoleFontReady } from "@gole-number-system/vue-gole";

const { text, label, pairs } = useGole(() => props.total, { decimals: 2 });
const fontReady = useGoleFontReady();   // wait for it before drawing text on a canvas
```

### Server rendering

The components render on the server. `<GoleTime>` without a `value` renders an empty `<time>` on the server and starts its clock when mounted, so hydration matches.

### Types for globally registered components

For type checking of `<Gole>` in templates when you use the plugin, add this to a `.d.ts` file in your app:

```ts
import type * as G from "@gole-number-system/vue-gole";

declare module "vue" {
  interface GlobalComponents {
    Gole: typeof G.Gole;
    GoleText: typeof G.GoleText;
    // … and the other components you use
  }
}
```

## API

| Component | Use it for | Main props |
| --- | --- | --- |
| `<Gole>` | One number | `value`, `decimals`, `minPairs`, `build`, `tag` (or `as`), `label` |
| `<GoleText>` | Text that contains numbers: sentences, identifiers, dates. Converts the text in its default slot, including text in nested elements. Child components are left alone. | `grouping`, `decimalSeparator`, `minPairs`, `build`, `tag` |
| `<GoleSymbol>` | A single symbol, 0 to 99 | `value`, `build` |
| `<GoleDate>` | A date, in a `<time>` element | `value`, `format` (default `DD/MM/YYYY`), `locale`, `utc` |
| `<GoleTime>` | A time, or a live clock when `value` is omitted | `value`, `format` (default `HH:mm:ss`), `interval`, `utc` |
| `<GoleFormat>` | A number formatted by `Intl.NumberFormat` | `value`, `options`, `locale`, `minPairs`, `build`, `tag`, `label` |
| `<GoleCurrency>` | Money: ₹[12][34].[50] | `value`, `currency`, `currencyDisplay`, `locale` |
| `<GolePercent>` | A ratio as a percentage | `value`, `maximumFractionDigits`, `locale` |
| `<GoleCompact>` | Short form of large numbers: [01].[20]M | `value`, `compactDisplay`, `locale` |
| `<GoleUnit>` | A measurement: [72] km/h | `value`, `unit`, `unitDisplay`, `locale` |

Other attributes, such as `class` and `id`, go to the rendered element. The four preset components also take `minimumFractionDigits`, `maximumFractionDigits` and every `<GoleFormat>` prop except `options`.

| Export | What it does |
| --- | --- |
| `GolePlugin` | `app.use(GolePlugin, { build, locale, decimalSeparator, grouping })`: registers the components and `v-gole`, and sets the defaults |
| `provideGole(config)` | Sets the same defaults for the components below the current one |
| `useGoleConfig()` | The defaults in effect, as a computed ref |
| `vGole` | The directive, for local registration or `<script setup>` |
| `createGoleDirective(defaults)` | A `v-gole` directive with its own defaults |
| `useGole(value, options?)` | Computed `{ text, label, pairs, count, segments }` for building your own component. `value` and `options` can be refs or getters. |
| `useGoleFontReady(build?)` | A ref that turns `true` once the font has loaded |
| `formatDatePattern(date, pattern, utc?)` | The date helper from `gole-core` |

Date and time formats use the tokens `YYYY YY MM DD HH hh mm ss A`; put literal text in `[brackets]`. `format` also takes `Intl.DateTimeFormat` options, for example `:format="{ dateStyle: 'medium' }"`, which follow `locale`.

| Stylesheet | Contains |
| --- | --- |
| `@gole-number-system/vue-gole/styles.css` | Ligature font and the `gole` classes. Use this unless you need PUA. |
| `@gole-number-system/vue-gole/styles-pua.css` | PUA font and the `gole` classes. Also set `build: "pua"`. |

## Develop

This package lives in the [gole-js](https://github.com/gole-number-system/gole-js) repository, an npm workspace that also holds `gole-core`, the other framework packages and the examples. Run the commands from the repository root:

```sh
npm install        # links the packages to each other
npm run build      # gole-core first, then the packages that depend on it
npm test
npm run typecheck
```

To work on this package alone, add `-w @gole-number-system/vue-gole` to `npm run build`, `npm test` or `npm run typecheck`. Build `gole-core` first; this package imports its built output.

## Related packages

- [`@gole-number-system/gole-core`](https://github.com/gole-number-system/gole-js/tree/main/packages/gole-core): the padding logic, usable without Vue
- [`@gole-number-system/gole-elements`](https://github.com/gole-number-system/gole-js/tree/main/packages/gole-elements): web components for any framework
- [`@gole-number-system/react-gole`](https://github.com/gole-number-system/gole-js/tree/main/packages/react-gole): the same components for React
- [Examples](https://github.com/gole-number-system/gole-js/tree/main/examples): worked examples

## Licence

The code in this package is open source under the [MIT licence](LICENSE). The MIT licence covers the code only.

The GoleStandard font (installed with this package as `@esetu-solutions/gole-number-system-fonts`), the Gole Number System itself and the related patent rights are not covered by it. They are licensed by eSetu Solutions Pvt Ltd under the [Gole Number System Community Licence v1.0](https://www.esetu.in/gole-number-system/licence), which everyone who uses the font receives automatically. Free to use with attribution; conditions apply. See the [full terms](https://www.esetu.in/gole-number-system/licence), or contact [legal@esetu.in](mailto:legal@esetu.in) about a commercial licence.

The MIT licence grants no patent licence. Patent rights for the Gole Number System (Indian Patent Application No. 202441034973) are granted only under §2.6 of the Community Licence.

When you show Gole numbers, credit them as `Gole Number System™ by eSetu Solutions Pvt. Ltd. – https://esetu.in`. Gole Number System and eSetu are trademarks of eSetu.
