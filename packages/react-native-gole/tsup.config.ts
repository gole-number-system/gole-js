import { defineConfig } from "tsup";

// The font entry (fonts/index.js) is plain JavaScript and is published as it is: its
// require() calls for the .ttf files must reach Metro unchanged, so it is not bundled.
export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm", "cjs"],
  dts: true,
  sourcemap: true,
  target: "es2020",
  external: ["react", "react-native", "react/jsx-runtime"],
});
