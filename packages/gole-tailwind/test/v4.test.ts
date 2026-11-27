// Compiles real CSS with the installed Tailwind CSS v4 through @tailwindcss/node, which
// resolves the package imports the same way the Vite, PostCSS and CLI integrations do.
import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { compile } from "@tailwindcss/node";
import { describe, expect, it } from "vitest";

const base = resolve(dirname(fileURLToPath(import.meta.url)), "..");

async function build(css: string, candidates: string[] = []) {
  const dependencies: string[] = [];
  const compiler = await compile(css, {
    base,
    shouldRewriteUrls: true,
    onDependency: (path) => dependencies.push(path),
  });
  return { css: compiler.build(candidates), dependencies };
}

/** The body of the first rule with this selector, with whitespace collapsed. */
function rule(css: string, selector: string) {
  const start = css.indexOf(`${selector} {`);
  if (start === -1) return undefined;
  return css.slice(css.indexOf("{", start) + 1, css.indexOf("}", start)).replace(/\s+/g, " ").trim();
}

describe("Tailwind v4 CSS entry", () => {
  it("loads the Ligature font face with file URLs that exist", async () => {
    const out = await build(`@import "tailwindcss";\n@import "@gole-number-system/gole-tailwind";`);
    expect(rule(out.css, "@font-face")).toContain(`font-family: "GoleStandard"`);
    expect(out.dependencies.some((path) => path.endsWith("fonts/Ligature/GoleStandard.css"))).toBe(true);
    expect(out.dependencies.some((path) => path.endsWith("css/theme.css"))).toBe(true);

    const urls = [...out.css.matchAll(/url\("([^"]+)"\)/g)].map((match) => match[1]!);
    expect(urls.map((url) => url.split("/").pop())).toEqual([
      "GoleStandard.woff2",
      "GoleStandard.woff",
      "GoleStandard.ttf",
    ]);
    for (const url of urls) expect(existsSync(resolve(base, url))).toBe(true);
  });

  it("defines --font-gole and the font-gole utility", async () => {
    const out = await build(`@import "tailwindcss";\n@import "@gole-number-system/gole-tailwind";`, [
      "font-gole",
    ]);
    expect(out.css).toMatch(/--font-gole: "GoleStandard";/);
    expect(rule(out.css, ".font-gole")).toBe("font-family: var(--font-gole);");
  });

  it("emits .gole and .gole-number without any class in the content", async () => {
    const out = await build(`@import "tailwindcss";\n@import "@gole-number-system/gole-tailwind";`);
    expect(out.css).toMatch(/--font-gole: "GoleStandard";/);
    expect(rule(out.css, ".gole")).toBe(
      "font-family: var(--font-gole); font-variant-ligatures: common-ligatures; letter-spacing: normal;",
    );
    expect(rule(out.css, ".gole-number")).toBe("white-space: nowrap;");
    expect(out.css).not.toContain(".font-gole");
  });

  it("resolves the /theme.css entry to the same file", async () => {
    const out = await build(`@import "tailwindcss";\n@import "@gole-number-system/gole-tailwind/theme.css";`);
    expect(out.dependencies.some((path) => path.endsWith("css/theme.css"))).toBe(true);
    expect(rule(out.css, ".gole")).toContain("common-ligatures");
  });

  it("loads the PUA font face from /pua.css and leaves ligatures alone", async () => {
    const out = await build(`@import "tailwindcss";\n@import "@gole-number-system/gole-tailwind/pua.css";`, [
      "font-gole",
    ]);
    expect(out.dependencies.some((path) => path.endsWith("fonts/PUA/GoleStandard_PUA.css"))).toBe(true);
    expect(out.dependencies.some((path) => path.includes("Ligature"))).toBe(false);
    expect(out.css).toContain("GoleStandard_PUA.woff2");
    expect(rule(out.css, ".gole")).toBe("font-family: var(--font-gole);");
    expect(rule(out.css, ".gole-number")).toBe("white-space: nowrap;");
    expect(rule(out.css, ".font-gole")).toBe("font-family: var(--font-gole);");
  });
});

describe("JS plugin through v4 @plugin", () => {
  it("adds font-gole and the classes", async () => {
    const out = await build(`@import "tailwindcss";\n@plugin "@gole-number-system/gole-tailwind";`, [
      "font-gole",
    ]);
    expect(rule(out.css, ".font-gole")).toBe(`font-family: "GoleStandard";`);
    expect(rule(out.css, '[class~="gole"]')).toBe(
      `font-family: "GoleStandard"; font-variant-ligatures: common-ligatures; letter-spacing: normal;`,
    );
    expect(rule(out.css, '[class~="gole-number"]')).toBe("white-space: nowrap;");
    expect(out.css).not.toContain("@font-face");
  });

  it("takes options", async () => {
    const out = await build(
      `@import "tailwindcss";\n@plugin "@gole-number-system/gole-tailwind" { build: pua; family: MyGole; }`,
      ["font-gole"],
    );
    expect(rule(out.css, ".font-gole")).toBe(`font-family: "MyGole";`);
    expect(rule(out.css, '[class~="gole"]')).toBe(`font-family: "MyGole";`);
  });
});
