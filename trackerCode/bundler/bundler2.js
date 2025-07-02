const esbuild = require("esbuild");
const path = require("path");

const trackerUrl = process.env.TRACKER_URL;
const siteID = process.env.SITE_ID;
if (!trackerUrl) {
    console.error("TRACKER_URL is not defined");
    process.exit(1);
}

const entryPath = path.resolve(__dirname, "../main.ts");

esbuild
    .build({
        entryPoints: [entryPath],
        bundle: true,
        format: "esm",
        platform: "browser",
        target: "es2020",
        sourcemap: false,
        minify: true,
        write: false, // ÖNEMLİ: dosyaya yazma
        loader: {
            ".ts": "ts",
        },
        define: {
            API_URL: `"${trackerUrl}"`,
            SITE_ID: `"${siteID}"`,
        },
    })
    .then((result) => {
        if (result.outputFiles && result.outputFiles.length > 0) {
            const bundledCode = result.outputFiles[0].text;
            console.log(bundledCode); // API'ye stdout ile dönecek veri bu
        } else {
            console.error("No output generated.");
            process.exit(1);
        }
    })
    .catch((err) => {
        console.error("Build sırasında hata:", err);
        process.exit(1);
    });
