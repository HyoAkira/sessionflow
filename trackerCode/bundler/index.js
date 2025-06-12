// build.js
require("esbuild")
  .build({
    entryPoints: ["./main.ts"], // Giriş dosyan
    bundle: true,
    outfile: "./dist/bundle.js",
    platform: "browser", // ya da 'node'
    target: "es2017",
    sourcemap: false,
  })
  .catch(() => process.exit(1));
