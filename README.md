<p align="center">
  <picture>
    <img src="docs/images/gole-number-system-lockup-npm.svg" alt="Gole Number System for JavaScript and TypeScript, a product of eSetu" width="530" />
  </picture>
</p>
<p align="center"><b>JavaScript packages for showing numbers in the Gole Number System.</b><br/>
Gole is base 100: one symbol for each value from 0 to 99, so every symbol stands for a pair of decimal digits.</p>

<p align="center">
  <a href="https://github.com/gole-number-system/gole-js/releases"><img src="https://img.shields.io/github/v/release/gole-number-system/gole-js?include_prereleases&style=flat-square&label=release" alt="Release" /></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/code-MIT-blue" alt="Code licence: MIT" /></a>
  <a href="https://www.esetu.in/gole-number-system/licence"><img src="https://img.shields.io/badge/font-Gole%20Number%20System%20Community%20Licence%20v1.0-orange" alt="Font licence: Gole Number System Community Licence v1.0" /></a>
</p>

<p align="center">
  <a href="#packages">Packages</a> ·
  <a href="#develop">Develop</a> ·
  <a href="examples">Examples</a> ·
  <a href="#licence">Licence</a>
</p>

A number written in Gole takes **half as many symbols** as the same number in decimal: `1863486135148634156` is 19 digits, and 10 Gole symbols. That helps wherever numbers compete for space, such as table columns, chart axes, shipping labels, invoices, dashboards and small screens. These packages do the conversion and the rendering for websites, web apps and mobile apps built with Node tooling: plain JavaScript, React, Vue, Svelte, Angular, React Native and web components. Only the digits change; signs, separators, units and words stay in your own font, and screen readers still read the ordinary decimal number.

## Packages

| Package | Folder | Use it for |
| --- | --- | --- |
| [`@gole-number-system/gole-core`](packages/gole-core) | `packages/gole-core` | The padding logic and DOM helpers. No framework needed. |
| [`@gole-number-system/react-gole`](packages/react-gole) | `packages/react-gole` | React components and hooks. |
| [`@gole-number-system/react-gole-charts`](packages/react-gole-charts) | `packages/react-gole-charts` | Recharts axes, tooltips, labels and legends. |
| [`@gole-number-system/react-native-gole`](packages/react-native-gole) | `packages/react-native-gole` | React Native components, for bare React Native and Expo. |
| [`@gole-number-system/vue-gole`](packages/vue-gole) | `packages/vue-gole` | Vue 3 components, a `v-gole` directive and composables. |
| [`@gole-number-system/angular-gole`](packages/angular-gole) | `packages/angular-gole` | Angular pipes and directives. Standalone, no `NgModule`. |
| [`@gole-number-system/svelte-gole`](packages/svelte-gole) | `packages/svelte-gole` | Svelte 5 components and an action. |
| [`@gole-number-system/gole-elements`](packages/gole-elements) | `packages/gole-elements` | Web components: `<gole-number>`, `<gole-text>`, `<gole-date>` and `<gole-time>`. For plain HTML and any framework. |
| [`@gole-number-system/gole-tailwind`](packages/gole-tailwind) | `packages/gole-tailwind` | Tailwind CSS v4 and v3: the font face, the `font-gole` utility and the `gole` classes. |
| [`@gole-number-system/gole-adapters`](packages/gole-adapters) | `packages/gole-adapters` | Chart.js, Apache ECharts, AG Grid and TanStack Table. |

Each package is published to npm separately; install only the one you need. Every package except `gole-tailwind` installs `gole-core`, and `react-gole-charts` also installs `react-gole`.

```sh
npm install @gole-number-system/gole-core           # plain JavaScript or TypeScript
npm install @gole-number-system/react-gole          # React
npm install @gole-number-system/react-gole-charts   # React with Recharts
npm install @gole-number-system/react-native-gole   # React Native and Expo
npm install @gole-number-system/vue-gole            # Vue 3
npm install @gole-number-system/angular-gole        # Angular 21 or 22
npm install @gole-number-system/svelte-gole         # Svelte 5
npm install @gole-number-system/gole-elements       # web components
npm install @gole-number-system/gole-tailwind       # Tailwind CSS
npm install @gole-number-system/gole-adapters       # Chart.js, ECharts, AG Grid, TanStack Table
```

The symbols are drawn by the [GoleStandard font](https://github.com/esetu-solutions/gole-number-system-fonts), which is installed with `gole-core` (and with `gole-tailwind` and `react-native-gole`, which use the font files directly).

The [examples](examples) folder holds a small site that uses `gole-core`, `gole-elements`, `react-gole` and `react-gole-charts`: plain JavaScript, web components, React components and charts.

## Develop

The repository is an npm workspace. One install at the root links the packages to each other.

```sh
npm install
npm run build            # gole-core first, then the packages that use it
npm test                 # builds, then runs every package's tests
npm run typecheck
npm run examples         # builds, then serves the examples at http://localhost:5173
npm run examples:build   # static site in examples/dist/
```

The packages import each other's built output (`dist/`), so the build order matters; the root scripts take care of it. To run a script for one package, add `-w`, for example `npm test -w @gole-number-system/react-gole`.

### Publish

Publish in dependency order, each from the repository root: `gole-core` first, `react-gole` before `react-gole-charts`, the rest in any order.

```sh
npm publish -w @gole-number-system/gole-core
npm publish -w @gole-number-system/react-gole
npm publish -w @gole-number-system/react-gole-charts
npm publish -w @gole-number-system/react-native-gole
npm publish -w @gole-number-system/vue-gole
npm publish -w @gole-number-system/svelte-gole
npm publish -w @gole-number-system/gole-elements
npm publish -w @gole-number-system/gole-tailwind
npm publish -w @gole-number-system/gole-adapters
npm run release -w @gole-number-system/angular-gole   # publishes packages/angular-gole/dist
```

`angular-gole` is published from its `dist` folder, which ng-packagr writes as a complete package, so it uses its `release` script instead of `npm publish -w`. Each package runs its type check, tests and build before it is published.

## Licence

The code in this repository is open source under the [MIT licence](LICENSE). The MIT licence covers the code only.

The GoleStandard font (installed with these packages as `@esetu-solutions/gole-number-system-fonts`), the Gole Number System itself and the related patent rights are not covered by it. They are licensed by eSetu Solutions Pvt Ltd under the [Gole Number System Community Licence v1.0](https://www.esetu.in/gole-number-system/licence), which everyone who uses the font receives automatically. Free to use with attribution; conditions apply. See the [full terms](https://www.esetu.in/gole-number-system/licence), or contact [legal@esetu.in](mailto:legal@esetu.in) about a commercial licence.

The MIT licence grants no patent licence. Patent rights for the Gole Number System (Indian Patent Application No. 202441034973) are granted only under §2.6 of the Community Licence.

When you show Gole numbers, credit them as `Gole Number System™ by eSetu Solutions Pvt. Ltd. – https://esetu.in`. Gole Number System and eSetu are trademarks of eSetu.
