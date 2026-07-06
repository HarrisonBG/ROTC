// Copies the web app's static files into www/, which is what Capacitor
// bundles into the native iOS (and Android) app. Run before `cap sync`.
// The root index.html/css/js stay the single source of truth for both
// the GitHub Pages PWA and the native app — this script just mirrors them.
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const DEST = path.join(ROOT, "www");

const ENTRIES = [
  "index.html",
  "manifest.webmanifest",
  "sw.js",
  "css",
  "js",
  "icons"
];

function copyRecursive(src, dest) {
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    fs.mkdirSync(dest, { recursive: true });
    for (const entry of fs.readdirSync(src)) {
      copyRecursive(path.join(src, entry), path.join(dest, entry));
    }
  } else {
    fs.copyFileSync(src, dest);
  }
}

// Capacitor's "no bundler" pattern: drop the core bridge + each plugin's
// UMD build in as plain <script> tags. The native iOS runtime injects
// `window.Capacitor` itself at launch; these scripts attach the plugin
// proxies (SpeechRecognition, LocalNotifications) onto it.
const NATIVE_SCRIPTS = [
  { from: "node_modules/@capacitor/core/dist/capacitor.js", to: "native/capacitor.js" },
  { from: "node_modules/@capacitor-community/speech-recognition/dist/plugin.js", to: "native/speech-recognition.js" },
  { from: "node_modules/@capacitor/local-notifications/dist/plugin.js", to: "native/local-notifications.js" }
];

fs.rmSync(DEST, { recursive: true, force: true });
fs.mkdirSync(DEST, { recursive: true });
for (const entry of ENTRIES) {
  const src = path.join(ROOT, entry);
  if (fs.existsSync(src)) copyRecursive(src, path.join(DEST, entry));
}

fs.mkdirSync(path.join(DEST, "native"), { recursive: true });
const tags = [];
for (const { from, to } of NATIVE_SCRIPTS) {
  const src = path.join(ROOT, from);
  if (!fs.existsSync(src)) throw new Error(`Missing native dependency: ${from} (run npm install)`);
  fs.copyFileSync(src, path.join(DEST, to));
  tags.push(`<script src="${to}"></script>`);
}

const indexPath = path.join(DEST, "index.html");
const marker = /<!-- native-bridge-scripts-placeholder:[\s\S]*?-->/;
let html = fs.readFileSync(indexPath, "utf8");
if (!marker.test(html)) throw new Error("native-bridge-scripts-placeholder comment not found in index.html");
html = html.replace(marker, tags.join("\n"));
fs.writeFileSync(indexPath, html);

console.log(`Copied ${ENTRIES.length} entries + ${NATIVE_SCRIPTS.length} native scripts into ${DEST}`);
