# @gole-number-system/gole-tailwind

Tailwind CSS support for the **Gole Number System** (base 100: one symbol for each pair of decimal digits). One line of setup gives you the GoleStandard font face, the `font-gole` utility and the `gole` classes that the other Gole packages emit. Works with Tailwind CSS v4 (CSS import) and v3 (JS plugin).

> **Licence:** the code is open source under MIT. Showing Gole symbols uses the GoleStandard font and the Gole Number System, which are under the [Gole Number System Community Licence v1.0](https://www.esetu.in/gole-number-system/licence). Free to use with attribution; conditions apply. See [Licence](#licence).

The symbols come from the [GoleStandard font](https://github.com/esetu-solutions/gole-number-system-fonts), which is installed with this package.

## Install

```sh
npm install @gole-number-system/gole-tailwind
```

Needs Tailwind CSS 3.4 or later, or any 4.x.

## Use

### Tailwind CSS v4

Add one line to your main stylesheet, after Tailwind:

```css
@import "tailwindcss";
@import "@gole-number-system/gole-tailwind";
```

This loads the font (it imports `@esetu-solutions/gole-number-system-fonts/ligature.css`, so the `@font-face` and its font files go through your bundler), defines the theme variable `--font-gole`, and adds the `.gole` and `.gole-number` classes. Nothing else to import. `@import "@gole-number-system/gole-tailwind/theme.css";` is the same file, for tools that do not read the `style` export condition.

### Tailwind CSS v3

Add the plugin to `tailwind.config.js`:

```js
module.exports = {
  content: ["./src/**/*.{html,js,jsx,ts,tsx}"],
  plugins: [require("@gole-number-system/gole-tailwind")],
};
```

A JS plugin cannot add a `@font-face` whose font files your bundler can find, so also import the font CSS once, in your app's entry file:

```js
import "@esetu-solutions/gole-number-system-fonts/ligature.css";
```

or at the top of your main stylesheet, if your build resolves package imports in CSS (for example with `postcss-import`):

```css
@import "@esetu-solutions/gole-number-system-fonts/ligature.css";
@tailwind base;
@tailwind components;
@tailwind utilities;
```

With an ES module config, use `import goleTailwind from "@gole-number-system/gole-tailwind"` and `plugins: [goleTailwind]`.

### Write the HTML

```html
<span class="font-gole">0123</span>          <!-- 2 symbols: 01 and 23 -->
<p>Total: <span class="font-gole">012747</span>.<span class="font-gole">20</span></p>
```

`font-gole` only sets the font. The font joins each **pair** of digits into one symbol, so the text must already be padded digits: an even count, with a `0` added on the left of a whole number (`123` → `0123`) or on the right after a decimal point (`.2` → `.20`). The font has only digits and Gole symbols, so put `font-gole` on the digits alone; signs, decimal points, separators and units stay outside and keep your page font. Do not add `tracking-*` to the same element: letter spacing turns ligatures off.

To pad values for you, use `toGole()` from [`@gole-number-system/gole-core`](https://github.com/gole-number-system/gole-js/tree/main/packages/gole-core), or the components in [`@gole-number-system/react-gole`](https://github.com/gole-number-system/gole-js/tree/main/packages/react-gole) and [`@gole-number-system/gole-elements`](https://github.com/gole-number-system/gole-js/tree/main/packages/gole-elements). Their output uses the classes `gole` and `gole-number`, which this package styles, so you do not need to import their font stylesheets as well (`gole.css`, `styles.css`). Load the font once only.

`font-gole` is a normal Tailwind utility, so variants work: `md:font-gole`, `hover:font-gole`.

### PUA build

The font has a second build in which pair `n` is the character U+E441 + `n` instead of two digits. Use it instead of the Ligature build, never together with it: both use the family name `GoleStandard`.

```css
/* Tailwind v4 */
@import "tailwindcss";
@import "@gole-number-system/gole-tailwind/pua.css";
```

```js
// Tailwind v3: tailwind.config.js
plugins: [require("@gole-number-system/gole-tailwind")({ build: "pua" })],
// and in your entry file
import "@esetu-solutions/gole-number-system-fonts/pua.css";
```

## API

CSS entries (Tailwind v4):

| Import | Contains |
| --- | --- |
| `@gole-number-system/gole-tailwind` or `/theme.css` | Ligature font face, `--font-gole`, `.gole`, `.gole-number` |
| `@gole-number-system/gole-tailwind/pua.css` | PUA font face, `--font-gole`, `.gole`, `.gole-number` |

What you get, from the CSS entries and from the plugin:

| Class | Does |
| --- | --- |
| `font-gole` | `font-family: "GoleStandard"`. For your own markup with padded digits. |
| `gole` | Gole font plus `font-variant-ligatures: common-ligatures` and `letter-spacing: normal` (font only in the PUA build). Emitted by the other Gole packages around each run of digits. |
| `gole-number` | `white-space: nowrap`. Emitted around one whole number so it never breaks across lines. |

JS plugin (default export, loads with `require` and `import`):

| Option | Default | Meaning |
| --- | --- | --- |
| `family` | `"GoleStandard"` | Family name for `font-gole` and `gole`, if you load the font under another name |
| `build` | `"ligature"` | `"pua"` leaves the ligature settings out of `gole` |

The plugin adds `theme.extend.fontFamily.gole` and the two class styles. It writes them as base rules with the selectors `[class~="gole"]` and `[class~="gole-number"]`, so Tailwind v3 keeps them even though it never sees those class names in your `content` files (they come from components in `node_modules`).

The plugin also loads in Tailwind v4 with `@plugin "@gole-number-system/gole-tailwind";`, but in v4 prefer the CSS import above: it brings the font face as well. Do not use both.

## Develop

This package lives in the [gole-js](https://github.com/gole-number-system/gole-js) repository, an npm workspace that also holds `gole-core`, the component packages and the examples. Run the commands from the repository root:

```sh
npm install        # links the packages to each other
npm run build
npm test
npm run typecheck
```

To work on this package alone, add `-w @gole-number-system/gole-tailwind` to `npm run build`, `npm test` or `npm run typecheck`. The plugin is plain JavaScript in `src`; the build copies it to `dist`. The tests compile CSS with real Tailwind CSS v4 and v3.

## Related packages

- [`@gole-number-system/gole-core`](https://github.com/gole-number-system/gole-js/tree/main/packages/gole-core): the padding logic (`toGole`, `goleHTML`, number and date formats)
- [`@gole-number-system/react-gole`](https://github.com/gole-number-system/gole-js/tree/main/packages/react-gole): React components
- [`@gole-number-system/gole-elements`](https://github.com/gole-number-system/gole-js/tree/main/packages/gole-elements): web components for plain HTML and any framework
- [Examples](https://github.com/gole-number-system/gole-js/tree/main/examples): worked examples

## Licence

The code in this package is open source under the [MIT licence](LICENSE). The MIT licence covers the code only.

The GoleStandard font (installed with this package as `@esetu-solutions/gole-number-system-fonts`), the Gole Number System itself and the related patent rights are not covered by it. They are licensed by eSetu Solutions Pvt Ltd under the [Gole Number System Community Licence v1.0](https://www.esetu.in/gole-number-system/licence), which everyone who uses the font receives automatically. Free to use with attribution; conditions apply. See the [full terms](https://www.esetu.in/gole-number-system/licence), or contact [legal@esetu.in](mailto:legal@esetu.in) about a commercial licence.

The MIT licence grants no patent licence. Patent rights for the Gole Number System (Indian Patent Application No. 202441034973) are granted only under §2.6 of the Community Licence.

When you show Gole numbers, credit them as `Gole Number System™ by eSetu Solutions Pvt. Ltd. – https://esetu.in`. Gole Number System and eSetu are trademarks of eSetu.
