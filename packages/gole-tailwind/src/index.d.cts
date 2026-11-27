declare namespace goleTailwind {
  /** Options for the plugin. */
  interface GoleTailwindOptions {
    /** Font family name used by `font-gole` and `.gole`. Default `"GoleStandard"`. */
    family?: string;
    /**
     * Font build you load. `"ligature"` (default) also turns common ligatures on for `.gole`;
     * `"pua"` only sets the family.
     */
    build?: "ligature" | "pua";
  }

  /** What the plugin gives Tailwind: a theme extension and a handler that adds the classes. */
  interface GoleTailwindPlugin {
    handler: (api: any) => void;
    config: { theme: { extend: { fontFamily: { gole: string[] } } } };
  }
}

/**
 * Tailwind CSS plugin for the Gole Number System: `font-gole`, `.gole` and `.gole-number`.
 * List it as it is, or call it with options.
 *
 * @example
 * plugins: [require("@gole-number-system/gole-tailwind")]
 * plugins: [require("@gole-number-system/gole-tailwind")({ build: "pua" })]
 */
declare const goleTailwind: {
  (options?: goleTailwind.GoleTailwindOptions): goleTailwind.GoleTailwindPlugin;
  __isOptionsFunction: true;
};

export = goleTailwind;
