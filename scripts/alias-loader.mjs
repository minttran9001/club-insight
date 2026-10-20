import { existsSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const srcDir = fileURLToPath(new URL("../src/", import.meta.url));
const extensions = [".ts", ".tsx", ".js", ".mjs"];

export async function resolve(specifier, context, nextResolve) {
  if (!specifier.startsWith("@/")) return nextResolve(specifier, context);
  const file = resolveFile(join(srcDir, specifier.slice(2)));
  if (!file) return nextResolve(specifier, context);
  return { shortCircuit: true, url: pathToFileURL(file).href };
}

function resolveFile(base) {
  if (existsSync(base)) return base;
  for (const extension of extensions) {
    if (existsSync(`${base}${extension}`)) return `${base}${extension}`;
  }
  for (const extension of extensions) {
    const index = join(base, `index${extension}`);
    if (existsSync(index)) return index;
  }
  return null;
}
