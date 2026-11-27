// Plain JavaScript: no framework, only gole-core, its stylesheet (which loads the font) and the web components.
import "@gole-number-system/gole-core/gole.css";
import "./styles.css";
import "@gole-number-system/gole-elements/define"; // registers <gole-number>, <gole-text>, <gole-date>, <gole-time>
import { fromGole, golePairs, renderGole, toGole, toGolePUA } from "@gole-number-system/gole-core";

// 1. Convert every [data-gole] element on the page.
renderGole();

// 2. Update a value later: set data-gole-value and render again.
const counter = document.getElementById("counter")!;
let count = 0;
setInterval(() => {
  count += 7;
  counter.dataset.goleValue = String(count);
  renderGole(counter.parentElement!);
}, 1000);

// 3. Or work with strings directly.
const escapes = (text: string) => text.replace(/[-]/g, (c) => "\\u" + c.charCodeAt(0).toString(16).toUpperCase());
const lines = [
  `toGole(123)                 → "${toGole(123)}"`,
  `toGole(12.5)                → "${toGole(12.5)}"`,
  `toGole(-4.5)                → "${toGole(-4.5)}"`,
  `toGole(1234.5, {decimals:2}) → "${toGole(1234.5, { decimals: 2 })}"`,
  `toGole("12:05:09")          → "${toGole("12:05:09")}"`,
  `golePairs(123)              → ${JSON.stringify(golePairs(123))}`,
  `toGolePUA(123)              → "${escapes(toGolePUA(123))}"   (PUA build)`,
  `fromGole("0123")            → ${fromGole("0123")}`,
];
document.getElementById("strings")!.textContent = lines.join("\n");
