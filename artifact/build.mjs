/**
 * Builds the Residents Portal as ONE self-contained HTML page (artifact/dist/barangay-baesa-portal.html).
 *
 *   npm run build:artifact
 *
 * - App code is the same src/ code the Next.js app uses; next/* imports are swapped
 *   for small shims in artifact/shims (in-page router, <img>, React.lazy).
 * - React 18 and Leaflet load from cdnjs (the only script host artifact pages allow);
 *   everything else (app JS, Tailwind CSS, Leaflet CSS, logo) is inlined.
 */
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..");
const dist = join(here, "dist");
mkdirSync(dist, { recursive: true });

export const CDN = {
  react: "https://cdnjs.cloudflare.com/ajax/libs/react/18.3.1/umd/react.production.min.js",
  reactDom: "https://cdnjs.cloudflare.com/ajax/libs/react-dom/18.3.1/umd/react-dom.production.min.js",
  leaflet: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.js",
};

// 1. Tailwind CSS (scans src/ and artifact/)
execFileSync(
  join(root, "node_modules/.bin/tailwindcss"),
  ["-i", join(here, "styles.css"), "-o", join(dist, "app.css"), "--minify"],
  { cwd: root, stdio: "inherit" },
);

// 2. App bundle
const globals = { react: "React", "react-dom": "ReactDOM", "react-dom/client": "ReactDOM", leaflet: "L" };
const shims = {
  "next/link": "next-link.tsx",
  "next/navigation": "next-navigation.ts",
  "next/image": "next-image.tsx",
  "next/dynamic": "next-dynamic.tsx",
  "react/jsx-runtime": "jsx-runtime.js",
};

const result = await build({
  entryPoints: [join(here, "main.tsx")],
  bundle: true,
  write: false,
  format: "iife",
  platform: "browser",
  target: ["es2020"],
  minify: true,
  legalComments: "none",
  jsx: "automatic",
  jsxDev: false,
  tsconfig: join(root, "tsconfig.json"),
  define: { "process.env.NODE_ENV": '"production"' },
  loader: { ".png": "dataurl" },
  plugins: [
    {
      name: "artifact-shims",
      setup(b) {
        b.onResolve({ filter: /^(react|react-dom|react-dom\/client|leaflet)$/ }, (a) => ({
          path: a.path,
          namespace: "global",
        }));
        b.onLoad({ filter: /.*/, namespace: "global" }, (a) => ({
          contents: `module.exports = window.${globals[a.path]};`,
          loader: "js",
        }));
        b.onResolve({ filter: /^(next\/(link|navigation|image|dynamic)|react\/jsx-runtime)$/ }, (a) => ({
          path: join(here, "shims", shims[a.path]),
        }));
        // Leaflet's stylesheet is inlined separately below.
        b.onResolve({ filter: /\.css$/ }, () => ({ path: "css", namespace: "empty" }));
        b.onLoad({ filter: /.*/, namespace: "empty" }, () => ({ contents: "", loader: "js" }));
      },
    },
  ],
});

const js = result.outputFiles[0].text.replace(/<\/script/gi, "<\\/script");
const css = readFileSync(join(dist, "app.css"), "utf8");
const leafletCss = readFileSync(join(root, "node_modules/leaflet/dist/leaflet.css"), "utf8")
  // Only used by controls this app doesn't add; avoids requests to missing files.
  .replace(/url\(images\/[^)]+\)/g, "none");

// 3. Single page. The artifact host wraps this in <html>/<head>/<body>.
const html = `<title>Barangay Baesa E-Services</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap">
<style>${leafletCss}</style>
<style>${css}</style>
<div id="root"></div>
<noscript><p style="padding:24px">The Barangay Baesa E-Services demo needs JavaScript.</p></noscript>
<script src="${CDN.react}"></script>
<script src="${CDN.reactDom}"></script>
<script src="${CDN.leaflet}"></script>
<script>${js}</script>
`;

const out = join(dist, "barangay-baesa-portal.html");
writeFileSync(out, html);
console.log(`Wrote ${out} (${(Buffer.byteLength(html) / 1024).toFixed(0)} KB)`);
