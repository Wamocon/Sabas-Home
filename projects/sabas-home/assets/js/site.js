/* Sabaş Home — behaviour: i18n, GSAP motion, WhatsApp handoff, map consent, AI chat.
   Content is usable before JavaScript; motion is transform/opacity only and respects
   prefers-reduced-motion. GSAP/ScrollTrigger enhance but are never required for content. */
(function attachSite(root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.HOMEPAGE_SITE = api;
  if (typeof document !== "undefined") {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", api.init);
    else api.init();
  }
})(typeof globalThis !== "undefined" ? globalThis : this, function createSite() {
  "use strict";

  const LANG_KEY = "sabas-lang";

  function buildWhatsAppUrl(number, message) {
    const digits = String(number || "").replace(/\D/g, "");
    if (digits.length < 8 || digits.length > 15 || /\[|\{|TOKEN|WHATSAPP/i.test(String(number || ""))) return null;
    return "https://wa.me/" + digits + "?text=" + encodeURIComponent(String(message || ""));
  }

  function validateEnquiry(values) {
    const data = values || {};
    const errors = {};
    if (String(data.name || "").trim().length < 2) errors.name = "name";
    const contact = String(data.contact || "");
    if (!(/@/.test(contact) || contact.replace(/\D/g, "").length >= 7)) errors.contact = "contact";
    if (!String(data.interest || "").trim()) errors.interest = "interest";
    return { valid: Object.keys(errors).length === 0, errors };
  }

  function translationKeysMatch(translations) {
    const sets = Object.values(translations || {}).map((entry) => Object.keys(entry).sort().join("|"));
    return sets.length > 0 && sets.every((set) => set === sets.at(0)) && Object.values(translations).every((entry) => Object.values(entry).every(Boolean));
  }

  function shouldReduceMotion(value) { return Boolean(value); }

  function init() {
    const config = (typeof window !== "undefined" && window.HOMEPAGE_CONFIG) || {};
    const T = config.translations || {};
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches || new URLSearchParams(location.search).has("nomotion");
    const finePointer = matchMedia("(hover: hover) and (pointer: fine)").matches;
    const gsap = window.gsap;
    document.documentElement.classList.add("motion-ready");

    let lang = pickInitialLanguage(config);
    const dict = () => T[lang] || T[config.defaultLanguage] || {};

    /* ---------- i18n ---------- */
    function pickInitialLanguage(cfg) {
      const codes = (cfg.languages || []).map((l) => l.code);
      const fromUrl = new URLSearchParams(location.search).get("lang");
      if (fromUrl && codes.includes(fromUrl)) return fromUrl;
      let stored = null;
      try { stored = localStorage.getItem(LANG_KEY); } catch (e) { stored = null; }
      if (stored && codes.includes(stored)) return stored;
      // Turkish is the primary language: it loads by default. Visitors can switch
      // (remembered via localStorage) or deep-link a language with ?lang=ru etc.
      return cfg.defaultLanguage || codes.at(0) || "tr";
    }

    function applyLanguage(next) {
      if (!T[next]) return;
      lang = next;
      const d = dict();
      document.documentElement.lang = next;
      try { localStorage.setItem(LANG_KEY, next); } catch (e) { /* storage may be blocked */ }

      document.querySelectorAll("[data-i18n]").forEach((el) => {
        const key = el.getAttribute("data-i18n");
        if (d[key] != null) el.textContent = d[key];
      });
      document.querySelectorAll("[data-i18n-aria]").forEach((el) => {
        const key = el.getAttribute("data-i18n-aria");
        if (d[key] != null) el.setAttribute("aria-label", d[key]);
      });

      const current = document.querySelector("#lang-current");
      if (current) current.textContent = next.toUpperCase();
      document.querySelectorAll("#lang-menu [data-lang]").forEach((btn) => {
        btn.setAttribute("aria-current", String(btn.getAttribute("data-lang") === next));
      });
      renderChatIntro();
    }

    /* language menu */
    const langSwitch = document.querySelector("#lang-switch");
    const langToggle = document.querySelector("#lang-toggle");
    const langMenu = document.querySelector("#lang-menu");
    if (langMenu && Array.isArray(config.languages)) {
      langMenu.innerHTML = "";
      config.languages.forEach((l) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.setAttribute("role", "menuitem");
        btn.setAttribute("data-lang", l.code);
        btn.innerHTML = '<span class="flag" aria-hidden="true">' + (l.flag || "") + "</span><span>" + l.label + "</span>";
        btn.addEventListener("click", () => { applyLanguage(l.code); closeLang(); langToggle && langToggle.focus(); });
        langMenu.appendChild(btn);
      });
    }
    function openLang() { langSwitch && langSwitch.classList.add("open"); langToggle && langToggle.setAttribute("aria-expanded", "true"); }
    function closeLang() { langSwitch && langSwitch.classList.remove("open"); langToggle && langToggle.setAttribute("aria-expanded", "false"); }
    if (langToggle) langToggle.addEventListener("click", () => { langSwitch.classList.contains("open") ? closeLang() : openLang(); });
    document.addEventListener("click", (e) => { if (langSwitch && !langSwitch.contains(e.target)) closeLang(); });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") { closeLang(); closeChat(); closeMobile(); } });

    /* ---------- Header / nav ---------- */
    const header = document.querySelector("#site-header");
    const progress = document.querySelector("#scroll-progress");
    let ticking = false;
    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        if (header) header.classList.toggle("scrolled", window.scrollY > 35);
        if (progress) {
          const h = document.documentElement.scrollHeight - window.innerHeight;
          progress.style.width = (h > 0 ? (window.scrollY / h) * 100 : 0) + "%";
        }
        ticking = false;
      });
    }
    addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    /* mobile menu */
    const burger = document.querySelector("#burger");
    const mobile = document.querySelector("#mobile-menu");
    function closeMobile() { if (mobile) { mobile.classList.remove("open"); document.body.classList.remove("menu-open"); burger && burger.setAttribute("aria-expanded", "false"); } }
    if (burger && mobile) {
      burger.addEventListener("click", () => {
        const open = mobile.classList.toggle("open");
        document.body.classList.toggle("menu-open", open);
        burger.setAttribute("aria-expanded", String(open));
      });
      mobile.querySelectorAll("a").forEach((a) => a.addEventListener("click", closeMobile));
    }

    /* active nav link via section observation */
    const navLinks = Array.from(document.querySelectorAll(".nav-links a"));
    const sections = navLinks.map((a) => document.querySelector(a.getAttribute("href"))).filter(Boolean);
    if (sections.length) {
      const spy = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            navLinks.forEach((a) => a.classList.toggle("is-active", a.getAttribute("href") === "#" + entry.target.id));
          }
        });
      }, { rootMargin: "-45% 0px -50% 0px" });
      sections.forEach((s) => spy.observe(s));
    }

    /* ---------- Reveal on scroll (baseline; works without GSAP) ---------- */
    const reveals = document.querySelectorAll(".reveal");
    if (reduce) {
      reveals.forEach((el) => el.classList.add("in"));
    } else {
      const io = new IntersectionObserver((entries) => {
        entries.forEach((entry, i) => {
          if (entry.isIntersecting) {
            const delay = Math.min(i * 60, 240);
            setTimeout(() => entry.target.classList.add("in"), delay);
            io.unobserve(entry.target);
          }
        });
      }, { threshold: 0.14, rootMargin: "0px 0px -8% 0px" });
      reveals.forEach((el) => io.observe(el));
    }

    /* ---------- GSAP enhancements ---------- */
    if (gsap && !reduce) {
      if (window.ScrollTrigger) gsap.registerPlugin(window.ScrollTrigger);

      // Hero entrance
      const heroLines = document.querySelectorAll(".hero h1 .line > span");
      if (heroLines.length) gsap.from(heroLines, { y: 40, opacity: 0, duration: 0.95, ease: "power3.out", stagger: 0.12, delay: 0.1 });
      gsap.from(".hero .lead, .hero-actions, .hero-trust", { y: 26, opacity: 0, duration: 0.9, ease: "power3.out", stagger: 0.1, delay: 0.5 });
      gsap.from(".hero-visual", { y: 40, opacity: 0, scale: 0.96, duration: 1.1, ease: "power3.out", delay: 0.3 });

      // Restrained parallax (scrub)
      if (window.ScrollTrigger) {
        document.querySelectorAll("[data-parallax]").forEach((el) => {
          const amount = parseFloat(el.getAttribute("data-parallax")) || 0.1;
          gsap.to(el, { yPercent: -amount * 100, ease: "none", scrollTrigger: { trigger: el.closest("section") || el, start: "top bottom", end: "bottom top", scrub: true } });
        });

        // Pinned horizontal "shop by room" scroller (desktop; reverts to native swipe below 900px)
        const hs = document.querySelector("#hscroll");
        const hsTrack = document.querySelector("#hscroll-track");
        const collections = document.querySelector("#collections");
        if (hs && hsTrack && collections && gsap.matchMedia) {
          const hsBar = document.querySelector("#hscroll-bar");
          const mm = gsap.matchMedia();
          mm.add("(min-width: 900px)", () => {
            collections.classList.add("collections-pin");
            const distance = () => Math.max(0, hsTrack.scrollWidth - window.innerWidth + 48);
            gsap.to(hsTrack, {
              x: () => -distance(),
              ease: "none",
              scrollTrigger: {
                trigger: hs, start: "top top", end: () => "+=" + distance(),
                pin: true, scrub: 1, anticipatePin: 1, invalidateOnRefresh: true,
                onUpdate: (self) => { if (hsBar) hsBar.style.transform = "scaleX(" + (1 + self.progress * 3.4) + ")"; }
              }
            });
            return () => { collections.classList.remove("collections-pin"); gsap.set(hsTrack, { clearProps: "transform" }); };
          });
        }
      }
    }

    /* ---------- Smooth scrolling (Lenis) synced with GSAP ScrollTrigger ---------- */
    let lenis = null;
    if (window.Lenis && !reduce) {
      // lerp-based: interpolates toward the target every animation frame, so it runs at the
      // display's refresh rate (60/120/144Hz) and tracks the wheel tightly = snappy + smooth.
      lenis = new window.Lenis({ lerp: 0.12, wheelMultiplier: 1, smoothWheel: true, syncTouch: true, touchMultiplier: 1.7 });
      if (gsap && gsap.ticker) {
        lenis.on("scroll", () => { if (window.ScrollTrigger) window.ScrollTrigger.update(); });
        gsap.ticker.add((time) => lenis.raf(time * 1000));
        gsap.ticker.lagSmoothing(0);
      } else {
        const loop = (t) => { lenis.raf(t); requestAnimationFrame(loop); };
        requestAnimationFrame(loop);
      }
      window.__lenis = lenis; // exposed for the recording harness (smooth programmatic scroll)
    }

    /* ---------- Smooth in-page navigation ---------- */
    document.querySelectorAll('a[href^="#"]').forEach((link) => {
      link.addEventListener("click", (e) => {
        const href = link.getAttribute("href");
        if (!href || href.length < 2) return;
        const target = document.querySelector(href);
        if (!target) return;
        e.preventDefault();
        if (lenis) lenis.scrollTo(target, { offset: -68 });
        else target.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
        if (mobile && mobile.classList.contains("open")) closeMobile();
        if (typeof history !== "undefined" && history.replaceState) history.replaceState(null, "", href);
      });
    });

    /* ---------- Marquee ---------- */
    const track = document.querySelector("#marquee-track");
    let marqueeTween = null;
    if (track && gsap && !reduce) {
      marqueeTween = gsap.to(track, { xPercent: -50, duration: 22, ease: "none", repeat: -1 });
    }

    /* ---------- Magnetic buttons (fine pointer only) ---------- */
    if (finePointer && gsap && !reduce) {
      document.querySelectorAll('[data-motion-id="magnetic-button"] .btn').forEach((btn) => {
        let raf = 0;
        btn.addEventListener("pointermove", (e) => {
          const r = btn.getBoundingClientRect();
          const x = e.clientX - r.left - r.width / 2;
          const y = e.clientY - r.top - r.height / 2;
          if (raf) cancelAnimationFrame(raf);
          raf = requestAnimationFrame(() => gsap.to(btn, { x: x * 0.28, y: y * 0.28, duration: 0.4, ease: "power3.out" }));
        });
        btn.addEventListener("pointerleave", () => gsap.to(btn, { x: 0, y: 0, duration: 0.5, ease: "elastic.out(1,0.4)" }));
      });
    }

    /* ---------- Hero: spotlight + cursor-reactive depth parallax (native cursor kept) ---------- */
    const hero = document.querySelector(".hero");
    const spotlight = document.querySelector("#hero-spotlight");
    if (hero && finePointer && !reduce) {
      const layers = (gsap ? [
        { sel: ".hs-main", depth: 9 }, { sel: ".hs-a", depth: 26 }, { sel: ".hs-b", depth: 19 }, { sel: ".hs-ring", depth: 13 }, { sel: ".hs-chip", depth: 30 }
      ] : []).map((l) => {
        const node = document.querySelector(l.sel);
        return node ? { depth: l.depth, mx: gsap.quickTo(node, "x", { duration: 0.7, ease: "power3" }), my: gsap.quickTo(node, "y", { duration: 0.7, ease: "power3" }) } : null;
      }).filter(Boolean);
      let hRaf = 0;
      hero.addEventListener("pointermove", (e) => {
        const r = hero.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top) / r.height;
        if (hRaf) cancelAnimationFrame(hRaf);
        hRaf = requestAnimationFrame(() => {
          if (spotlight) { spotlight.style.setProperty("--mx", (px * 100) + "%"); spotlight.style.setProperty("--my", (py * 100) + "%"); }
          layers.forEach((l) => { l.mx(-(px - 0.5) * l.depth); l.my(-(py - 0.5) * l.depth); });
        });
      });
      hero.addEventListener("pointerleave", () => layers.forEach((l) => { l.mx(0); l.my(0); }));
    }

    /* ---------- Brand filter ---------- */
    const brandTabs = document.querySelectorAll(".brand-tab");
    const brandCells = document.querySelectorAll(".brand-cell");
    function filterBrands(cat) {
      brandCells.forEach((cell) => {
        const show = cell.getAttribute("data-cat") === cat;
        cell.hidden = !show;
      });
      if (gsap && !reduce) gsap.fromTo(".brand-cell:not([hidden])", { y: 14, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: "power2.out", stagger: 0.03 });
    }
    brandTabs.forEach((tab) => tab.addEventListener("click", () => {
      brandTabs.forEach((t) => { t.classList.remove("active"); t.setAttribute("aria-selected", "false"); });
      tab.classList.add("active"); tab.setAttribute("aria-selected", "true");
      filterBrands(tab.getAttribute("data-filter"));
    }));
    if (brandTabs.length) filterBrands(brandTabs.item(0).getAttribute("data-filter"));

    /* ---------- Store maps: auto-load real Google map when in view ---------- */
    function loadMap(media) {
      const card = media.closest(".store-card");
      if (!card || media.dataset.loaded) return;
      const src = card.getAttribute("data-embed");
      if (!src) return;
      media.dataset.loaded = "1";
      media.innerHTML = '<span class="map-spinner" aria-hidden="true"><i></i></span>';
      const frame = document.createElement("iframe");
      frame.loading = "lazy";
      frame.title = "Google map";
      frame.setAttribute("referrerpolicy", "no-referrer-when-downgrade");
      frame.setAttribute("allowfullscreen", "");
      frame.addEventListener("load", () => requestAnimationFrame(() => frame.classList.add("in")));
      frame.src = src;
      media.appendChild(frame);
    }
    const mediaEls = document.querySelectorAll(".store-media");
    if ("IntersectionObserver" in window) {
      const mapIo = new IntersectionObserver((entries) => {
        entries.forEach((entry) => { if (entry.isIntersecting) { loadMap(entry.target); mapIo.unobserve(entry.target); } });
      }, { rootMargin: "300px 0px" });
      mediaEls.forEach((m) => mapIo.observe(m));
    } else {
      mediaEls.forEach(loadMap);
    }
    // clicking the fallback prompt loads immediately
    document.querySelectorAll(".store-map-consent").forEach((btn) => btn.addEventListener("click", () => loadMap(btn.closest(".store-media"))));

    /* ---------- Animated number counters ---------- */
    function animateCount(el) {
      const raw = el.textContent.trim();
      const m = raw.match(/^(\d+)(.*)$/);
      if (!m) return;
      const target = parseInt(m.at(1), 10);
      const suffix = m.at(2) || "";
      if (reduce || !target) { el.textContent = raw; return; }
      const dur = 1100; const start = performance.now();
      function step(now) {
        const p = Math.min((now - start) / dur, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(eased * target) + suffix;
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    }
    const counters = document.querySelectorAll(".hero-trust .item b, .mini-stats b, .mat-spec b");
    if ("IntersectionObserver" in window && !reduce) {
      const cIo = new IntersectionObserver((entries) => {
        entries.forEach((entry) => { if (entry.isIntersecting) { animateCount(entry.target); cIo.unobserve(entry.target); } });
      }, { threshold: 0.6 });
      counters.forEach((c) => cIo.observe(c));
    }

    /* ---------- Enquiry -> WhatsApp ---------- */
    const form = document.querySelector("#enquiry-form");
    if (form) form.addEventListener("submit", (event) => {
      event.preventDefault();
      const d = dict();
      const values = {
        name: (document.querySelector("#f-name").value || "").trim(),
        contact: (document.querySelector("#f-contact").value || "").trim(),
        interest: document.querySelector("#f-interest").value || "",
        message: (document.querySelector("#f-message").value || "").trim()
      };
      const result = validateEnquiry(values);
      const errBox = document.querySelector("#form-error");
      if (!result.valid) {
        const first = Object.keys(result.errors).at(0);
        const map = { name: "errName", contact: "errContact", interest: "errInterest" };
        if (errBox) errBox.textContent = d[map[first]] || "Please complete the form.";
        const field = document.querySelector("#f-" + (first === "interest" ? "interest" : first));
        field && field.focus();
        return;
      }
      if (errBox) errBox.textContent = "";
      const lines = [
        d.waGreeting || "Hello Sabaş Home.",
        (d.fName || "Name") + ": " + values.name,
        (d.fContact || "Contact") + ": " + values.contact,
        (d.fInterest || "Interest") + ": " + values.interest
      ];
      if (values.message) lines.push((d.fMessage || "Message") + ": " + values.message);
      const url = buildWhatsAppUrl(config.whatsappNumber, lines.join("\n"));
      if (!url) { if (errBox) errBox.textContent = d.chatError || "Please contact us on WhatsApp."; return; }
      window.open(url, "_blank", "noopener,noreferrer");
    });

    /* ---------- AI chat ---------- */
    const chatPanel = document.querySelector("#chat-panel");
    const chatLog = document.querySelector("#chat-log");
    const chatQuick = document.querySelector("#chat-quick");
    const chatForm = document.querySelector("#chat-form");
    const chatText = document.querySelector("#chat-text");
    const fabAi = document.querySelector("#fab-ai");
    let chatStarted = false;
    const history = [];

    function openChat() {
      if (!chatPanel) return;
      chatPanel.classList.add("open");
      chatPanel.setAttribute("aria-hidden", "false");
      fabAi && fabAi.setAttribute("aria-expanded", "true");
      if (!chatStarted) { chatStarted = true; renderChatIntro(); }
      setTimeout(() => chatText && chatText.focus(), 200);
    }
    function closeChat() {
      if (!chatPanel) return;
      chatPanel.classList.remove("open");
      chatPanel.setAttribute("aria-hidden", "true");
      fabAi && fabAi.setAttribute("aria-expanded", "false");
    }
    function escHtml(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
    function formatBot(text) {
      let s = escHtml(text).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
      return s.split("\n").map((line) => {
        const m = line.match(/^\s*[\*\-]\s+(.*)$/);
        return m ? ("&bull;&nbsp;" + m.at(1)) : line;
      }).join("<br>");
    }
    function appendMsg(text, who) {
      const div = document.createElement("div");
      div.className = "chat-msg " + who;
      if (who === "bot") div.innerHTML = formatBot(text);
      else div.textContent = text;
      chatLog.appendChild(div);
      chatLog.scrollTop = chatLog.scrollHeight;
      return div;
    }
    function renderChatIntro() {
      if (!chatStarted || !chatLog) return;
      const d = dict();
      chatLog.innerHTML = "";
      history.length = 0;
      appendMsg(d.chatGreeting || "Hello!", "bot");
      if (chatQuick) {
        chatQuick.innerHTML = "";
        ["chatQ1", "chatQ2", "chatQ3"].forEach((k) => {
          if (!d[k]) return;
          const b = document.createElement("button");
          b.type = "button";
          b.textContent = d[k];
          b.addEventListener("click", () => sendChat(d[k]));
          chatQuick.appendChild(b);
        });
      }
    }
    async function sendChat(text) {
      const d = dict();
      if (!text || !text.trim()) return;
      appendMsg(text.trim(), "user");
      history.push({ role: "user", content: text.trim() });
      const typing = document.createElement("div");
      typing.className = "chat-msg bot";
      typing.innerHTML = '<span class="chat-typing"><i></i><i></i><i></i></span>';
      chatLog.appendChild(typing);
      chatLog.scrollTop = chatLog.scrollHeight;
      try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 30000);
        const res = await fetch(config.aiEndpoint || "/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: text.trim(), history: history.slice(-8), lang }),
          signal: controller.signal
        });
        clearTimeout(timer);
        if (!res.ok) throw new Error("bad status " + res.status);
        const data = await res.json();
        const top = data.choices && data.choices.at(0);
        const reply = data.reply || (top && top.message && top.message.content) || "";
        typing.remove();
        if (reply) { appendMsg(reply, "bot"); history.push({ role: "assistant", content: reply }); }
        else throw new Error("empty reply");
      } catch (err) {
        typing.remove();
        const note = appendMsg(d.chatOffline || "The assistant is offline. Please reach us on WhatsApp.", "bot");
        note.classList.add("note");
        const wa = document.createElement("a");
        wa.className = "btn btn-whatsapp";
        wa.style.marginTop = "6px";
        wa.href = buildWhatsAppUrl(config.whatsappNumber, d.waGreeting || "Hello Sabaş Home.") || "#contact";
        wa.target = "_blank"; wa.rel = "noopener noreferrer";
        wa.textContent = "WhatsApp";
        chatLog.appendChild(wa);
        chatLog.scrollTop = chatLog.scrollHeight;
      }
    }
    if (fabAi) fabAi.addEventListener("click", () => { chatPanel.classList.contains("open") ? closeChat() : openChat(); });
    const conciergeOpen = document.querySelector("#concierge-open");
    if (conciergeOpen) conciergeOpen.addEventListener("click", openChat);
    const chatClose = document.querySelector("#chat-close");
    if (chatClose) chatClose.addEventListener("click", () => { closeChat(); fabAi && fabAi.focus(); });
    if (chatForm) chatForm.addEventListener("submit", (e) => { e.preventDefault(); const v = chatText.value; chatText.value = ""; sendChat(v); });

    /* ---------- Visibility: pause continuous work when hidden ---------- */
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        if (marqueeTween) marqueeTween.pause();
        if (window.gsap && window.gsap.ticker) window.gsap.ticker.sleep && window.gsap.ticker.sleep();
      } else {
        if (marqueeTween) marqueeTween.resume();
        if (window.gsap && window.gsap.ticker && window.gsap.ticker.wake) window.gsap.ticker.wake();
        onScroll();
      }
    });

    /* ---------- Optional width diagnostic (?debug) ---------- */
    if (new URLSearchParams(location.search).has("debug")) {
      const dbg = document.createElement("div");
      dbg.style.cssText = "position:fixed;top:0;left:0;z-index:99999;background:#000;color:#5f5;font:13px monospace;padding:5px 8px;pointer-events:none";
      const upd = () => { dbg.textContent = "sw:" + document.documentElement.scrollWidth + " iw:" + window.innerWidth + " gsap:" + (window.gsap ? "Y" : "N") + " lenis:" + (window.Lenis ? "Y" : "N") + " on:" + (lenis ? "Y" : "N") + " ST:" + (window.ScrollTrigger ? "Y" : "N"); };
      upd(); addEventListener("resize", () => requestAnimationFrame(upd)); document.body.appendChild(dbg);
    }

    /* ---------- Footer year + first paint ---------- */
    const yearEl = document.querySelector("#year");
    if (yearEl) yearEl.textContent = String(new Date().getFullYear());

    applyLanguage(lang);

    /* ---------- Scramble-decode eyebrow labels on scroll-in ---------- */
    if (gsap && !reduce && window.ScrambleTextPlugin) {
      gsap.registerPlugin(window.ScrambleTextPlugin);
      document.querySelectorAll(".eyebrow").forEach((el) => {
        const finalText = el.textContent;
        if (!finalText || finalText.length > 64) return;
        const run = () => gsap.to(el, { duration: 1.0, ease: "none", scrambleText: { text: finalText, chars: "upperAndLowerCase", speed: 0.55, revealDelay: 0.2 } });
        if (window.ScrollTrigger) window.ScrollTrigger.create({ trigger: el, start: "top 92%", once: true, onEnter: run });
        else run();
      });
    }
  }

  return { buildWhatsAppUrl, validateEnquiry, translationKeysMatch, shouldReduceMotion, init };
});
