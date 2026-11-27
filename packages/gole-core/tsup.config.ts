import { defineConfig } from "tsup";

export default defineConfig([
  {
    entry: ["src/index.ts"],
    format: ["esm", "cjs"],
    dts: true,
    sourcemap: true,
    target: "es2020",
  },
  {
    // <script src=".../index.global.js"> exposes window.Gole
    entry: ["src/index.ts"],
    format: ["iife"],
    globalName: "Gole",
    minify: true,
    target: "es2020",
  },
]);
