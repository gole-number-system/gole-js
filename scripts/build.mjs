// Build every package in dependency order: gole-core first, then the packages that
// import it, then the ones that import those. The examples are built separately.
import { execSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync } from "node:fs";

const packages = new Map();
for (const folder of readdirSync("packages")) {
  const file = `packages/${folder}/package.json`;
  if (!existsSync(file)) continue;
  const manifest = JSON.parse(readFileSync(file, "utf8"));
  if (manifest.scripts?.build) packages.set(manifest.name, manifest);
}

const done = new Set();
const build = (name) => {
  if (done.has(name)) return;
  done.add(name);
  const manifest = packages.get(name);
  const dependencies = { ...manifest.dependencies, ...manifest.peerDependencies, ...manifest.devDependencies };
  for (const dependency of Object.keys(dependencies)) if (packages.has(dependency)) build(dependency);
  execSync(`npm run build -w ${name}`, { stdio: "inherit" });
};

const only = process.argv.slice(2);
for (const name of only.length ? only : packages.keys()) build(name);
