import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm", "cjs"],
  dts: true,
  sourcemap: true,
  target: "es2020",
  external: ["react", "react-dom", "react/jsx-runtime"],
  // Some components use hooks, so the bundle is a client module for React Server Components.
  banner: { js: '"use client";' },
});
