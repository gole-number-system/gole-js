// Runs the plugin in a real Tailwind CSS v3 (installed as "tailwindcss-v3") through PostCSS.
import { createRequire } from "node:module";
import postcss from "postcss";
import type { Config } from "tailwindcss-v3";
import { describe, expect, it } from "vitest";
import goleTailwindEsm from "../src/index.mjs";

const require = createRequire(import.meta.url);
const tailwind = require("tailwindcss-v3") as (config: Config) => postcss.AcceptedPlugin;
const goleTailwind = require("../src/index.cjs") as typeof goleTailwindEsm;

async function build(plugins: Config["plugins"], html = "") {
  const config: Config = { content: [{ raw: html, extension: "html" }], corePlugins: { preflight: false }, plugins };
  const input = "@tailwind base;\n@tailwind components;\n@tailwind utilities;";
  return (await postcss([tailwind(config)]).process(input, { from: undefined })).css;
}

function rule(css: string, selector: string) {
  const start = css.indexOf(`${selector} {`);
  if (start === -1) return undefined;
  return css.slice(css.indexOf("{", start) + 1, css.indexOf("}", start)).replace(/\s+/g, " ").trim().replace(/;?$/, ";");
}

describe("Tailwind v3 plugin", () => {
  it("loads with require and with import", () => {
    expect(typeof goleTailwind).toBe("function");
    expect(typeof goleTailwindEsm).toBe("function");
    expect(goleTailwind.__isOptionsFunction).toBe(true);
    expect(goleTailwindEsm().config).toEqual(goleTailwind().config);
  });

  it("adds .gole and .gole-number even when the content does not use them", async () => {
    const css = await build([goleTailwind]);
    expect(rule(css, '[class~="gole"]')).toBe(
      `font-family: "GoleStandard"; font-variant-ligatures: common-ligatures; letter-spacing: normal;`,
    );
    expect(rule(css, '[class~="gole-number"]')).toBe("white-space: nowrap;");
    expect(css).not.toContain(".font-gole");
  });

  it("adds fontFamily.gole, so font-gole works", async () => {
    const css = await build([goleTailwind], `<span class="font-gole md:font-gole">0123</span>`);
    expect(rule(css, ".font-gole")).toBe(`font-family: "GoleStandard";`);
    expect(css).toContain(".md\\:font-gole");
  });

  it("takes a family name and the PUA build as options", async () => {
    const css = await build([goleTailwind({ family: "My Gole", build: "pua" })], `<b class="font-gole"></b>`);
    expect(rule(css, ".font-gole")).toBe(`font-family: "My Gole";`);
    expect(rule(css, '[class~="gole"]')).toBe(`font-family: "My Gole";`);
  });

  it("does not emit a font face: the font CSS is imported separately", async () => {
    expect(await build([goleTailwind])).not.toContain("@font-face");
  });

  it("rejects an unknown build", () => {
    expect(() => goleTailwind({ build: "other" as "pua" })).toThrow(/build must be/);
  });
});
