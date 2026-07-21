/* Sabaş Home — static server + grounded AI proxy (zero dependencies).
 *
 * Run:  node server/ai-proxy.mjs
 * Then open the printed URL. The AI assistant calls same-origin /api/chat, which
 * this server forwards to the Sokrates endpoint — the API key stays server-side.
 *
 * Configuration is read from environment variables, or from server/.env if present:
 *   AI_API_URL, AI_API_KEY, AI_CHAT_COMPLETIONS_PATH,
 *   AI_MODEL_FAST, AI_MODEL_REASONING, AI_MODEL_GERMAN_COPY, AI_MODEL_PRO
 *   PORT (default 4180), ALLOW_ORIGIN (default same-origin only)
 *
 * SECURITY: never expose AI_API_KEY to the browser. Keep server/.env out of version
 * control (see .gitignore). Rotate the key if it has ever been shared in plain text.
 */
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { existsSync, readFileSync } from "node:fs";
import { extname, join, normalize, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

/* ---------- tiny .env loader (no dependency) ---------- */
function loadEnv() {
  const file = join(__dirname, ".env");
  if (!existsSync(file)) return;
  for (const raw of readFileSync(file, "utf8").split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    let val = line.slice(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) val = val.slice(1, -1);
    if (!(key in process.env)) process.env[key] = val;
  }
}
loadEnv();

const PORT = Number(process.env.PORT || 4180);
const AI_API_URL = process.env.AI_API_URL || "";
const AI_API_KEY = process.env.AI_API_KEY || "";
const AI_PATH = process.env.AI_CHAT_COMPLETIONS_PATH || "/chat/completions";
const MODEL_FAST = process.env.AI_MODEL_FAST || "sokrates-fast";
const MODEL_DE = process.env.AI_MODEL_GERMAN_COPY || MODEL_FAST;
const MODEL_PRO = process.env.AI_MODEL_PRO || MODEL_FAST;
const ALLOW_ORIGIN = process.env.ALLOW_ORIGIN || "";

const MIME = {
  ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8", ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8", ".svg": "image/svg+xml",
  ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg",
  ".webp": "image/webp", ".ico": "image/x-icon", ".woff2": "font/woff2"
};

/* ---------- grounded brand knowledge + guardrails ---------- */
const LANG_NAME = { tr: "Turkish", ru: "Russian", en: "English", de: "German" };

function systemPrompt(lang) {
  const language = LANG_NAME[lang] || "the visitor's language";
  return [
    "You are the Sabaş Home Assistant — a warm, concise, premium in-store concierge for Sabaş Home, a family-owned home-furnishings and appliances retailer in Alanya, Türkiye.",
    "",
    "VERIFIED FACTS (only use these; do not invent anything beyond them):",
    "- Founded 2005 in Alanya; a family company with 20+ years of experience; tagline “Curator of Luxury Living”.",
    "- Categories: white goods & electronics; furniture & bedding; décor & tableware; carpets & rugs. 41 curated brands including Beko, Grundig, TCL, İstikbal, Kelebek, Lova Yatak, Doqu Home, PIP Studio, Herend, Fissler, KitchenAid, Porland.",
    "- 5 stores in Alanya (Google rating in brackets): Oba — Çevreyolu No:31/A (4.5★); Alaiye ‘Luxury Home Decor & Halı’ — Alaiye Cd. No:73/A, Şekerhane (new listing); Gazipaşa ‘Beko Sabaş Home’ — Alanya Yolu No:3/1A (4.6★); Güllerpınarı — Akçalıoğlu Cd. No:52/C (4.4★); Mahmutlar ‘Beko Sabaş Home’ — Barbaros Cd. No:231/A (4.6★).",
    "- Online: evdego.com, plus Hepsiburada, Koçtaş and N11. WhatsApp: +90 552 591 0794. Email: info@sabashome.com. Languages served: Turkish, Russian, English, German.",
    "",
    "GUARDRAILS:",
    "- NEVER invent or quote prices, discounts, stock levels, delivery times, warranty terms or return policies. If asked, say these depend on the product and current stock, and offer to connect them to the team on WhatsApp (+90 552 591 0794) or invite them to visit a store.",
    "- Do not fabricate products, brands, store hours, promotions, reviews or facts not listed above.",
    "- Only discuss Sabaş Home, its products, stores, and home-furnishing guidance. Politely decline unrelated, sensitive, or harmful topics and steer back to helping with their home.",
    "- Recommend the most relevant store/category and, when the visitor is ready to buy or wants specifics, hand off to WhatsApp or the store.",
    "- Be honest that you are an AI assistant. Keep answers under ~110 words, friendly and elegant.",
    "",
    "Always reply in " + language + ", regardless of the language of these instructions."
  ].join("\n");
}

/* ---------- simple in-memory rate limit ---------- */
const hits = new Map();
function rateLimited(ip) {
  const now = Date.now();
  const arr = (hits.get(ip) || []).filter((t) => now - t < 60000);
  arr.push(now);
  hits.set(ip, arr);
  return arr.length > 25;
}

function send(res, status, body, headers = {}) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8", ...headers });
  res.end(typeof body === "string" ? body : JSON.stringify(body));
}

