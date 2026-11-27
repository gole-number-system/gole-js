# Gole Number System examples

Worked examples of showing numbers in the **Gole Number System** (base 100: one symbol for each pair of decimal digits) with the GoleStandard font.

## Run

The examples are a private workspace in the [gole-js](https://github.com/gole-number-system/gole-js) repository and use the packages from `../packages` directly. Run the commands from the repository root:

```sh
npm install
npm run examples         # builds the packages, then serves http://localhost:5173
npm run examples:build   # static site in examples/dist/
```

## What is in it

| Example | Source | Shows |
| --- | --- | --- |
| Basics | [src/examples/Basics.tsx](src/examples/Basics.tsx) | Type a number; see the padding zeros, the pairs and the symbols |
| React components | [src/examples/Components.tsx](src/examples/Components.tsx) | Every component in `react-gole`, and all 100 symbols |
| Logistics | [src/examples/Logistics.tsx](src/examples/Logistics.tsx) | A 19-digit tracking number as 10 symbols on a shipping label |
| Finance | [src/examples/Invoice.tsx](src/examples/Invoice.tsx) | An invoice table with two-decimal amounts |
| Transport | [src/examples/Departures.tsx](src/examples/Departures.tsx) | A departure board with a live clock |
| Analytics | [src/examples/Charts.tsx](src/examples/Charts.tsx) | Recharts line and bar charts with Gole axes, tooltip, legend and data labels |
| Without a framework | [vanilla.html](vanilla.html), [src/vanilla.ts](src/vanilla.ts) | Plain HTML with `data-gole` and `renderGole()` from `gole-core` |

## How the font gets loaded

The font files live in [`@esetu-solutions/gole-number-system-fonts`](https://github.com/esetu-solutions/gole-number-system-fonts). Nothing is copied into this folder:

- The React page imports `@gole-number-system/react-gole/styles.css` in [src/main.tsx](src/main.tsx).
- The plain page imports `@gole-number-system/gole-core/gole.css` in [src/vanilla.ts](src/vanilla.ts).

Both stylesheets import the `@font-face` rule from the fonts package, and the bundler copies the font files into the build.

## Packages used

- [`@esetu-solutions/gole-number-system-fonts`](https://github.com/esetu-solutions/gole-number-system-fonts): the font
- [`@gole-number-system/gole-core`](../packages/gole-core): padding logic and DOM helpers
- [`@gole-number-system/react-gole`](../packages/react-gole): React components
- [`@gole-number-system/react-gole-charts`](../packages/react-gole-charts): Recharts components

## Licence

The code in this folder is open source under the [MIT licence](../LICENSE). The MIT licence covers the code only.

The GoleStandard font (installed as `@esetu-solutions/gole-number-system-fonts`), the Gole Number System itself and the related patent rights are not covered by it. They are licensed by eSetu Solutions Pvt Ltd under the [Gole Number System Community Licence v1.0](https://www.esetu.in/gole-number-system/licence), which everyone who uses the font receives automatically. Free to use with attribution; conditions apply. See the [full terms](https://www.esetu.in/gole-number-system/licence), or contact [legal@esetu.in](mailto:legal@esetu.in) about a commercial licence.

The MIT licence grants no patent licence. Patent rights for the Gole Number System (Indian Patent Application No. 202441034973) are granted only under §2.6 of the Community Licence.

When you show Gole numbers, credit them as `Gole Number System™ by eSetu Solutions Pvt. Ltd. – https://esetu.in`. Gole Number System and eSetu are trademarks of eSetu.
