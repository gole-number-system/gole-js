import { resolve } from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  // react-native itself cannot be loaded in Node; the tests use a small stand-in.
  resolve: { alias: { "react-native": resolve("test/react-native-mock.ts") } },
  test: { include: ["test/**/*.test.tsx"], environment: "node" },
});
