# @gole-number-system/gole-elements

Web components for showing numbers in the **Gole Number System** (base 100: one symbol for each pair of decimal digits). They are standard custom elements, so they work in plain HTML and in any framework: Angular, Vue, Svelte, Lit, server-rendered pages.

> **Licence:** the code is open source under MIT. Showing Gole symbols uses the GoleStandard font and the Gole Number System, which are under the [Gole Number System Community Licence v1.0](https://www.esetu.in/gole-number-system/licence). Free to use with attribution; conditions apply. See [Licence](#licence).

```html
<gole-number value="123"></gole-number>
<gole-number value="1234.5" format="currency" currency="INR"></gole-number>
<gole-text>Invoice 5055-002347, due 20/11/2026</gole-text>
<gole-time></gole-time>
```

The padding rules come from [`@gole-number-system/gole-core`](https://github.com/gole-number-system/gole-js/tree/main/packages/gole-core); the symbols come from the [GoleStandard font](https://github.com/esetu-solutions/gole-number-system-fonts). Both are installed with this package.

## Install

```sh
npm install @gole-number-system/gole-elements
```

## Quick start

With a bundler:

```js
import "@gole-number-system/gole-elements/gole.css"; // font + styles, once in your app
import "@gole-number-system/gole-elements/define";   // registers the four elements
```

Without a bundler, one stylesheet and one script:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@esetu-solutions/gole-number-system-fonts/fonts/Ligature/GoleStandard.css" />
<style>.gole { font-family: "GoleStandard"; }</style>
<script src="https://cdn.jsdelivr.net/npm/@gole-number-system/gole-elements"></script>

<p>Total: <gole-number value="12747.2" decimals="2"></gole-number></p>
```

Each element shows the digits in the Gole font and leaves signs, separators, currency symbols and letters in the page font. The element has `role="img"` and an `aria-label` with the ordinary decimal text, so screen readers read the number normally.

## Elements

### `<gole-number>`

One number. Give the value as an attribute or as the element's text.

```html
<gole-number value="123"></gole-number>
<gole-number decimals="2">12747.2</gole-number>
<gole-number value="7" min-pairs="2"></gole-number>
<gole-number value="1234.5" format="currency" currency="INR" locale="en-IN"></gole-number>
<gole-number value="0.456" format="percent"></gole-number>
<gole-number value="1234567" format="compact"></gole-number>
<gole-number value="72" format="unit" unit="kilogram"></gole-number>
```

| Attribute | Meaning |
| --- | --- |
| `value` | The number. Without it, the element's text is used. |
| `decimals` | Fixed number of fraction digits |
| `min-pairs` | Minimum number of symbols in the whole part |
| `format` | `currency`, `percent`, `compact` or `unit`: formats the number for the locale first |
| `currency`, `currency-display` | With `format="currency"`: the ISO code, and `symbol`, `narrowSymbol`, `code` or `name` |
| `unit`, `unit-display` | With `format="unit"`: a unit such as `kilogram` or `kilometer-per-hour`, and `short`, `narrow` or `long` |
| `compact-display` | With `format="compact"`: `short` or `long` |
| `min-fraction-digits`, `max-fraction-digits` | With any `format` |
| `locale` | Locale for `format`. Default: the page's locale. |
| `build` | `pua` if the page loads the PUA font |

### `<gole-text>`

Mixed text. Every run of digits in it is shown in Gole, each padded on its own.

```html
<gole-text>Invoice 5055-002347 · 20/11/2026 · 12:05</gole-text>
<gole-text grouping=",">Total 1,234.5 kg</gole-text>
<gole-text decimal-separator="none">Version 1.5.2026</gole-text>
```

| Attribute | Meaning |
| --- | --- |
| `value` | The text. Without it, the element's text is used. |
| `grouping` | Thousands separator to remove, e.g. `,` |
| `decimal-separator` | Character that starts a fraction (default `.`). `none` treats every run of digits as a whole number. |
| `min-pairs`, `build` | As for `<gole-number>` |

The content is treated as plain text; markup inside the element is not kept.

### `<gole-date>` and `<gole-time>`

```html
<gole-date value="2026-11-20"></gole-date>
<gole-date value="2026-11-20T09:05" format="DD.MM.YY HH:mm"></gole-date>
<gole-date value="2026-11-20" date-style="medium" locale="en-IN"></gole-date>

<gole-time></gole-time>                                   <!-- live clock -->
<gole-time format="HH:mm" interval="60000"></gole-time>   <!-- live, updates every minute -->
<gole-time value="2026-11-20T09:05" format="hh:mm A"></gole-time>
```

| Attribute | Meaning |
| --- | --- |
| `value` | An ISO date string or a timestamp in milliseconds. Without it, `<gole-date>` shows today and `<gole-time>` is a live clock. |
| `format` | Pattern with the tokens `YYYY YY MM DD HH hh mm ss A`; literal text in `[brackets]`. Default `DD/MM/YYYY` for dates, `HH:mm:ss` for times. |
| `date-style`, `time-style` | `full`, `long`, `medium` or `short`: use the locale's own format instead of `format` |
| `locale` | Locale for `date-style` and `time-style` |
| `utc` | Show the date in UTC |
| `interval` | `<gole-time>` only: milliseconds between updates of the live clock (default 1000) |
| `build` | As for `<gole-number>` |

## Changing a value

Set the attribute or the `value` property; the element renders again.

```js
const total = document.querySelector("gole-number");
total.value = 1500;                    // property
total.setAttribute("decimals", "2");   // attribute
```

Setting the element's text also works; call `element.update()` afterwards.

## JavaScript API

```js
import { defineGoleElements, setGoleElementDefaults } from "@gole-number-system/gole-elements";

defineGoleElements({ build: "pua", locale: "en-IN" }); // register, with page-wide defaults
setGoleElementDefaults({ locale: "hi-IN" });           // change defaults later; elements render again
```

| Export | What it does |
| --- | --- |
| `defineGoleElements(defaults?)` | Registers the four elements. Safe to call more than once, and does nothing on the server. |
| `setGoleElementDefaults(defaults)` | Sets `build` and `locale` for every element on the page |
| `GoleNumberElement`, `GoleTextElement`, `GoleDateElement`, `GoleTimeElement` | The element classes, for subclassing or registering under other names |

Importing `@gole-number-system/gole-elements/define` calls `defineGoleElements()` for you. The script build exposes the same API as `window.GoleElements`.

## The PUA font build

The font ships in two builds; see [gole-core](https://github.com/gole-number-system/gole-js/tree/main/packages/gole-core#which-font-build) for the difference. To use the PUA build, load its stylesheet and set the default once:

```js
import "@gole-number-system/gole-elements/gole-pua.css";
import { defineGoleElements } from "@gole-number-system/gole-elements";

defineGoleElements({ build: "pua" });
```

## Styling

The elements render into their own content, without a shadow root, so they inherit the page's font, size and colour, and your CSS applies directly:

```css
gole-number { font-size: 1.5rem; color: rebeccapurple; }
gole-number .gole { letter-spacing: 0; }   /* the digits */
```

## Frameworks

- **Vue:** tell the compiler the tags are custom elements: `compilerOptions.isCustomElement = (tag) => tag.startsWith("gole-")`.
- **Angular:** add `CUSTOM_ELEMENTS_SCHEMA` to the component's `schemas`.
- **Svelte, Lit, htmx, server templates:** nothing to configure.
- **React:** works from React 19. [`@gole-number-system/react-gole`](https://github.com/gole-number-system/gole-js/tree/main/packages/react-gole) offers more.
- **TypeScript:** the tags are added to `HTMLElementTagNameMap`, so `document.querySelector("gole-number")` is typed.

On the server the elements are sent as written (the value as an attribute or as text) and are converted when the script runs in the browser.

## Develop

This package lives in the [gole-js](https://github.com/gole-number-system/gole-js) repository, an npm workspace. Run the commands from the repository root:

```sh
npm install
npm run build
npm test
npm run typecheck
```

To work on this package alone, add `-w @gole-number-system/gole-elements` to `npm test` or `npm run typecheck`, or run `npm run build @gole-number-system/gole-elements`, which builds `gole-core` first.

## Related packages

- [`@gole-number-system/gole-core`](https://github.com/gole-number-system/gole-js/tree/main/packages/gole-core): the padding logic and formatters
- [`@gole-number-system/react-gole`](https://github.com/gole-number-system/gole-js/tree/main/packages/react-gole): React components
- [Examples](https://github.com/gole-number-system/gole-js/tree/main/examples): worked examples

## Licence

The code in this package is open source under the [MIT licence](LICENSE). The MIT licence covers the code only.

The GoleStandard font (installed with this package as `@esetu-solutions/gole-number-system-fonts`), the Gole Number System itself and the related patent rights are not covered by it. They are licensed by eSetu Solutions Pvt Ltd under the [Gole Number System Community Licence v1.0](https://www.esetu.in/gole-number-system/licence), which everyone who uses the font receives automatically. Free to use with attribution; conditions apply. See the [full terms](https://www.esetu.in/gole-number-system/licence), or contact [legal@esetu.in](mailto:legal@esetu.in) about a commercial licence.

The MIT licence grants no patent licence. Patent rights for the Gole Number System (Indian Patent Application No. 202441034973) are granted only under §2.6 of the Community Licence.

When you show Gole numbers, credit them as `Gole Number System™ by eSetu Solutions Pvt. Ltd. – https://esetu.in`. Gole Number System and eSetu are trademarks of eSetu.
