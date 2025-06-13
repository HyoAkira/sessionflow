const esbuild = require("esbuild");
const path = require("path");

esbuild
  .build({
    entryPoints: ["main.ts"],
    bundle: true,
    outfile: "./dist/bundle.js",
    format: "esm",
    platform: "browser",
    target: "es2020",
    sourcemap: true,
    loader: {
      ".ts": "ts",
    },
  })
  .catch(() => process.exit(1));