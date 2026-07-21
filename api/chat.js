/* Sabaş Home — grounded AI concierge as a Vercel serverless function.
 *
 * Route:  POST /api/chat   body: { message, history, lang }
 * Returns: { reply, model }
 *
 * Set these in Vercel -> Project Settings -> Environment Variables
 * (the key stays server-side; NEVER expose AI_API_KEY to the browser):
 *   AI_API_URL                (required)  e.g. https://your-endpoint
 *   AI_API_KEY                (required)
 *   AI_CHAT_COMPLETIONS_PATH  (optional, default /chat/completions)
 *   AI_MODEL_FAST             (optional, default sokrates-fast)
 *   AI_MODEL_GERMAN_COPY      (optional, default = AI_MODEL_FAST)
 *
 * Same grounded brand knowledge + guardrails as server/ai-proxy.mjs.
 */

const AI_API_URL = process.env.AI_API_URL || "";
const AI_API_KEY = process.env.AI_API_KEY || "";
const AI_PATH = process.env.AI_CHAT_COMPLETIONS_PATH || "/chat/completions";
const MODEL_FAST = process.env.AI_MODEL_FAST || "sokrates-fast";
const MODEL_DE = process.env.AI_MODEL_GERMAN_COPY || MODEL_FAST;

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

/* best-effort per-instance soft rate limit (serverless instances are ephemeral) */
const hits = new Map();
function rateLimited(ip) {
  const now = Date.now();
  const arr = (hits.get(ip) || []).filter((t) => now - t < 60000);
  arr.push(now);
  hits.set(ip, arr);
  return arr.length > 25;
}

module.exports = async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method === "OPTIONS") { res.status(204).end(); return; }
  if (req.method !== "POST") { res.status(405).json({ error: "method_not_allowed" }); return; }
  if (!AI_API_URL || !AI_API_KEY) { res.status(503).json({ error: "ai_not_configured" }); return; }

  const fwd = String(req.headers["x-forwarded-for"] || "");
  const ip = fwd.split(",").at(0).trim() || "unknown";
  if (rateLimited(ip)) { res.status(429).json({ error: "rate_limited" }); return; }

  let payload = req.body;
  if (typeof payload === "string") {
    try { payload = JSON.parse(payload || "{}"); } catch (e) { res.status(400).json({ error: "bad_json" }); return; }
  }
  if (!payload || typeof payload !== "object") payload = {};

  const message = String(payload.message || "").slice(0, 2000).trim();
  if (!message) { res.status(400).json({ error: "empty_message" }); return; }
  const lang = ["tr", "ru", "en", "de"].includes(payload.lang) ? payload.lang : "en";
  const history = Array.isArray(payload.history) ? payload.history.slice(-8)
    .filter((m) => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
    .map((m) => ({ role: m.role, content: String(m.content).slice(0, 2000) })) : [];

  const messages = [{ role: "system", content: systemPrompt(lang) }].concat(history);
  const last = history.at(-1);
  if (!last || last.content !== message) messages.push({ role: "user", content: message });

  const model = lang === "de" ? MODEL_DE : MODEL_FAST;
  const url = AI_API_URL.replace(/\/$/, "") + AI_PATH;

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 55000);
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
      res.status(502).json({ error: "upstream_error", status: upstream.status });
      return;
    }
    const data = await upstream.json();
    const choice = data.choices && data.choices.at(0);
    const reply = (choice && choice.message && choice.message.content) || data.reply || data.content || "";
    if (!reply) { res.status(502).json({ error: "empty_reply" }); return; }
    res.status(200).json({ reply: String(reply).trim(), model });
  } catch (err) {
    console.error("Proxy error:", err && err.message);
    res.status(502).json({ error: "proxy_failed" });
  }
};
