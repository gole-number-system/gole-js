# @gole-number-system/angular-gole

Angular pipes and directives for showing numbers in the **Gole Number System** (base 100: one symbol for each pair of decimal digits). Everything is standalone: import the pipe or directive you need, no `NgModule`.

> **Licence:** the code is open source under MIT. Showing Gole symbols uses the GoleStandard font and the Gole Number System, which are under the [Gole Number System Community Licence v1.0](https://www.esetu.in/gole-number-system/licence). Free to use with attribution; conditions apply. See [Licence](#licence).

The padding rules come from [`@gole-number-system/gole-core`](https://github.com/gole-number-system/gole-js/tree/main/packages/gole-core); the symbols come from the [GoleStandard font](https://github.com/esetu-solutions/gole-number-system-fonts). Both are installed with this package.

## Install

```sh
npm install @gole-number-system/angular-gole
```

Needs Angular 21 or 22 (`@angular/core` and `@angular/common`). The package is built and tested with Angular 21.

### Load the font

The directives only write the markup. The font and the two classes they use (`gole` on digits, `gole-number` on a whole number) come from a stylesheet in `gole-core`. Add it once, in either place:

```jsonc
// angular.json → projects.<app>.architect.build.options
"styles": ["node_modules/@gole-number-system/gole-core/css/gole.css", "src/styles.css"]
```

```css
/* or at the top of src/styles.css */
@import "@gole-number-system/gole-core/gole.css";
```

For the PUA build of the font load `gole-pua.css` instead (same two places, never both files) and tell the library with `provideGole({ build: "pua" })`.

## Use

```ts
import { Component } from "@angular/core";
import { GoleDirective, GoleFormatDirective, GolePipe, GoleTextDirective } from "@gole-number-system/angular-gole";

@Component({
  selector: "app-invoice",
  imports: [GoleDirective, GoleTextDirective, GoleFormatDirective, GolePipe],
  template: `
    <span [gole]="987654"></span>                              <!-- [98][76][54] -->
    <td [gole]="total" [goleDecimals]="2"></td>                <!-- 12747.2 → [01][27][47].[20] -->
    <p [goleText]="'Invoice 5055-002347, 3 items'"></p>        <!-- every run of digits -->
    <span [goleFormat]="total" goleCurrency="INR"></span>      <!-- ₹[01][27][47].[20] -->
    <span class="gole">{{ count | gole }}</span>               <!-- text only -->
  `,
})
export class InvoiceComponent {
  total = 12747.2;
  count = 123;
}
```

Every directive renders into its host element. The digits go into `<span class="gole">`, so only they get the Gole font; signs, decimal points, currency signs and units keep your page font. The host gets `role="img"` and an `aria-label` with the ordinary decimal text, so screen readers read the number normally. The content is built from text nodes, never from HTML strings.

### Currency, percent, compact, units

```html
<span [goleFormat]="1234.5" goleCurrency="INR" goleLocale="en-IN"></span>   <!-- ₹[12][34].[50] -->
<span [goleFormat]="0.456" golePercent></span>                              <!-- [46]% -->
<span [goleFormat]="1234567" goleCompact></span>                            <!-- [01].[20]M -->
<span [goleFormat]="72" goleUnit="kilometer-per-hour"></span>               <!-- [72] km/h -->
<span [goleFormat]="3.14159" [goleOptions]="{ maximumFractionDigits: 2 }"></span>
```

`goleOptions` takes any `Intl.NumberFormat` options. The locale is `goleLocale`, then the one from `provideGole`, then Angular's `LOCALE_ID`.

### Dates and a clock

```html
<time [goleDate]="order.createdAt"></time>                                   <!-- [20]/[11]/[20][26] -->
<time [goleDate]="order.createdAt" [goleDateFormat]="{ dateStyle: 'medium' }"></time>
<time [goleTime]="order.createdAt" goleTimeFormat="HH:mm"></time>
<time goleTime></time>                                                       <!-- live clock -->
```

A format is a pattern of the tokens `YYYY YY MM DD HH hh mm ss A` (literal text in `[brackets]`) or an object of `Intl.DateTimeFormat` options. The live clock runs outside the Angular zone and writes straight to the DOM, so it does not start change detection; its timer stops when the element is destroyed. On the server it renders empty.

### Defaults

```ts
import { provideGole } from "@gole-number-system/angular-gole";

bootstrapApplication(AppComponent, {
  providers: [provideGole({ build: "pua", locale: "en-IN" })],
});
```

`provideGole` also works in the `providers` of a component, for one part of the page. Without it the Ligature build is used.

## API

| Export | Use it for | Inputs / arguments |
| --- | --- | --- |
| `GolePipe` (`gole`) | Gole text inside an element that has the class `gole` | `value \| gole: decimals` or `value \| gole: { decimals, minPairs, build, … }` |
| `GoleLabelPipe` (`goleLabel`) | The decimal text for an `aria-label` next to the `gole` pipe | same as `gole` |
| `GoleDirective` (`[gole]`) | One number | `gole`, `goleDecimals`, `goleMinPairs`, `goleBuild`, `goleLabel` |
| `GoleTextDirective` (`[goleText]`) | Text that contains numbers: sentences, identifiers, dates. Each number gets its own label. | `goleText`, `goleGrouping`, `goleDecimalSeparator`, `goleMinPairs`, `goleBuild` |
| `GoleFormatDirective` (`[goleFormat]`) | Locale-aware numbers | `goleFormat`, `goleCurrency`, `golePercent`, `goleCompact`, `goleUnit`, `goleOptions`, `goleLocale`, `goleMinPairs`, `goleBuild`, `goleLabel` |
| `GoleDateDirective` (`[goleDate]`) | A date | `goleDate`, `goleDateFormat` (default `DD/MM/YYYY`), `goleLocale`, `goleUtc`, `goleBuild` |
| `GoleTimeDirective` (`[goleTime]`) | A time, or a live clock without a value | `goleTime`, `goleTimeFormat` (default `HH:mm:ss`), `goleInterval` (default `1000` ms), `goleLocale`, `goleUtc`, `goleBuild` |
| `provideGole(config)` | Defaults for everything above | `build` (`"ligature"` or `"pua"`), `locale` |
| `GOLE_CONFIG` | The `InjectionToken` behind `provideGole`, to read the defaults in your own code | |

Number inputs also accept attribute strings (`goleDecimals="2"`). `null` and `undefined` values render nothing. For anything else (parsing, pairs, your own markup) import the functions from `@gole-number-system/gole-core` directly.

## Develop

This package lives in the [gole-js](https://github.com/gole-number-system/gole-js) repository, an npm workspace that also holds `gole-core` and the other packages. Run the commands from the repository root:

```sh
npm install        # links the packages to each other
npm run build      # gole-core first, then the packages that use it
npm test
npm run typecheck
```

To work on this package alone, add `-w @gole-number-system/angular-gole` to `npm run build`, `npm test` or `npm run typecheck`. Build `gole-core` first; this package imports its built output.

The build is [ng-packagr](https://github.com/ng-packagr/ng-packagr) in partial compilation mode. It writes a complete package in the Angular Package Format to `dist`, with its own `package.json`, `README.md` and `LICENSE`. The tests are vitest with jsdom and Angular's `TestBed` (JIT compiler, zoneless).

### Publish

Publish the `dist` folder, not the package folder:

```sh
npm run release    # typecheck, test, build, then: npm publish ./dist
```

`npm pack --dry-run ./dist` shows what goes into the tarball. The `package.json` in the package folder points `main` and `types` into `dist` only so that the other workspace packages and the examples can import the library without publishing it; the build removes those fields, `files` and `scripts` from `dist/package.json`.

## Related packages

- [`@gole-number-system/gole-core`](https://github.com/gole-number-system/gole-js/tree/main/packages/gole-core): the padding logic and the stylesheets, usable without a framework
- [`@gole-number-system/gole-elements`](https://github.com/gole-number-system/gole-js/tree/main/packages/gole-elements): web components, for pages without Angular
- [`@gole-number-system/react-gole`](https://github.com/gole-number-system/gole-js/tree/main/packages/react-gole): the same for React
- [Examples](https://github.com/gole-number-system/gole-js/tree/main/examples): worked examples

## Licence

The code in this package is open source under the [MIT licence](LICENSE). The MIT licence covers the code only.

The GoleStandard font (installed with this package as `@esetu-solutions/gole-number-system-fonts`), the Gole Number System itself and the related patent rights are not covered by it. They are licensed by eSetu Solutions Pvt Ltd under the [Gole Number System Community Licence v1.0](https://www.esetu.in/gole-number-system/licence), which everyone who uses the font receives automatically. Free to use with attribution; conditions apply. See the [full terms](https://www.esetu.in/gole-number-system/licence), or contact [legal@esetu.in](mailto:legal@esetu.in) about a commercial licence.

The MIT licence grants no patent licence. Patent rights for the Gole Number System (Indian Patent Application No. 202441034973) are granted only under §2.6 of the Community Licence.

When you show Gole numbers, credit them as `Gole Number System™ by eSetu Solutions Pvt. Ltd. – https://esetu.in`. Gole Number System and eSetu are trademarks of eSetu.