function corsHeaders(req) {
  const origin = req.headers.origin;
  const allow = ALLOW_ORIGIN || origin || "*";
  return { "Access-Control-Allow-Origin": allow, "Access-Control-Allow-Methods": "POST, OPTIONS", "Access-Control-Allow-Headers": "Content-Type", "Vary": "Origin" };
}

async function handleChat(req, res) {
  const cors = corsHeaders(req);
  if (req.method === "OPTIONS") { res.writeHead(204, cors); res.end(); return; }
  if (req.method !== "POST") return send(res, 405, { error: "method_not_allowed" }, cors);

  const ip = (req.headers["x-forwarded-for"] || req.socket.remoteAddress || "unknown").toString().split(",")[0].trim();
  if (rateLimited(ip)) return send(res, 429, { error: "rate_limited" }, cors);

  let raw = "";
  req.on("data", (c) => { raw += c; if (raw.length > 12000) req.destroy(); });
  req.on("end", async () => {
    if (!AI_API_URL || !AI_API_KEY) return send(res, 503, { error: "ai_not_configured" }, cors);
    let payload;
    try { payload = JSON.parse(raw || "{}"); } catch (e) { return send(res, 400, { error: "bad_json" }, cors); }

    const message = String(payload.message || "").slice(0, 2000).trim();
    if (!message) return send(res, 400, { error: "empty_message" }, cors);
    const lang = ["tr", "ru", "en", "de"].includes(payload.lang) ? payload.lang : "en";
    const history = Array.isArray(payload.history) ? payload.history.slice(-8)
      .filter((m) => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
      .map((m) => ({ role: m.role, content: String(m.content).slice(0, 2000) })) : [];

    const messages = [{ role: "system", content: systemPrompt(lang) }, ...history];
    if (!history.length || history[history.length - 1].content !== message) messages.push({ role: "user", content: message });

    const model = lang === "de" ? MODEL_DE : MODEL_FAST;
    const url = AI_API_URL.replace(/\/$/, "") + AI_PATH;

    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 28000);
      const upstream = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": "Bearer " + AI_API_KEY },
        body: JSON.stringify({ model, messages, temperature: 0.4, max_tokens: 400, stream: false }),
        signal: controller.signal
      });
      clearTimeout(timer);
      if (!upstream.ok) {
        const detail = await upstream.text().catch(() => "");
        console.error("Upstream AI error", upstream.status, detail.slice(0, 300));
        return send(res, 502, { error: "upstream_error", status: upstream.status }, cors);
      }
      const data = await upstream.json();
      const reply = (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content)
        || data.reply || data.content || "";
      if (!reply) return send(res, 502, { error: "empty_reply" }, cors);
      return send(res, 200, { reply: String(reply).trim(), model }, cors);
    } catch (err) {
      console.error("Proxy error:", err && err.message);
      return send(res, 502, { error: "proxy_failed" }, cors);
    }
  });
}

/* ---------- static file serving ---------- */
async function serveStatic(req, res) {
  let pathname = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
  if (pathname === "/") pathname = "/index.html";
  const safe = normalize(pathname).replace(/^(\.\.[/\\])+/, "");
  const filePath = join(ROOT, safe);
  if (!filePath.startsWith(ROOT)) return send(res, 403, { error: "forbidden" });
  try {
    const info = await stat(filePath);
    if (info.isDirectory()) return serveFile(join(filePath, "index.html"), res);
    return serveFile(filePath, res);
  } catch (e) {
    return send(res, 404, { error: "not_found" });
  }
}
async function serveFile(filePath, res) {
  try {
    const body = await readFile(filePath);
    const type = MIME[extname(filePath).toLowerCase()] || "application/octet-stream";
    res.writeHead(200, { "Content-Type": type, "Cache-Control": "no-cache" });
    res.end(body);
  } catch (e) {
    send(res, 404, { error: "not_found" });
  }
}

const server = createServer((req, res) => {
  const { pathname } = new URL(req.url, "http://localhost");
  if (pathname === "/api/chat") return handleChat(req, res);
  if (pathname === "/api/health") return send(res, 200, { ok: true, aiConfigured: Boolean(AI_API_URL && AI_API_KEY) });
  return serveStatic(req, res);
});

server.listen(PORT, () => {
  console.log("Sabaş Home running at  http://127.0.0.1:" + PORT + "/");
  console.log("AI proxy: " + (AI_API_URL && AI_API_KEY ? "configured (" + MODEL_FAST + ")" : "NOT configured — set server/.env"));
});
