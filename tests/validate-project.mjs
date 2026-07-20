import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, extname, isAbsolute, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const workspace = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function readArg(name, fallback) {
  const index = process.argv.indexOf(`--${name}`);
  if (index >= 0) return process.argv[index + 1];
  const inline = process.argv.find((value) => value.startsWith(`--${name}=`));
  return inline ? inline.slice(name.length + 3) : fallback;
}

const mode = readArg("mode", "starter");
const root = resolve(workspace, readArg("root", "starter"));
const checks = [];

function check(id, condition, message) {
  checks.push({ id, status: condition ? "PASS" : "FAIL", message });
}

function walk(directory) {
  if (!existsSync(directory)) return [];
  return readdirSync(directory).flatMap((name) => {
    const path = join(directory, name);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
}

function content(path) {
  return readFileSync(path, "utf8");
}

function idsIn(html) {
  return [...html.matchAll(/\s+id=["']([^"']+)["']/gi)].map((match) => match[1]);
}

function localReferences(html) {
  return [...html.matchAll(/\b(?:href|src)=["']([^"']+)["']/gi)]
    .map((match) => match[1])
    .filter((value) => !/^(?:https?:|mailto:|tel:|data:|#)/i.test(value));
}

check("STRUCT-ROOT", existsSync(root) && statSync(root).isDirectory(), `Project root exists: ${relative(workspace, root)}`);

const required = [
  "index.html",
  "imprint.html",
  "privacy.html",
  "assets/css/styles.css",
  "assets/js/site-config.js",
  "assets/js/site.js"
];

required.forEach((path) => check(`STRUCT-${path.toUpperCase().replace(/[^A-Z0-9]+/g, "-")}`, existsSync(join(root, path)), `Required file: ${path}`));

if (!checks.every((item) => item.status === "PASS")) finish();

const allFiles = walk(root);
const htmlFiles = allFiles.filter((path) => extname(path).toLowerCase() === ".html");
const textFiles = allFiles.filter((path) => [".html", ".css", ".js", ".json", ".svg", ".md"].includes(extname(path).toLowerCase()));
const combined = textFiles.map(content).join("\n");

htmlFiles.forEach((path) => {
  const html = content(path);
  const label = relative(root, path);
  const ids = idsIn(html);
  const duplicateIds = ids.filter((id, index) => ids.indexOf(id) !== index);
  const h1Count = (html.match(/<h1\b/gi) || []).length;

  check(`HTML-LANG-${label}`, /<html\b[^>]*\blang=["'][a-z]{2,3}(?:-[A-Z]{2})?["']/i.test(html), `${label}: valid document language`);
  check(`HTML-TITLE-${label}`, /<title>[^<]{3,}<\/title>/i.test(html), `${label}: meaningful title`);
  check(`HTML-H1-${label}`, h1Count === 1, `${label}: exactly one H1`);
  check(`HTML-IDS-${label}`, duplicateIds.length === 0, `${label}: unique IDs`);

  [...html.matchAll(/href=["']#([^"']+)["']/gi)].forEach((match) => {
    check(`ANCHOR-${label}-${match[1]}`, ids.includes(match[1]), `${label}: #${match[1]} resolves`);
  });

  localReferences(html).forEach((reference) => {
    const pathOnly = reference.split(/[?#]/)[0];
    const target = isAbsolute(pathOnly) ? pathOnly : resolve(dirname(path), pathOnly);
    check(`ASSET-${label}-${reference}`, existsSync(target), `${label}: local reference exists (${reference})`);
  });

  [...html.matchAll(/<a\b[^>]*target=["']_blank["'][^>]*>/gi)].forEach((match, index) => {
    check(`LINK-SAFE-${label}-${index + 1}`, /rel=["'][^"']*\bnoopener\b[^"']*\bnoreferrer\b[^"']*["']/i.test(match[0]), `${label}: new-tab link has noopener noreferrer`);
  });
});

const indexHtml = content(join(root, "index.html"));
const css = content(join(root, "assets/css/styles.css"));
const siteJs = content(join(root, "assets/js/site.js"));
const configPath = join(root, "assets/js/site-config.js");
delete require.cache[require.resolve(configPath)];
const config = require(configPath);

check("META-VIEWPORT", /<meta\s+name=["']viewport["']/i.test(indexHtml), "Index has viewport metadata");
check("META-DESCRIPTION", /<meta\s+name=["']description["']\s+content=["'][^"']+["']/i.test(indexHtml), "Index has a description field");
check("A11Y-SKIP", /class=["'][^"']*skip-link[^"']*["'][^>]*href=["']#main["']/i.test(indexHtml), "Index has a skip link");
check("A11Y-MAIN", /<main\b[^>]*id=["']main["']/i.test(indexHtml), "Index has a main landmark target");
check("A11Y-FOCUS", /:focus-visible/.test(css), "Visible focus styling exists");
check("A11Y-REDUCED", /@media\s*\(prefers-reduced-motion:\s*reduce\)/.test(css), "Reduced-motion CSS exists");
check("MOTION-NOJS", /\.motion-ready\s+\.reveal/.test(css) && !/^\s*\.reveal\s*\{[^}]*opacity:\s*0/ms.test(css), "Reveal hiding is gated by a JavaScript-ready class");
check("MOTION-RAF", /requestAnimationFrame/.test(siteJs), "Scroll/pointer work uses requestAnimationFrame");
check("MOTION-VISIBILITY", /visibilitychange/.test(siteJs) && /document\.hidden|doc\.hidden/.test(siteJs), "Visibility state is handled");
check("MOTION-POINTER", /\(hover: hover\) and \(pointer: fine\)/.test(siteJs), "Pointer motion is gated to fine pointers");
check("MOTION-OBSERVER", /IntersectionObserver/.test(siteJs), "One-shot reveal observer exists");
check("CSS-NO-TRANSITION-ALL", !/transition\s*:\s*all\b/i.test(css), "CSS avoids transition: all");
check("I18N-PARITY", Object.keys(config.translations || {}).length > 0 && Object.values(config.translations).every((dictionary) => Object.values(dictionary).every((value) => String(value).trim())), "Configured translations are non-empty");

const translationKeys = Object.values(config.translations || {}).map((dictionary) => Object.keys(dictionary).sort().join("|"));
check("I18N-KEYS", new Set(translationKeys).size === 1, "Configured languages use identical translation keys");

const manifestMatch = indexHtml.match(/<script\s+type=["']application\/json["']\s+id=["']motion-manifest["']>\s*([\s\S]*?)\s*<\/script>/i);
let manifest = null;
try { manifest = manifestMatch ? JSON.parse(manifestMatch[1]) : null; } catch (_) { manifest = null; }
check("MOTION-MANIFEST", Boolean(manifest), "Motion manifest parses as JSON");

const catalogPath = join(workspace, "webanimation", "web_animation_reference.html");
const catalogHtml = content(catalogPath);
const catalogMatch = catalogHtml.match(/<script\s+type=["']application\/json["']\s+id=["']agent14-motion-catalog["']>\s*([\s\S]*?)\s*<\/script>/i);
let catalog = null;
try { catalog = catalogMatch ? JSON.parse(catalogMatch[1]) : null; } catch (_) { catalog = null; }
check("MOTION-CATALOG", Boolean(catalog), "Local motion catalogue parses as JSON");

if (manifest && catalog) {
  const catalogIds = new Set(catalog.patterns.map((pattern) => pattern.id));
  const selected = [manifest.primary, ...(manifest.supporting || [])];
  check("MOTION-SELECTION-COUNT", selected.length >= 3 && selected.length <= 5, "One primary and two to four supporting motion patterns selected");
  check("MOTION-SELECTION-IDS", selected.every((id) => catalogIds.has(id)), "Every selected motion ID exists in the local catalogue");
  check("MOTION-SELECTION-USED", selected.every((id) => indexHtml.includes(`data-motion-id=\"${id}\"`)), "Every selected motion ID is mapped in the HTML");
  check("MOTION-SOURCE-ID", manifest.source_id === catalog.source_id && manifest.rules_version === catalog.rules_version, "Motion source ID and rules version match");
  const hash = createHash("sha256").update(readFileSync(catalogPath)).digest("hex");
  check("MOTION-HASH", String(manifest.sha256).toLowerCase() === hash, "Motion manifest SHA-256 matches the local reference");
}

if (mode === "starter") {
  check("STARTER-MODE", /data-template-mode=["']true["']/i.test(indexHtml), "Starter is explicitly marked as template mode");
  check("STARTER-TOKENS", /\[\[[A-Z0-9_]+\]\]/.test(combined), "Starter keeps conspicuous unresolved tokens");
  check("STARTER-NOINDEX", /<meta\s+name=["']robots["']\s+content=["']noindex,nofollow["']/i.test(indexHtml), "Starter prevents accidental indexing");
} else if (mode === "release") {
  check("RELEASE-TOKENS", !/\[\[[A-Z0-9_]+\]\]|\[[A-Z0-9_]+\]/.test(combined), "Release has no unresolved tokens");
  check("RELEASE-TEMPLATE-FLAG", !/data-template-mode=["']true["']/i.test(combined), "Release is not marked as template mode");
  check("RELEASE-PLACEHOLDER", !/placeholder/i.test(combined), "Release contains no placeholder media or copy");
  check("RELEASE-DUMMY", !/\.example\b|localhost|127\.0\.0\.1|lorem ipsum|javascript:void\(0\)|\bTODO\b/i.test(combined), "Release contains no example, local, Lorem, void, or TODO values");
  check("RELEASE-INDEXABLE", !/<meta\s+name=["']robots["']\s+content=["'][^"']*noindex/i.test(indexHtml), "Release is not blocked from indexing");
  check("RELEASE-WHATSAPP", /^\d{8,15}$/.test(String(config.whatsappNumber || "").replace(/\D/g, "")) && !/\[/.test(config.whatsappNumber), "Release has a verified-format WhatsApp number");
} else {
  check("MODE", false, `Unknown validation mode: ${mode}`);
}

finish();

function finish() {
  checks.forEach((item) => console.log(`${item.status.padEnd(4)} ${item.id} — ${item.message}`));
  const failures = checks.filter((item) => item.status === "FAIL");
  console.log(`\n${checks.length - failures.length}/${checks.length} checks passed (${mode} mode).`);
  process.exit(failures.length ? 1 : 0);
}
