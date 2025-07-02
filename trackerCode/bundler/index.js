const esbuild = require("esbuild");
const path = require("path");

const trackerUrl = process.env.TRACKER_URL || "http://localhost:3000";
const siteID = process.env.SITE_ID || "TEST123";

if (!trackerUrl) {
  console.error("Hata: TRACKER_URL ortam değişkeni tanımlanmadı.");
  process.exit(1);
}

esbuild
  .build({
    entryPoints: ["main.ts"],
    bundle: true,
    outfile: "./dist/bundle.js",
    format: "esm",
    platform: "browser",
    target: "es2020",
    sourcemap: false,
    minify: true,
    loader: {
      ".ts": "ts",
    },
    define: {
      API_URL: `"${trackerUrl}"`,
      SITE_ID: `"${siteID}"`,
    },
  })
  .catch(() => process.exit(1));
