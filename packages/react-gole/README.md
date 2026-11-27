# @gole-number-system/react-gole

React components for showing numbers in the **Gole Number System** (base 100: one symbol for each pair of decimal digits).

> **Licence:** the code is open source under MIT. Showing Gole symbols uses the GoleStandard font and the Gole Number System, which are under the [Gole Number System Community Licence v1.0](https://www.esetu.in/gole-number-system/licence). Free to use with attribution; conditions apply. See [Licence](#licence).

The padding rules come from [`@gole-number-system/gole-core`](https://github.com/gole-number-system/gole-js/tree/main/packages/gole-core); the symbols come from the [GoleStandard font](https://github.com/esetu-solutions/gole-number-system-fonts). Both are installed with this package.

## Install

```sh
npm install @gole-number-system/react-gole
```

Needs React 18 or 19.

## Quick start

```tsx
import "@gole-number-system/react-gole/styles.css"; // font + component styles, once in your app
import { Gole, GoleText } from "@gole-number-system/react-gole";

<Gole value={123} />                         // 0123 → 2 symbols
<Gole value={12747.2} decimals={2} />        // 012747.20
<GoleText>Invoice 5055-002347, 3 items</GoleText>
```

Every component renders the digits in the Gole font and leaves signs, separators and letters in your page font. The wrapper has `role="img"` and an `aria-label` with the decimal value, so screen readers read the number normally.

## Components

| Component | Use it for | Main props |
| --- | --- | --- |
| `<Gole>` | One number | `value`, `decimals`, `minPairs`, `build`, `as`, `label` |
| `<GoleText>` | Text that contains numbers: sentences, identifiers, dates. Converts its children, including nested elements. | `grouping`, `decimalSeparator`, `build`, `as` |
| `<GoleSymbol>` | A single symbol, 0 to 99 | `value` |
| `<GolePairs>` | Teaching and debugging: one box per pair, with padding zeros marked | `value`, `showDigits` |
| `<GoleDate>` | A date | `value`, `format` (default `DD/MM/YYYY`), `utc` |
| `<GoleTime>` | A time, or a live clock when `value` is omitted | `value`, `format` (default `HH:mm:ss`) |
| `<GoleCurrency>` | Money, formatted for the locale | `value`, `currency`, `currencyDisplay`, `locale` |
| `<GolePercent>` | A percentage: `0.456` → `46%` | `value`, `locale` |
| `<GoleCompact>` | A short form: `1234567` → `12L` in `en-IN` | `value`, `compactDisplay`, `locale` |
| `<GoleUnit>` | A number with a unit | `value`, `unit`, `unitDisplay`, `locale` |
| `<GoleFormat>` | Any other `Intl.NumberFormat` options | `value`, `options`, `locale` |
| `<GoleInput>` | A decimal input with a live Gole preview | `value`, `defaultValue`, `onValueChange`, `allowDecimal`, `allowNegative` |
| `<GoleProvider>` | Defaults for everything below it | `build`, `locale`, `decimalSeparator`, `grouping` |

Hooks:

| Hook | Returns |
| --- | --- |
| `useGole(value, options?)` | `{ text, label, pairs, count, segments }` for building your own component |
| `useGoleFontReady()` | `true` once the font has loaded |

The format components take `minimumFractionDigits` and `maximumFractionDigits` as well. They format the number with `Intl.NumberFormat` and then pad the digits; the currency symbol, percent sign and unit stay in your page font. Thousands separators are left out, because each Gole symbol already groups two digits; the `aria-label` keeps them.

```tsx
<GoleCurrency value={1234.5} currency="INR" locale="en-IN" />  // ₹1234.50, read as "₹1,234.50"
<GolePercent value={0.456} />                                   // 46%
<GoleCompact value={1234567} locale="en-IN" />                  // 12L
<GoleUnit value={72} unit="kilogram" />                         // 72 kg
```

Date and time formats use the tokens `YYYY YY MM DD HH hh mm ss A`; put literal text in `[brackets]`.

### Why these components

- **`Gole` and `GoleText`** cover the two real cases: a value you hold as a number, and text that happens to contain numbers. They are separate because options such as `decimals` only make sense for a single number.
- **`GoleDate` and `GoleTime`** exist because dates and times are the most common place for single-digit parts (`9:05`), which must be padded per part.
- **`GoleInput`** keeps typing in decimal digits, which every keyboard has, and shows the Gole result beside it.
- **`GolePairs` and `GoleSymbol`** are for explaining the system: legends, documentation and onboarding screens.
- **`GoleCurrency`, `GolePercent`, `GoleCompact` and `GoleUnit`** exist because amounts are rarely shown bare; they keep the symbol or unit out of the Gole font for you.
- **`GoleProvider`** avoids repeating `build="pua"` or `locale` on every component.

## Stylesheets

| Import | Contains |
| --- | --- |
| `@gole-number-system/react-gole/styles.css` | Ligature font + component styles. Use this unless you need PUA. |
| `@gole-number-system/react-gole/styles-pua.css` | PUA font + component styles. Also wrap your app in `<GoleProvider build="pua">`. |
| `@gole-number-system/react-gole/components.css` | Component styles only, if you load the font yourself |

Component styles follow the page colours. Override `--gole-pair-border`, `--gole-pair-pad-border`, `--gole-pair-symbol-size`, `--gole-pairs-gap`, `--gole-input-gap` and `--gole-input-preview-size` on any ancestor.

## Server rendering

The bundle starts with `"use client"`, so the components can be imported from React Server Components. `<GoleTime>` without a `value` renders empty on the server and starts after mount, which avoids hydration mismatches.

## Develop

This package lives in the [gole-js](https://github.com/gole-number-system/gole-js) repository, an npm workspace that also holds `gole-core`, the other framework packages and the examples. Run the commands from the repository root:

```sh
npm install        # links the packages to each other
npm run build      # every package, in dependency order
npm test
npm run typecheck
```

To work on this package alone, add `-w @gole-number-system/react-gole` to `npm run build`, `npm test` or `npm run typecheck`. Build `gole-core` first; this package imports its built output.

## Related packages

- [`@gole-number-system/gole-core`](https://github.com/gole-number-system/gole-js/tree/main/packages/gole-core): the padding logic, usable without React
- [`@gole-number-system/react-gole-charts`](https://github.com/gole-number-system/gole-js/tree/main/packages/react-gole-charts): Recharts components
- [Examples](https://github.com/gole-number-system/gole-js/tree/main/examples): worked examples

## Licence

The code in this package is open source under the [MIT licence](LICENSE). The MIT licence covers the code only.

The GoleStandard font (installed with this package as `@esetu-solutions/gole-number-system-fonts`), the Gole Number System itself and the related patent rights are not covered by it. They are licensed by eSetu Solutions Pvt Ltd under the [Gole Number System Community Licence v1.0](https://www.esetu.in/gole-number-system/licence), which everyone who uses the font receives automatically. Free to use with attribution; conditions apply. See the [full terms](https://www.esetu.in/gole-number-system/licence), or contact [legal@esetu.in](mailto:legal@esetu.in) about a commercial licence.

The MIT licence grants no patent licence. Patent rights for the Gole Number System (Indian Patent Application No. 202441034973) are granted only under §2.6 of the Community Licence.

When you show Gole numbers, credit them as `Gole Number System™ by eSetu Solutions Pvt. Ltd. – https://esetu.in`. Gole Number System and eSetu are trademarks of eSetu.
