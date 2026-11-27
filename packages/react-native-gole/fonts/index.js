// The GoleStandard font files as Metro asset modules, for expo-font:
//
//   import { useFonts } from "expo-font";
//   import { goleFontFamily } from "@gole-number-system/react-native-gole";
//   import { GoleStandardPUA } from "@gole-number-system/react-native-gole/fonts";
//   const [loaded] = useFonts({ [goleFontFamily("pua")]: GoleStandardPUA });
//
// This file is published as it is, not bundled: Metro has to see the literal require() calls.
// Load one build only; both declare the same family name.

/** PUA build (the default of the components). */
export const GoleStandardPUA = require("@esetu-solutions/gole-number-system-fonts/fonts/PUA/GoleStandard_PUA.ttf");

/** Ligature build. */
export const GoleStandardLigature = require("@esetu-solutions/gole-number-system-fonts/fonts/Ligature/GoleStandard.ttf");
