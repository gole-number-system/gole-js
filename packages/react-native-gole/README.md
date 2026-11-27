# @gole-number-system/react-native-gole

React Native components for showing numbers in the **Gole Number System** (base 100: one symbol for each pair of decimal digits). Works with bare React Native and with Expo, on iOS and Android.

> **Licence:** the code is open source under MIT. Showing Gole symbols uses the GoleStandard font and the Gole Number System, which are under the [Gole Number System Community Licence v1.0](https://www.esetu.in/gole-number-system/licence). Free to use with attribution; conditions apply. See [Licence](#licence).

The padding rules come from [`@gole-number-system/gole-core`](https://github.com/gole-number-system/gole-js/tree/main/packages/gole-core); the symbols come from the [GoleStandard font](https://github.com/esetu-solutions/gole-number-system-fonts). Both are installed with this package.

## Install

```sh
npm install @gole-number-system/react-native-gole
```

Needs React 18 or 19 and React Native 0.72 or newer.

React Native has no CSS, so the font is not loaded by a stylesheet: the font file has to be put into the app. Do **one** of the following.

### Bare React Native

Copy the font file into your project, then link it:

```sh
mkdir -p assets/fonts
cp node_modules/@esetu-solutions/gole-number-system-fonts/fonts/PUA/GoleStandard_PUA.ttf assets/fonts/
```

```js
// react-native.config.js
module.exports = {
  assets: ["./assets/fonts"],
};
```

```sh
npx react-native-asset
```

Rebuild the app (`npx react-native run-android`, `npx react-native run-ios`). Keep the file name `GoleStandard_PUA.ttf`: Android names the font after the file. Copy the file again when you update the font package.

### Expo

Load the font with [`expo-font`](https://docs.expo.dev/versions/latest/sdk/font/), which is part of every Expo app. The font file is exported from `@gole-number-system/react-native-gole/fonts`:

```tsx
import { useFonts } from "expo-font";
import { Gole, goleFontFamily } from "@gole-number-system/react-native-gole";
import { GoleStandardPUA } from "@gole-number-system/react-native-gole/fonts";

export default function App() {
  const [loaded] = useFonts({ [goleFontFamily()]: GoleStandardPUA });
  if (!loaded) return null;
  return <Gole value={123} style={{ fontSize: 32 }} />;
}
```

`goleFontFamily()` is the name the components look for, so no further setup is needed. If you load the font under a name of your own, tell the components: `<GoleProvider fontFamily="MyGole">`.

To embed the font at build time instead, add the file to the `expo-font` config plugin in `app.json`:

```json
{
  "expo": {
    "plugins": [
      ["expo-font", { "fonts": ["./node_modules/@esetu-solutions/gole-number-system-fonts/fonts/PUA/GoleStandard_PUA.ttf"] }]
    ]
  }
}
```

### PUA or Ligature build

The font comes in two builds. Put only one of them in the app: both declare the same family name.

| Build | Text given to the font | Use it when |
| --- | --- | --- |
| `"pua"` (default) | One Private Use Area character per pair (U+E441 to U+E4A4) | Always, unless you have a reason not to. Each symbol is an ordinary single glyph, so it does not depend on how the native text engine shapes text. |
| `"ligature"` | The padded decimal digits; the font joins each pair through an OpenType ligature | You need the underlying text to stay plain digits, for example for copying out of a selectable `<Text>`. |

The Ligature build relies on the platform applying ligatures. A style that turns them off shows separate digits instead of Gole symbols; on Android, `letterSpacing` does this. To use it, link or load `fonts/Ligature/GoleStandard.ttf` (exported as `GoleStandardLigature`) and wrap the app in `<GoleProvider build="ligature">`.

With the PUA build the text itself is made of private characters, so copied text is not readable as digits. Screen readers are not affected: every component sets `accessibilityLabel` to the ordinary decimal text.

### Font family names

| Where | `fontFamily` | Why |
| --- | --- | --- |
| iOS | `GoleStandard` | iOS finds fonts by the family name (or PostScript name, `GoleStandard-Regular`) stored in the file |
| Android | `GoleStandard_PUA`, or `GoleStandard` for the Ligature build | Android finds linked fonts by file name without the extension |
| Expo (`useFonts`) | The key you pass to `useFonts` | |

`goleFontFamily(build?, os?)` returns the right name for the current platform, and the components use it by default. Override it with the `fontFamily` prop or `<GoleProvider fontFamily>`.

## Use

```tsx
import { Text } from "react-native";
import { Gole, GoleCurrency, GoleDate, GoleText, GoleTime } from "@gole-number-system/react-native-gole";

<Gole value={123} />                                // [01][23]
<Gole value={12747.2} decimals={2} style={{ fontSize: 24 }} />
<GoleText>Invoice 5055-002347, 3 items</GoleText>
<GoleDate value="2026-11-20" />                     // [20]/[11]/[20][26]
<GoleTime />                                        // live clock
<GoleCurrency value={1234.5} currency="INR" locale="en-IN" />   // ₹[12][34].[50]

// Inside other text
<Text>Total: <Gole value={42} /> items</Text>
```

Every component renders a `<Text>` and takes all `Text` props (`style`, `numberOfLines`, `onPress`, …). Inside it, only the digits are nested `<Text>` elements with the Gole font. The font has no other glyphs, so signs, decimal points, currency signs and letters keep the font of the outer text. The outer `<Text>` is `accessible` and its `accessibilityLabel` is the ordinary decimal text, so VoiceOver and TalkBack read the number normally.

Defaults for a whole app or screen:

```tsx
import { GoleProvider } from "@gole-number-system/react-native-gole";

<GoleProvider locale="en-IN">
  <App />
</GoleProvider>
```

For custom rendering (SVG text, charts), use the hook:

```tsx
const { text, label, fontFamily } = useGole(42);
<Text style={{ fontFamily }} accessibilityLabel={label}>{text}</Text>
```

### Hermes and `Intl`

`<GoleFormat>`, `<GoleCurrency>`, `<GolePercent>`, `<GoleCompact>`, `<GoleUnit>` and `<GoleDate>`/`<GoleTime>` with `Intl.DateTimeFormat` options use `Intl.NumberFormat.formatToParts` and `Intl.DateTimeFormat` from the JavaScript engine. Hermes has `Intl` on Android and iOS, but not every option on every version (compact notation and units are the usual gaps on iOS). If one of these components throws or shows unformatted numbers, add polyfills such as [`@formatjs/intl-numberformat`](https://formatjs.github.io/docs/polyfills/intl-numberformat/) with the locale data you need. `<Gole>`, `<GoleText>`, `<GoleSymbol>` and date patterns such as `"DD/MM/YYYY"` do not use `Intl`.

## API

| Component | Use it for | Main props |
| --- | --- | --- |
| `<Gole>` | One number | `value`, `decimals`, `minPairs`, `label` |
| `<GoleText>` | Text that contains numbers: sentences, identifiers. Children must be strings or numbers. | `grouping`, `decimalSeparator`, `minPairs` |
| `<GoleSymbol>` | A single symbol, 0 to 99 | `value` |
| `<GoleDate>` | A date | `value`, `format` (default `DD/MM/YYYY`), `locale`, `utc` |
| `<GoleTime>` | A time, or a live clock when `value` is omitted | `value`, `format` (default `HH:mm:ss`), `interval`, `utc` |
| `<GoleFormat>` | A number formatted with `Intl.NumberFormat` | `value`, `options`, `locale`, `minPairs`, `label` |
| `<GoleCurrency>` | Money | `value`, `currency`, `currencyDisplay`, `locale` |
| `<GolePercent>` | A ratio as a percentage | `value`, `locale` |
| `<GoleCompact>` | Short form of large numbers (1.2M, 12L) | `value`, `compactDisplay`, `locale` |
| `<GoleUnit>` | A measurement | `value`, `unit`, `unitDisplay`, `locale` |
| `<GoleProvider>` | Defaults for everything below it | `build`, `fontFamily`, `locale`, `decimalSeparator`, `grouping` |

All components also take `build`, `fontFamily` and every React Native `Text` prop. The four presets also take `minimumFractionDigits` and `maximumFractionDigits`.

Date and time patterns use the tokens `YYYY YY MM DD HH hh mm ss A`; put literal text in `[brackets]`. `format` also accepts `Intl.DateTimeFormat` options such as `{ dateStyle: "medium" }`.

| Export | What it is |
| --- | --- |
| `useGole(value, options?)` | Hook: `{ text, label, pairs, count, segments, fontFamily }` for building your own component |
| `useGoleConfig()` | Hook: the values set by the nearest `<GoleProvider>` |
| `goleFontFamily(build?, os?)` | The font family for a build (default `"pua"`) on a platform (default: the current one) |
| `GOLE_FONT_FAMILY` | `"GoleStandard"`, the family name inside the font (iOS) |
| `GOLE_FONT_POSTSCRIPT_NAME` | `"GoleStandard-Regular"` |
| `GOLE_FONT_FILES` | `{ ligature: "GoleStandard", pua: "GoleStandard_PUA" }`, the file names without `.ttf` (Android) |
| `GoleRef` | Type of a `ref` on any component: the same as a ref on `<Text>` |

From `@gole-number-system/react-native-gole/fonts`:

| Export | What it is |
| --- | --- |
| `GoleStandardPUA` | The PUA font file as a Metro asset, for `useFonts` |
| `GoleStandardLigature` | The Ligature font file as a Metro asset |

## Develop

This package lives in the [gole-js](https://github.com/gole-number-system/gole-js) repository, an npm workspace that also holds `gole-core`, the other framework packages and the examples. Run the commands from the repository root:

```sh
npm install        # links the packages to each other
npm run build      # gole-core first, then the packages that use it
npm test
npm run typecheck
```

To work on this package alone, add `-w @gole-number-system/react-native-gole` to `npm run build`, `npm test` or `npm run typecheck`. Build `gole-core` first; this package imports its built output.

The tests run in Node with a small stand-in for `react-native` (`test/react-native-mock.ts`). They check what the components render, not how a device draws it.

## Related packages

- [`@gole-number-system/gole-core`](https://github.com/gole-number-system/gole-js/tree/main/packages/gole-core): the padding logic, usable without React
- [`@gole-number-system/react-gole`](https://github.com/gole-number-system/gole-js/tree/main/packages/react-gole): the same components for React on the web
- [`@esetu-solutions/gole-number-system-fonts`](https://github.com/esetu-solutions/gole-number-system-fonts): the GoleStandard font

## Licence

The code in this package is open source under the [MIT licence](LICENSE). The MIT licence covers the code only.

The GoleStandard font (installed with this package as `@esetu-solutions/gole-number-system-fonts`), the Gole Number System itself and the related patent rights are not covered by it. They are licensed by eSetu Solutions Pvt Ltd under the [Gole Number System Community Licence v1.0](https://www.esetu.in/gole-number-system/licence), which everyone who uses the font receives automatically. Free to use with attribution; conditions apply. See the [full terms](https://www.esetu.in/gole-number-system/licence), or contact [legal@esetu.in](mailto:legal@esetu.in) about a commercial licence.

The MIT licence grants no patent licence. Patent rights for the Gole Number System (Indian Patent Application No. 202441034973) are granted only under §2.6 of the Community Licence.

When you show Gole numbers, credit them as `Gole Number System™ by eSetu Solutions Pvt. Ltd. – https://esetu.in`. Gole Number System and eSetu are trademarks of eSetu.
