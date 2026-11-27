// The v4 tests load the package by name, which resolves to dist, so build it first.
import { execFileSync } from "node:child_process";

export default function setup() {
  execFileSync(process.execPath, ["scripts/build.mjs"], { stdio: "ignore" });
}
