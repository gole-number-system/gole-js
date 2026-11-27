# @gole-number-system/svelte-gole

Svelte components and an action for showing numbers in the **Gole Number System** (base 100: one symbol for each pair of decimal digits).

> **Licence:** the code is open source under MIT. Showing Gole symbols uses the GoleStandard font and the Gole Number System, which are under the [Gole Number System Community Licence v1.0](https://www.esetu.in/gole-number-system/licence). Free to use with attribution; conditions apply. See [Licence](#licence).

The padding rules come from [`@gole-number-system/gole-core`](https://github.com/gole-number-system/gole-js/tree/main/packages/gole-core); the symbols come from the [GoleStandard font](https://github.com/esetu-solutions/gole-number-system-fonts). Both are installed with this package.

## Install

```sh
npm install @gole-number-system/svelte-gole
```

Needs Svelte 5. The package ships uncompiled `.svelte` files (with TypeScript in them) and type definitions, so your project compiles them with its own Svelte version. SvelteKit and Vite with `@sveltejs/vite-plugin-svelte` do this without extra setup.

## Use

Load the font once, at the root of your app. In SvelteKit that is `src/routes/+layout.svelte`:

```svelte
<script>
  import "@gole-number-system/svelte-gole/styles.css";
  let { children } = $props();
</script>

{@render children()}
```

`styles.css` loads the Ligature build of the GoleStandard font and the two classes the components use (`gole` and `gole-number`). Your bundler resolves the font files from `node_modules`. Without this import the components show padded decimal digits in the page font.

Then use the components:

```svelte
<script>
  import { Gole, GoleText, GoleCurrency, GoleDate, GoleTime } from "@gole-number-system/svelte-gole";
</script>

<Gole value={123} />                          <!-- 0123, 2 symbols -->
<Gole value={12747.2} decimals={2} />         <!-- 012747.20 -->
<GoleText text="Invoice 5055-002347, 3 items" />
<GoleCurrency value={1234.5} currency="INR" locale="en-IN" />
<GoleDate value="2026-11-20" />               <!-- 20/11/2026 -->
<GoleTime />                                  <!-- live clock -->
```

Every component renders the digits in `<span class="gole">` and leaves signs, separators, currency signs and letters in your page font. The wrapper has the class `gole-number`, `role="img"` and an `aria-label` with the ordinary decimal text, so screen readers read the number normally. Other attributes (`id`, `style`, `class`, event handlers) are passed on to the wrapper.

### The action

`use:gole` converts an element you already have:

```svelte
<script>
  import { gole } from "@gole-number-system/svelte-gole";
  let total = $state(123);
</script>

<td use:gole={{ value: total, decimals: 2 }}></td>
<p use:gole>Invoice 5055-002347</p>
```

With a `value` the element shows that value and follows it when it changes. Without one, the element's own text is converted once, when the element is mounted; text that changes later must be passed as `value`. The action runs in the browser only, so server-rendered HTML holds the plain text until hydration. Use a component where that matters.

### Defaults: PUA build and locale

The font has two builds with the same family name. Load one of them:

| Import | Build | Also needed |
| --- | --- | --- |
| `@gole-number-system/svelte-gole/styles.css` | Ligature: the text stays decimal digits and the font joins each pair. Use this unless you need PUA. | Nothing |
| `@gole-number-system/svelte-gole/styles-pua.css` | PUA: each pair is one Private Use Area character. | `build: "pua"` |

Set the build and the locale once for all components below a component, usually in the root layout:

```svelte
<script>
  import "@gole-number-system/svelte-gole/styles-pua.css";
  import { setGoleContext } from "@gole-number-system/svelte-gole";

  setGoleContext({ build: "pua", locale: "en-IN" });
</script>
```

A `build` or `locale` prop on a component wins over the context. To change the defaults later, pass a `$state` object and change its properties. The action cannot read the context: pass `build: "pua"` in its options.

## API

| Export | Use it for | Main props or arguments |
| --- | --- | --- |
| `<Gole>` | One number | `value`, `decimals`, `minPairs`, `build`, `label`, `tag` |
| `<GoleText>` | Text that contains numbers: sentences, identifiers, dates | `text`, `grouping`, `decimalSeparator`, `minPairs`, `build`, `tag` |
| `<GoleSymbol>` | A single symbol, 0 to 99 | `value`, `build` |
| `<GoleDate>` | A date, in a `<time>` element | `value`, `format` (default `DD/MM/YYYY`), `locale`, `utc`, `build` |
| `<GoleTime>` | A time, or a live clock when `value` is left out | `value`, `format` (default `HH:mm:ss`), `interval` (default `1000`), `locale`, `utc`, `build` |
| `<GoleFormat>` | A number formatted by `Intl.NumberFormat` | `value`, `options`, `locale`, `minPairs`, `build`, `label`, `tag` |
| `<GoleCurrency>` | Money | `value`, `currency`, `currencyDisplay`, `locale` |
| `<GolePercent>` | A ratio as a percentage (the value is multiplied by 100) | `value`, `locale` |
| `<GoleCompact>` | Short forms such as 1.2M or 12L | `value`, `compactDisplay`, `locale` |
| `<GoleUnit>` | A measurement | `value`, `unit`, `unitDisplay`, `locale` |
| `use:gole` | Converting an existing element | `{ value, decimals, minPairs, build, decimalSeparator, grouping }` |
| `setGoleContext(config)` | Defaults for the components below | `{ build, locale }` |
| `getGoleContext()` | Reading those defaults in your own component | |

Notes:

- `tag` is the element to render, default `"span"`. `label` replaces the text for screen readers.
- `<GoleCurrency>`, `<GolePercent>`, `<GoleCompact>` and `<GoleUnit>` also take `minimumFractionDigits`, `maximumFractionDigits` and every `<GoleFormat>` prop except `options`.
- `format` on `<GoleDate>` and `<GoleTime>` is a pattern of the tokens `YYYY YY MM DD HH hh mm ss A` with literal text in `[brackets]`, or `Intl.DateTimeFormat` options such as `{ dateStyle: "medium" }`. An invalid date renders nothing.
- A live `<GoleTime>` renders an empty `<time>` on the server and starts when it is mounted, so hydration matches. Its timer stops when the component is destroyed.
- The prop types are exported: `GoleProps`, `GoleTextProps`, `GoleFormatProps` and so on, plus `GoleConfig` and `GoleActionOptions`.

For anything else (canvas, chart labels, `title` attributes) use the functions of [`@gole-number-system/gole-core`](https://github.com/gole-number-system/gole-js/tree/main/packages/gole-core) directly, for example `toGole(123)` inside `$derived`.

## Develop

This package lives in the [gole-js](https://github.com/gole-number-system/gole-js) repository, an npm workspace that also holds `gole-core`, the packages for other frameworks and the examples. Run the commands from the repository root:

```sh
npm install        # links the packages to each other
npm run build      # gole-core first, then the packages that use it
npm test
npm run typecheck
```

To work on this package alone, add `-w @gole-number-system/svelte-gole` to `npm run build`, `npm test` or `npm run typecheck`. Build `gole-core` first; this package imports its built output.

The source is in `src/lib`. `npm run build` runs `svelte-package`, which copies the `.svelte` files to `dist` and writes the type definitions. `npm run typecheck` runs `svelte-check`. The tests run in Vitest in two ways: in jsdom with `@testing-library/svelte`, and rendered to HTML with `svelte/server`.

## Related packages

- [`@gole-number-system/gole-core`](https://github.com/gole-number-system/gole-js/tree/main/packages/gole-core): the padding logic, usable without Svelte
- [`@gole-number-system/gole-elements`](https://github.com/gole-number-system/gole-js/tree/main/packages/gole-elements): web components for any framework
- [`@gole-number-system/react-gole`](https://github.com/gole-number-system/gole-js/tree/main/packages/react-gole): React components
- [Examples](https://github.com/gole-number-system/gole-js/tree/main/examples): worked examples

## Licence

The code in this package is open source under the [MIT licence](LICENSE). The MIT licence covers the code only.

The GoleStandard font (installed with this package as `@esetu-solutions/gole-number-system-fonts`), the Gole Number System itself and the related patent rights are not covered by it. They are licensed by eSetu Solutions Pvt Ltd under the [Gole Number System Community Licence v1.0](https://www.esetu.in/gole-number-system/licence), which everyone who uses the font receives automatically. Free to use with attribution; conditions apply. See the [full terms](https://www.esetu.in/gole-number-system/licence), or contact [legal@esetu.in](mailto:legal@esetu.in) about a commercial licence.

The MIT licence grants no patent licence. Patent rights for the Gole Number System (Indian Patent Application No. 202441034973) are granted only under §2.6 of the Community Licence.

When you show Gole numbers, credit them as `Gole Number System™ by eSetu Solutions Pvt. Ltd. – https://esetu.in`. Gole Number System and eSetu are trademarks of eSetu.
