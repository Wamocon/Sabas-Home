/* Sabaş Home — self-recording pitch walkthrough harness (Scene 2).
 * puppeteer-core + locally installed Chrome. Modes:
 *   (default/--draft)  headless, screenshot at every cue + timing log   [Phase 2 gate]
 *   --capture          headed kiosk, tab records itself -> raw.webm      [Phase 3/4]
 *   --mobile           chromeless phone-size window (draft or capture)
 * Absolute clock (untilT against fixed t0); all motion is time-based. */
import puppeteer from "puppeteer-core";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const DIR = path.dirname(fileURLToPath(import.meta.url));
const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const CUES = JSON.parse(fs.readFileSync(path.join(DIR, "cues.json"), "utf8"));
const A = process.argv.slice(2);
const MODE = A.includes("--capture") ? "capture" : "draft";
const MOBILE = A.includes("--mobile");
const SMOKE = A.includes("--smoke");
const list = (MOBILE ? CUES.mobile : CUES.cues).slice(0, SMOKE ? 2 : 999);
const W = MOBILE ? 390 : CUES.meta.width;
const H = MOBILE ? 844 : CUES.meta.height;
const URL = CUES.meta.url;
const OUT = path.join(DIR, MOBILE ? "draft-mobile" : "draft");
if (MODE === "draft") fs.mkdirSync(OUT, { recursive: true });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Injected before any page script: force TR, kill scrollbars/OS+site cursor/spellcheck,
// flatten backdrop-filter (drops out of tab capture), and add a brand cursor.
function initScript(mobile) {
  try { localStorage.setItem("sabas-lang", "tr"); } catch (e) {}
  const add = () => {
    const s = document.createElement("style");
    s.textContent =
      "*{cursor:none !important}::-webkit-scrollbar{width:0 !important;height:0 !important}" +
      "html{scrollbar-width:none}" +
      ".site-header,.lang-menu,.chat-panel,.hs-chip,.concierge-card{backdrop-filter:none !important;-webkit-backdrop-filter:none !important}" +
      ".site-header:not(.scrolled){background:rgba(20,15,10,0.55) !important}" +
      "#__cur{position:fixed;left:0;top:0;z-index:2147483647;pointer-events:none;transform:translate(-100px,-100px)}" +
      "#__cur .dot{position:absolute;left:-5px;top:-5px;width:10px;height:10px;border-radius:50%;background:#f4c56b;box-shadow:0 0 12px rgba(224,138,60,.9)}" +
      "#__cur .ring{position:absolute;left:-17px;top:-17px;width:34px;height:34px;border-radius:50%;border:2px solid rgba(224,138,60,.55);transition:transform .18s ease,opacity .3s}" +
      "#__cur.tap .ring{transform:scale(.6);opacity:.4}";
    document.documentElement.appendChild(s);
    document.querySelectorAll("input,textarea").forEach((el) => el.setAttribute("spellcheck", "false"));
    if (!mobile) {
      const c = document.createElement("div"); c.id = "__cur";
      c.innerHTML = '<div class="ring"></div><div class="dot"></div>';
      (document.body || document.documentElement).appendChild(c);
      window.__cur = (x, y) => { const e = document.getElementById("__cur"); if (e) e.style.transform = "translate(" + x + "px," + y + "px)"; };
      window.__tap = () => { const e = document.getElementById("__cur"); if (!e) return; e.classList.add("tap"); setTimeout(() => e.classList.remove("tap"), 220); };
    }
  };
  if (document.body) add(); else document.addEventListener("DOMContentLoaded", add);
}

