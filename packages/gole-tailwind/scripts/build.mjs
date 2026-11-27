// The plugin is plain JavaScript, so the build copies src to dist and checks that both
// entry points load and that the CSS entries exist.
import { cpSync, existsSync, rmSync } from "node:fs";
import { createRequire } from "node:module";

rmSync("dist", { recursive: true, force: true });
cpSync("src", "dist", { recursive: true });

const require = createRequire(import.meta.url);
const cjs = require("../dist/index.cjs");
const esm = (await import("../dist/index.mjs")).default;
if (typeof cjs !== "function" || esm !== cjs || typeof cjs().handler !== "function") {
  throw new Error("gole-tailwind: dist does not export the plugin");
}
for (const file of ["css/theme.css", "css/pua.css"]) {
  if (!existsSync(file)) throw new Error(`gole-tailwind: ${file} is missing`);
}
console.log("gole-tailwind: built dist/index.cjs, dist/index.mjs and their types");
