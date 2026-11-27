"use strict";

/**
 * Tailwind CSS plugin for the Gole Number System. Adds `fontFamily.gole` to the theme (the
 * `font-gole` utility) and the `gole` / `gole-number` class styles that gole-core, react-gole and
 * gole-elements emit. It does not add the `@font-face`: import the font CSS once yourself.
 *
 * Written against the plugin object shape directly (the same one `tailwindcss/plugin` returns),
 * so it loads in Tailwind v3 and v4 without importing either.
 *
 * @example
 * // tailwind.config.js (v3)
 * module.exports = { plugins: [require("@gole-number-system/gole-tailwind")] };
 * // with options
 * module.exports = { plugins: [require("@gole-number-system/gole-tailwind")({ build: "pua" })] };
 */
function goleTailwind(options) {
  const { family = "GoleStandard", build = "ligature" } = options || {};
  if (build !== "ligature" && build !== "pua") {
    throw new TypeError(`gole-tailwind: build must be "ligature" or "pua", got ${JSON.stringify(build)}`);
  }
  const font = JSON.stringify(family);

  return {
    config: { theme: { extend: { fontFamily: { gole: [font] } } } },
    // The classes come from components inside node_modules, which Tailwind does not scan, and
    // Tailwind v3 drops class rules it does not find in the content. Base rules written as
    // attribute selectors are always emitted and weigh the same as a class selector.
    handler({ addBase }) {
      addBase({
        '[class~="gole"]':
          build === "pua"
            ? { fontFamily: font }
            : { fontFamily: font, fontVariantLigatures: "common-ligatures", letterSpacing: "normal" },
        '[class~="gole-number"]': { whiteSpace: "nowrap" },
      });
    },
  };
}

// Tailwind calls a function with this flag itself when it is listed without options.
goleTailwind.__isOptionsFunction = true;

module.exports = goleTailwind;
module.exports.default = goleTailwind;
