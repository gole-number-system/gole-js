import { svelte } from "@sveltejs/vite-plugin-svelte";
import { svelteTesting } from "@testing-library/svelte/vite";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    projects: [
      {
        // Components in a browser-like DOM. svelteTesting() selects Svelte's browser code and cleans up after each test.
        plugins: [svelte(), svelteTesting()],
        test: { name: "dom", include: ["test/*.test.ts"], environment: "jsdom" },
      },
      {
        // The same components rendered to HTML with Svelte's server code.
        plugins: [svelte()],
        test: { name: "ssr", include: ["test/ssr/*.test.ts"], environment: "node" },
      },
    ],
  },
});
