// Small Vite plugin: after `vite build` it fills two placeholders in dist/sw.js
//   VERSION  hash of all built files (changes only when the app changes)
//   PRECACHE_ASSETS list of every built file (JS/CSS with hashed names, icons,
//                      offline page...), so the service worker can pre-cache the shell.
import { createHash } from "node:crypto";
import { readdirSync, readFileSync, statSync, writeFileSync, existsSync } from "node:fs";
import { join, relative, sep } from "node:path";

const EXCLUDE = [/^sw\.js$/, /\.map$/, /^_redirects$/, /^_headers$/, /^vercel\.json$/];

function listFiles(dir) {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    return statSync(full).isDirectory() ? listFiles(full) : [full];
  });
}

export function buildPrecache(outDir) {
  const swPath = join(outDir, "sw.js");
  if (!existsSync(swPath)) throw new Error(`[pwa] ${swPath} not found`);

  const files = listFiles(outDir)
    .map((file) => relative(outDir, file).split(sep).join("/"))
    .filter((file) => !EXCLUDE.some((re) => re.test(file)))
    .sort();

  const hash = createHash("sha256");
  for (const file of files) {
    hash.update(file);
    hash.update(readFileSync(join(outDir, file)));
  }
  const version = hash.digest("hex").slice(0, 10);

  const urls = ["/", ...files.map((file) => `/${file}`)];

  const source = readFileSync(swPath, "utf8");
  const result = source
    .replace(/\/\*__BUILD_VERSION__\*\/\s*"[^"]*"/, JSON.stringify(version))
    .replace(/\/\*__PRECACHE_ASSETS__\*\/\s*\[[^\]]*\]/, JSON.stringify(urls, null, 2));

  if (result === source || result.includes("__PRECACHE_ASSETS__")) {
    throw new Error("[pwa] placeholders not found in sw.js");
  }
  writeFileSync(swPath, result);
  return { version, urls };
}

export default function pwaPrecache() {
  let outDir = "dist";
  return {
    name: "pwa-precache",
    apply: "build",
    configResolved(config) {
      outDir = join(config.root, config.build.outDir);
    },
    closeBundle() {
      const { version, urls } = buildPrecache(outDir);
      console.log(`\n[pwa] sw.js version ${version}, ${urls.length} files pre-cached`);
    },
  };
}
