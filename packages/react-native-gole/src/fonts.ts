import { Platform } from "react-native";
import { GOLE_FONT_FAMILY, type GoleBuild } from "@gole-number-system/gole-core";

/** PostScript name of both font builds. iOS accepts it as well as the family name. */
export const GOLE_FONT_POSTSCRIPT_NAME = "GoleStandard-Regular";

/**
 * File names of the two font builds, without `.ttf`. Android names a linked font
 * after its file, so these are the Android font families.
 */
export const GOLE_FONT_FILES = { ligature: "GoleStandard", pua: "GoleStandard_PUA" } as const;

/**
 * The `fontFamily` that reaches the GoleStandard font on this platform.
 *
 * - Android: the file name without extension, `"GoleStandard_PUA"` or `"GoleStandard"`.
 * - iOS and everything else: the family name inside the font, `"GoleStandard"`.
 *
 * ```ts
 * goleFontFamily()                      // "GoleStandard_PUA" on Android, "GoleStandard" on iOS
 * goleFontFamily("ligature", "android") // "GoleStandard"
 * ```
 *
 * With expo-font, use the same value as the key: `useFonts({ [goleFontFamily()]: GoleStandardPUA })`.
 */
export function goleFontFamily(build: GoleBuild = "pua", os: string = Platform.OS): string {
  return os === "android" ? GOLE_FONT_FILES[build] : GOLE_FONT_FAMILY;
}
