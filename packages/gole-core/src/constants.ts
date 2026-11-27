/** PUA build: the symbol for pair n (0–99) is the character U+E441 + n. */
export const GOLE_PUA_BASE = 0xe441;

/** PUA build: last Gole symbol, pair 99. */
export const GOLE_PUA_END = GOLE_PUA_BASE + 99;

/** Family name declared by both builds of the GoleStandard font. */
export const GOLE_FONT_FAMILY = "GoleStandard";

/**
 * Which GoleStandard font build the text is meant for.
 * - `"ligature"`: the text stays padded decimal digits; the font joins each pair.
 * - `"pua"`: each pair becomes one Private Use Area character.
 */
export type GoleBuild = "ligature" | "pua";
