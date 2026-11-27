// ng-packagr copies package.json into dist and adds the entry points. Remove the fields
// that only make sense in the source folder, so that dist is a clean package to publish.
import { readFileSync, writeFileSync } from "node:fs";

const file = new URL("../dist/package.json", import.meta.url);
const manifest = JSON.parse(readFileSync(file, "utf8"));
for (const field of ["files", "scripts", "devDependencies", "main", "types"]) delete manifest[field];
writeFileSync(file, JSON.stringify(manifest, null, 2) + "\n");