async function main() {
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: MODE === "draft" ? "new" : false,
    defaultViewport: MODE === "draft" ? { width: W, height: H, deviceScaleFactor: MOBILE ? 2 : 1 } : null,
    args: [
      "--no-sandbox", "--disable-backgrounding-occluded-windows", "--disable-renderer-backgrounding",
      "--hide-scrollbars", "--autoplay-policy=no-user-gesture-required",
      ...(MODE === "capture" ? [
        "--auto-accept-this-tab-capture", "--force-device-scale-factor=1",
        "--window-position=0,0", `--window-size=${W + 16},${H + 92}`, `--app=${URL}`,
      ] : []),
    ],
  });
  const closeAll = async () => { try { await browser.close(); } catch (e) {} };
  process.on("uncaughtException", async (e) => { console.error("FATAL", e); await closeAll(); process.exit(1); });
  process.on("unhandledRejection", async (e) => { console.error("REJECT", e); await closeAll(); process.exit(1); });

  const page = (await browser.pages())[0] || (await browser.newPage());
  await page.evaluateOnNewDocument(initScript, MOBILE);
  await page.goto(URL, { waitUntil: "networkidle2", timeout: 60000 });
  // wait for site JS + fonts + first paint settle
  await page.evaluate(async () => {
    if (document.fonts && document.fonts.ready) await document.fonts.ready;
    const t = Date.now(); while (!window.__lenis && Date.now() - t < 4000) await new Promise((r) => setTimeout(r, 100));
  });
  await sleep(1200);

  // ---- page-side time-based helpers (installed once) ----
  await page.evaluate(() => {
    const easeInOut = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
    window.__scrollTo = (y, dur) => new Promise((res) => {
      let done = false; const fin = () => { if (!done) { done = true; res(); } };
      if (window.__lenis) { window.__lenis.scrollTo(y, { duration: dur, easing: easeInOut, onComplete: fin }); setTimeout(fin, dur * 1000 + 250); return; }
      const s0 = window.scrollY, d = y - s0, t0 = performance.now();
      (function step(now) {
        const p = Math.min((now - t0) / (dur * 1000), 1);
        window.scrollTo(0, s0 + d * easeInOut(p));
        if (p < 1) requestAnimationFrame(step); else fin();
      })(performance.now());
    });
    window.__moveCur = (x, y, dur) => new Promise((res) => {
      const c = document.getElementById("__cur");
      const m = (c && c.style.transform.match(/translate\(([-\d.]+)px,\s*([-\d.]+)px/));
      const x0 = m ? parseFloat(m[1]) : x, y0 = m ? parseFloat(m[2]) : y, t0 = performance.now();
      (function step(now) {
        const p = Math.min((now - t0) / (dur * 1000), 1), e = easeInOut(p);
        if (window.__cur) window.__cur(x0 + (x - x0) * e, y0 + (y - y0) * e);
        if (p < 1) requestAnimationFrame(step); else res();
      })(performance.now());
    });
    window.__centerOf = (sel) => { const el = document.querySelector(sel); if (!el) return null; const r = el.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2, top: r.top + window.scrollY }; };
    // ---- self-capture (tab records itself) ----
    window.__startRec = async () => {
      let stream;
      try { stream = await navigator.mediaDevices.getDisplayMedia({ preferCurrentTab: true, video: { frameRate: { ideal: 60, max: 60 }, width: 1920, height: 1080 } }); }
      catch (e) { return { ok: false, surface: "error", err: (e && e.name) + ": " + (e && e.message) }; }
      const track = stream.getVideoTracks().at(0);
      const surface = track.getSettings().displaySurface;
      if (surface && surface !== "browser") { stream.getTracks().forEach((t) => t.stop()); return { ok: false, surface }; }
      const mime = MediaRecorder.isTypeSupported("video/webm;codecs=vp9") ? "video/webm;codecs=vp9" : "video/webm";
      const rec = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: 33000000 });
      window.__chunks = []; rec.ondataavailable = (e) => { if (e.data && e.data.size) window.__chunks.push(e.data); };
      window.__rec = rec; window.__stream = stream; rec.start(1000);
      return { ok: true, surface, mime, at: performance.now() };
    };
    window.__stopRec = (name) => new Promise((res) => {
      const rec = window.__rec;
      rec.onstop = () => {
        const blob = new Blob(window.__chunks, { type: "video/webm" });
        const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click();
        window.__stream.getTracks().forEach((t) => t.stop());
        setTimeout(() => res({ size: blob.size }), 400);
      };
      rec.stop();
    });
  });

  let startClock = Date.now();
  const untilT = async (t) => { const target = startClock + t * 1000; const w = target - Date.now(); if (w > 0) await sleep(w); };
  const cur = async (sel, dur = 0.5) => {
    const c = await page.evaluate((s) => window.__centerOf(s), sel);
    if (c) await page.evaluate((x, y, d) => window.__moveCur(x, y, d), Math.max(20, Math.min(W - 20, c.x)), Math.max(20, Math.min(H - 20, c.y)), dur);
  };
  const scrollToSel = async (sel, dur, frac = 0.0, headroom = 90) => {
    const top = await page.evaluate((s) => { const e = document.querySelector(s); return e ? e.getBoundingClientRect().top + window.scrollY : null; }, sel);
    if (top == null) return;
    const oh = await page.evaluate((s) => { const e = document.querySelector(s); return e ? e.offsetHeight : 0; }, sel);
    await page.evaluate((y, d) => window.__scrollTo(y, d), Math.max(0, top - headroom + oh * frac), dur);
  };
  const tap = async (sel) => { await cur(sel, 0.4); await page.evaluate(() => window.__tap && window.__tap()); try { await page.click(sel); } catch (e) { try { await page.evaluate((s) => { const el = document.querySelector(s); el && el.click(); }, sel); } catch (e2) {} } };

  // ---- per-cue action dispatch (all bounded by the cue's slot) ----
  async function runAct(c) {
    const dur = c.dur;
    switch (c.act) {
      case "hold": await cur(c.sel, 0.7); break;
      case "sweep": await cur(".hero-trust .item:nth-child(1) b", 0.5); await sleep(400); await cur(".hero-trust .item:nth-child(3) b", 1.2); break;
      case "openLangMenu": await tap("#lang-toggle"); await sleep(1500); await cur("#lang-menu button:nth-child(3)", 0.6); await sleep(1200); await page.evaluate(() => document.getElementById("lang-switch").classList.remove("open")); break;
      case "scrollTo": await scrollToSel(c.sel, Math.min(1.6, dur * 0.7)); break;
      case "horizontalShowcase": await scrollToSel("#collections", 1.3); await sleep(300); await scrollToSel("#collections", dur - 2.0, 0.85); break;
      case "configurator": await scrollToSel("#showroom", 1.4); await sleep(500); for (const col of ["marble", "brass", "ceramic"]) { await tap(`#mat-list3 .mat-chip[data-color="${col === "marble" ? "d7cbb6" : col === "brass" ? "b8863f" : "2f6f7a"}"]`); await sleep(900); } break;
      case "brandTabs": await scrollToSel("#brands", 1.3); await sleep(400); await tap('.brand-tab[data-filter="furniture"]'); await sleep(1200); await tap('.brand-tab[data-filter="carpet"]'); break;
      case "storesReveal": await scrollToSel("#stores", 1.4); await sleep(600); await cur(".store-card:nth-child(1) .store-rating", 0.8); break;
      case "aiChat": await scrollToSel("#concierge", 1.2); await sleep(400); await tap("#fab-ai"); await sleep(1000); await page.type("#chat-text", "En yakın mağaza hangisi?", { delay: 55 }); await tap("#chat-send"); {
        const t = Date.now(); // wait until a bot answer bubble (not the greeting) appears, cap 9s
        while (Date.now() - t < 9000) { const n = await page.evaluate(() => document.querySelectorAll("#chat-log .chat-msg.bot").length); if (n >= 2) break; await sleep(300); }
        await page.evaluate(() => { const l = document.getElementById("chat-log"); if (l) l.scrollTop = l.scrollHeight; }); await sleep(600);
      } break;
      case "contactForm": await page.evaluate(() => { const b = document.getElementById("chat-close"); if (b) b.click(); }); await sleep(300); await scrollToSel("#contact", 1.3); await sleep(400); await cur("#f-name", 0.5); await page.type("#f-name", "Ahmet Demir", { delay: 60 }); await cur("#f-contact", 0.4); await page.type("#f-contact", "0552 591 07 94", { delay: 45 }); await cur('button[type="submit"]', 0.8); break;
      case "mobileScroll": await page.evaluate(() => window.__scrollTo(1400, 4)); break;
      case "mobileScroll2": await scrollToSel("#collections", 3); break;
      default: await scrollToSel(c.sel || "#home", 1.2);
    }
  }

  // ---- capture: start the tab self-recording (needs a user gesture) ----
  let recStart = 0, downloadDir = path.join(DIR, "raw");
  if (MODE === "capture") {
    fs.mkdirSync(downloadDir, { recursive: true });
    const client = await page.target().createCDPSession();
    await client.send("Browser.setDownloadBehavior", { behavior: "allow", downloadPath: downloadDir });
    await page.bringToFront();
    // lock the tab's inner viewport to exactly W x H (getDisplayMedia records the surface as-is)
    for (let i = 0; i < 6; i++) {
      const inner = await page.evaluate(() => ({ w: window.innerWidth, h: window.innerHeight }));
      if (inner.w === W && inner.h === H) break;
      const win = await client.send("Browser.getWindowForTarget");
      await client.send("Browser.setWindowBounds", { windowId: win.windowId, bounds: { left: 0, top: 0, width: win.bounds.width + (W - inner.w), height: win.bounds.height + (H - inner.h) } });
      await sleep(350);
    }
    const fi = await page.evaluate(() => ({ w: window.innerWidth, h: window.innerHeight }));
    console.log("viewport locked to", fi.w + "x" + fi.h, fi.w === W && fi.h === H ? "OK" : "(approx)");
    await page.evaluate(() => { window.scrollTo(0, 0); });
    await page.evaluate(() => { window.__recResult = null; const b = document.createElement("button"); b.id = "__gesture"; b.style.cssText = "position:fixed;inset:0;z-index:2147483646;opacity:0;cursor:none"; b.onclick = async () => { try { window.__recResult = await window.__startRec(); } catch (e) { window.__recResult = { ok: false, surface: "throw", err: String(e && e.message) }; } const el = document.getElementById("__gesture"); if (el) el.remove(); }; document.body.appendChild(b); });
    await page.click("#__gesture");
    let rr = null; const gt = Date.now();
    while (Date.now() - gt < 9000) { rr = await page.evaluate(() => window.__recResult); if (rr) break; await sleep(200); }
    if (!rr || !rr.ok) { console.error("ABORT getDisplayMedia:", JSON.stringify(rr)); await closeAll(); process.exit(1); }
    console.log("recording started:", rr.mime, "surface", rr.surface);
    recStart = Date.now();
    await sleep(400); // brief lead-in
  }

  startClock = Date.now(); // cue clock t0 (after recording has started, in capture mode)
  const log = [];
  for (const c of list) {
    await untilT(c.t);
    const fire = (Date.now() - startClock) / 1000;
    log.push({ id: c.id, planned: c.t, fired: +fire.toFixed(2), drift: +(fire - c.t).toFixed(2) });
    if (MODE === "draft") {
      // kick the action, wait a beat for it to visibly land, screenshot mid-cue
      runAct(c).catch(() => {});
      await sleep(Math.min(1600, c.dur * 500));
      await page.screenshot({ path: path.join(OUT, `cue${String(c.id).padStart(2, "0")}.png`) });
    } else {
      await runAct(c);
    }
  }
  // hold last frame to the SRT end
  const end = list.length ? list[list.length - 1].t + list[list.length - 1].dur : 0;
  await untilT(end);

  if (MODE === "capture") {
    const name = MOBILE ? "raw-mobile.webm" : "raw.webm";
    const r = await page.evaluate((n) => window.__stopRec(n), name);
    const trimOffset = (startClock - recStart) / 1000;
    const target = path.join(downloadDir, name);
    const safe = path.join(DIR, name); // copy out of the download dir before the browser closes
    let last = -1, stable = 0, ondisk = 0;
    for (let i = 0; i < 80; i++) {
      if (fs.existsSync(target) && !fs.existsSync(target + ".crdownload")) {
        const sz = fs.statSync(target).size;
        if (sz > 0 && sz === last) { if (++stable >= 3) { ondisk = sz; break; } } else stable = 0;
        last = sz;
      }
      await sleep(400);
    }
    if (ondisk > 0) fs.copyFileSync(target, safe);
    fs.writeFileSync(path.join(DIR, MOBILE ? "sidecar-mobile.json" : "sidecar.json"), JSON.stringify({ file: safe, trimOffset, blobSize: r.size, onDisk: ondisk, srtEnd: end }, null, 2));
    console.log("recorded blob", r.size, "on-disk", ondisk, "-> saved", safe, ondisk === r.size ? "SIZE OK" : "SIZE MISMATCH");
    await sleep(500);
  }

  console.log("CUE TIMING (planned -> fired, drift):");
  log.forEach((r) => console.log(`  cue${String(r.id).padStart(2, "0")}  ${r.planned.toFixed(1)}s -> ${r.fired.toFixed(2)}s  drift ${r.drift >= 0 ? "+" : ""}${r.drift}s  ${Math.abs(r.drift) <= 0.3 ? "OK" : "FAIL"}`));
  const worst = Math.max(...log.map((r) => Math.abs(r.drift)));
  console.log(`worst drift ${worst.toFixed(2)}s | slot end ${end.toFixed(1)}s | mode ${MODE}${MOBILE ? " mobile" : ""}`);
  fs.writeFileSync(path.join(DIR, MOBILE ? "cuelog-mobile.json" : "cuelog.json"), JSON.stringify(log, null, 2));
  await closeAll();
}
main().catch(async (e) => { console.error(e); process.exit(1); });
