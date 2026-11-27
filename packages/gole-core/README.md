# @gole-number-system/gole-core

Core logic for showing numbers in the **Gole Number System**. Gole is base 100: one symbol for each value from 0 to 99, so every symbol stands for a pair of decimal digits.

> **Licence:** the code is open source under MIT. Showing Gole symbols uses the GoleStandard font and the Gole Number System, which are under the [Gole Number System Community Licence v1.0](https://www.esetu.in/gole-number-system/licence). Free to use with attribution; conditions apply. See [Licence](#licence).

The [GoleStandard font](https://github.com/esetu-solutions/gole-number-system-fonts) draws the symbols, but it needs the digits prepared first. This package does that preparation:

| Rule | Example |
| --- | --- |
| A whole part with an odd number of digits gets a `0` on the left | `123` → `0123` → 2 symbols |
| A fraction with an odd number of digits gets a `0` on the right | `12.5` → `12.50` |
| Signs, separators, units and letters stay as they are | `-4.5 kg` → `-04.50 kg` |
| In mixed text every run of digits is padded on its own | `20/11/2026 9:05` → `20/11/2026 09:05` |

It has no runtime dependencies other than the fonts package, and works in the browser and in Node.

## Install

```sh
npm install @gole-number-system/gole-core
```

`@esetu-solutions/gole-number-system-fonts` is installed with it.

## Quick start

```js
import "@gole-number-system/gole-core/gole.css"; // loads the font, defines .gole
import { renderGole, toGole } from "@gole-number-system/gole-core";

toGole(123);   // "0123"
toGole(12.5);  // "12.50"

// Convert every <span data-gole>123</span> on the page
renderGole();
```

```html
<span data-gole>123</span>
<span data-gole data-gole-decimals="2">12747.2</span>
<span data-gole>Due 20/11/2026 at 9:05</span>
```

Without a bundler, use the global build. It exposes `window.Gole`:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@esetu-solutions/gole-number-system-fonts/fonts/Ligature/GoleStandard.css" />
<style>.gole { font-family: "GoleStandard"; }</style>
<script src="https://cdn.jsdelivr.net/npm/@gole-number-system/gole-core"></script>
<script>Gole.renderGole();</script>
```

## Which font build

The font ships in two builds with the same family name. Load only one.

| Build | Stylesheet | Text in the page | Use |
| --- | --- | --- | --- |
| Ligature (default) | `@gole-number-system/gole-core/gole.css` | Padded digits, e.g. `0123`. The font joins each pair. | Most cases. Copy, paste and search keep working. |
| PUA | `@gole-number-system/gole-core/gole-pua.css` | One private-use character per pair (U+E441 to U+E4A4). | Where ligatures are unavailable, such as canvas, some PDF tools or text with letter-spacing. |

Pass `{ build: "pua" }` to any function, or call `toGolePUA()`, when you load the PUA build.

The font only contains Gole symbols. Apply it to the digits only, as `goleHTML()` and `renderGole()` do, so that `.`, `-` and letters keep the page font.

## API

### Strings

| Function | Returns |
| --- | --- |
| `toGole(value, options?)` | Padded text for the Ligature build: `toGole(123)` → `"0123"` |
| `toGolePUA(value, options?)` | Text for the PUA build |
| `golePairs(value, options?)` | Digit pairs: `golePairs(123)` → `["01", "23"]` |
| `goleCount(value, options?)` | Number of Gole symbols |
| `goleLabel(value, options?)` | The plain decimal text, for `aria-label` |
| `goleSymbol(n, build?)` | Text for one symbol, `n` from 0 to 99 |
| `fromGole(text)` / `fromGolePUA(text)` | Back to a decimal number |
| `createGoleFormatter(options)` | A reusable `(value) => string` |
| `padInteger(digits)` / `padFraction(digits)` | The two padding steps on their own |
| `goleSegments(value, options?)` | The parsed pieces (text and number segments) that everything else is built on |

`value` can be a number, a bigint or a string. Use a string for long identifiers and for exact decimals; numbers above `Number.MAX_SAFE_INTEGER` lose digits before they reach this package.

### Currency, percent, compact and units

These format the number for a locale with `Intl.NumberFormat` first, then pad the digits. Thousands separators are left out, because each Gole symbol already groups two digits; the label keeps them.

```js
import { createGoleNumberFormat, goleCurrency, goleCompact, golePercent, goleUnit } from "@gole-number-system/gole-core";

goleCurrency(1234.5, "INR", { locale: "en-IN" });  // "₹1234.50"
golePercent(0.456);                                 // "46%"
goleCompact(1234567, { locale: "en-IN" });          // "12L"
goleUnit(72, "kilogram");                           // "72 kg"

const inr = createGoleNumberFormat({ style: "currency", currency: "INR", locale: "en-IN" });
inr.format(1234.5);  // "₹1234.50"   text for the page
inr.label(1234.5);   // "₹1,234.50"  for aria-label
inr.html(1234.5);    // HTML with the digits in <span class="gole">
```

| Function | Returns |
| --- | --- |
| `createGoleNumberFormat(options)` | A reusable formatter with `format`, `label`, `segments` and `html`. Create it once and reuse it. |
| `goleFormat(value, options?)` | Formatted text. `goleFormatLabel`, `goleFormatSegments` and `goleFormatHTML` give the other forms. |
| `goleCurrency(value, currency, options?)` | Currency, e.g. `"INR"` |
| `golePercent(value, options?)` | Percentage: `0.456` → `46%` |
| `goleCompact(value, options?)` | Short form: `1234567` → `12L` in `en-IN` |
| `goleUnit(value, unit, options?)` | A unit such as `"kilogram"` or `"kilometer-per-hour"` |

`options` takes everything `Intl.NumberFormat` takes (`minimumFractionDigits`, `currencyDisplay`, `compactDisplay` and so on) plus `locale`, `build` and `minPairs`. Digits are always the Latin digits 0 to 9, whatever the locale, because those are what the font converts.

Apply the Gole font to the digits only: use `html()` or `segments()` rather than putting `format()` output in a `.gole` element, or the currency symbol will have no glyph.

### Dates and times

```js
import { goleDate, goleDateLabel } from "@gole-number-system/gole-core";

goleDate("2026-11-20T09:05");                               // "20/11/2026"
goleDate(new Date(), { format: "DD.MM.YY HH:mm" });
goleDate(Date.now(), { format: { dateStyle: "medium" }, locale: "en-IN" }); // "20 Nov 2026"
```

| Function | Returns |
| --- | --- |
| `goleDate(value, options?)` | The date as text, every part padded on its own |
| `goleDateSegments(value, options?)` | The parsed pieces, for rendering |
| `goleDateLabel(value, options?)` | The ordinary text, for `aria-label` |
| `formatDatePattern(date, pattern, utc?)` | The pattern step on its own |

`value` is a `Date`, a timestamp or a date string. `format` is a pattern with the tokens `YYYY YY MM DD HH hh mm ss A` (literal text in `[brackets]`; default `DD/MM/YYYY`) or an `Intl.DateTimeFormat` options object. Other options: `locale`, `utc`, `build`.

### Options

| Option | Default | Meaning |
| --- | --- | --- |
| `build` | `"ligature"` | `"ligature"` or `"pua"` |
| `decimals` | none | Fixed number of fraction digits, rounded half away from zero. Single numbers only. |
| `minPairs` | none | Minimum number of symbols in the whole part: `minPairs: 2` writes 7 as `0007` |
| `decimalSeparator` | `"."` | Character that starts a fraction in mixed text. `false` treats every digit run as a whole number, as in `1.5.2026`. |
| `grouping` | `false` | Thousands separator to remove in mixed text, e.g. `","` |

### DOM

| Function | What it does |
| --- | --- |
| `goleHTML(value, options?)` | An HTML string: digits wrapped in `<span class="gole">`, inside a `<span class="gole-number" role="img" aria-label="…">` |
| `renderGole(root?, options?)` | Converts every `[data-gole]` element under `root`. Safe to call again; to change a value, set `data-gole-value` and call it again. Per-element options: `data-gole-decimals`, `data-gole-min-pairs`, `data-gole-build`. |
| `goleReady(build?)` | A promise that resolves when the font has loaded |

## Develop

This package lives in the [gole-js](https://github.com/gole-number-system/gole-js) repository, an npm workspace that also holds the framework packages and the examples. Run the commands from the repository root:

```sh
npm install        # links the packages to each other
npm run build      # every package, in dependency order
npm test
npm run typecheck
```

To work on this package alone, add `-w @gole-number-system/gole-core` to `npm run build`, `npm test` or `npm run typecheck`.

## Related packages

- [`@esetu-solutions/gole-number-system-fonts`](https://github.com/esetu-solutions/gole-number-system-fonts): the font files
- [`@gole-number-system/gole-elements`](https://github.com/gole-number-system/gole-js/tree/main/packages/gole-elements): web components for plain HTML and any framework
- [`@gole-number-system/react-gole`](https://github.com/gole-number-system/gole-js/tree/main/packages/react-gole): React components
- [`@gole-number-system/react-gole-charts`](https://github.com/gole-number-system/gole-js/tree/main/packages/react-gole-charts): Recharts components
- [All packages](https://github.com/gole-number-system/gole-js#packages): Vue, Angular, Svelte, React Native, Tailwind CSS and chart and table adapters
- [Examples](https://github.com/gole-number-system/gole-js/tree/main/examples): worked examples

## Licence

The code in this package is open source under the [MIT licence](LICENSE). The MIT licence covers the code only.

The GoleStandard font (installed with this package as `@esetu-solutions/gole-number-system-fonts`), the Gole Number System itself and the related patent rights are not covered by it. They are licensed by eSetu Solutions Pvt Ltd under the [Gole Number System Community Licence v1.0](https://www.esetu.in/gole-number-system/licence), which everyone who uses the font receives automatically. Free to use with attribution; conditions apply. See the [full terms](https://www.esetu.in/gole-number-system/licence), or contact [legal@esetu.in](mailto:legal@esetu.in) about a commercial licence.

The MIT licence grants no patent licence. Patent rights for the Gole Number System (Indian Patent Application No. 202441034973) are granted only under §2.6 of the Community Licence.

When you show Gole numbers, credit them as `Gole Number System™ by eSetu Solutions Pvt. Ltd. – https://esetu.in`. Gole Number System and eSetu are trademarks of eSetu.
