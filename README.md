# gole-js

JavaScript packages for showing numbers in the **Gole Number System**. Gole is base 100: one symbol for each value from 0 to 99, so every symbol stands for a pair of decimal digits.

> **Licence:** the code is open source under MIT. Showing Gole symbols uses the GoleStandard font and the Gole Number System, which are under the [Gole Number System Community Licence v1.0](https://www.esetu.in/gole-number-system/licence). Free to use with attribution; conditions apply. See [Licence](#licence).

## Packages

| Package | Folder | Use it for |
| --- | --- | --- |
| [`@gole-number-system/gole-core`](packages/gole-core) | `packages/gole-core` | The padding logic and DOM helpers. No framework needed. |
| [`@gole-number-system/react-gole`](packages/react-gole) | `packages/react-gole` | React components and hooks. |
| [`@gole-number-system/react-gole-charts`](packages/react-gole-charts) | `packages/react-gole-charts` | Recharts axes, tooltips, labels and legends. |

Each package is published to npm separately; install only the one you need. `react-gole` installs `gole-core`, and `react-gole-charts` installs both.

```sh
npm install @gole-number-system/gole-core           # plain JavaScript or TypeScript
npm install @gole-number-system/react-gole          # React
npm install @gole-number-system/react-gole-charts   # React with Recharts
```

The symbols are drawn by the [GoleStandard font](https://github.com/esetu-solutions/gole-number-system-fonts), which is installed with `gole-core`.

The [examples](examples) folder holds a small site that uses all three packages: plain JavaScript, React components and charts.

## Develop

The repository is an npm workspace. One install at the root links the packages to each other.

```sh
npm install
npm run build            # gole-core, then react-gole, then react-gole-charts
npm test                 # builds, then runs every package's tests
npm run typecheck
npm run examples         # builds, then serves the examples at http://localhost:5173
npm run examples:build   # static site in examples/dist/
```

The packages import each other's built output (`dist/`), so the build order matters; the root scripts take care of it. To run a script for one package, add `-w`, for example `npm test -w @gole-number-system/react-gole`.

### Publish

Publish in dependency order, each from the repository root:

```sh
npm publish -w @gole-number-system/gole-core
npm publish -w @gole-number-system/react-gole
npm publish -w @gole-number-system/react-gole-charts
```

Each package runs its type check, tests and build before it is published.

## Licence

The code in this repository is open source under the [MIT licence](LICENSE). The MIT licence covers the code only.

The GoleStandard font (installed with these packages as `@esetu-solutions/gole-number-system-fonts`), the Gole Number System itself and the related patent rights are not covered by it. They are licensed by eSetu Solutions Pvt Ltd under the [Gole Number System Community Licence v1.0](https://www.esetu.in/gole-number-system/licence), which everyone who uses the font receives automatically. Free to use with attribution; conditions apply. See the [full terms](https://www.esetu.in/gole-number-system/licence), or contact [legal@esetu.in](mailto:legal@esetu.in) about a commercial licence.

The MIT licence grants no patent licence. Patent rights for the Gole Number System (Indian Patent Application No. 202441034973) are granted only under §2.6 of the Community Licence.

When you show Gole numbers, credit them as `Gole Number System™ by eSetu Solutions Pvt. Ltd. – https://esetu.in`. Gole Number System and eSetu are trademarks of eSetu.
