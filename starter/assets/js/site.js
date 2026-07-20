(function attachSite(root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.HOMEPAGE_SITE = api;
  if (typeof document !== "undefined") api.init();
})(typeof globalThis !== "undefined" ? globalThis : this, function createSite() {
  "use strict";

  function buildWhatsAppUrl(number, message) {
    const digits = String(number || "").replace(/\D/g, "");
    if (digits.length < 8 || digits.length > 15 || /\[|\{|TOKEN|WHATSAPP/i.test(String(number || ""))) return null;
    return `https://wa.me/${digits}?text=${encodeURIComponent(String(message || ""))}`;
  }

  function validateEnquiry(values) {
    const data = values || {};
    const errors = {};
    if (String(data.name || "").trim().length < 2) errors.name = "Enter at least two characters.";
    if (!(/@/.test(String(data.contact || "")) || String(data.contact || "").replace(/\D/g, "").length >= 7)) errors.contact = "Enter a usable contact.";
    if (!String(data.service || "").trim()) errors.service = "Choose a service.";
    return { valid: Object.keys(errors).length === 0, errors };
  }

  function translationKeysMatch(translations) {
    const sets = Object.values(translations || {}).map((entry) => Object.keys(entry).sort().join("|"));
    return sets.length > 0 && sets.every((set) => set === sets[0]) && Object.values(translations).every((entry) => Object.values(entry).every(Boolean));
  }

  function shouldReduceMotion(value) { return Boolean(value); }

  function init() {
    const config = window.HOMEPAGE_CONFIG || {};
    const header = document.querySelector("#header");
    const burger = document.querySelector(".burger");
    const menu = document.querySelector("#mobile-menu");
    const form = document.querySelector("#booking-form");
    const reduce = shouldReduceMotion(matchMedia("(prefers-reduced-motion: reduce)").matches);
    const finePointer = matchMedia("(hover: hover) and (pointer: fine)").matches;
    document.documentElement.classList.add("motion-ready");

    addEventListener("load", () => setTimeout(() => document.body.classList.add("ready"), reduce ? 0 : 700));
    setTimeout(() => document.body.classList.add("ready"), 2200);
    document.querySelector("#year").textContent = new Date().getFullYear();

    const onScroll = () => requestAnimationFrame(() => header.classList.toggle("scrolled", scrollY > 35));
    addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("visibilitychange", () => { if (!document.hidden) onScroll(); });

    if (burger && menu) {
      burger.addEventListener("click", () => {
        const open = menu.classList.toggle("open");
        burger.setAttribute("aria-expanded", String(open));
        document.body.classList.toggle("menu-open", open);
      });
      menu.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => {
        menu.classList.remove("open"); document.body.classList.remove("menu-open"); burger.setAttribute("aria-expanded", "false");
      }));
    }

    if (reduce) document.querySelectorAll(".reveal").forEach((el) => el.classList.add("in"));
    else {
      const observer = new IntersectionObserver((entries) => entries.forEach((entry) => {
        if (entry.isIntersecting) { entry.target.classList.add("in"); observer.unobserve(entry.target); }
      }), { threshold: .12 });
      document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
    }

    if (finePointer) document.querySelectorAll(".lookbook figure").forEach((figure) => figure.addEventListener("pointermove", () => requestAnimationFrame(() => figure.dataset.hover = "true")));

    if (form) form.addEventListener("submit", (event) => {
      event.preventDefault();
      const service = document.querySelector("#service").value;
      const date = document.querySelector("#date").value;
      const time = document.querySelector("#time").value;
      const name = document.querySelector("#name").value.trim();
      const note = document.querySelector("#note").value.trim();
      const error = document.querySelector("#form-error");
      if (!service || !date || !time || name.length < 2) { error.textContent = "Complete the required service, date, time and name fields."; return; }
      const message = `Appointment request\nName: ${name}\nService: ${service}\nDate: ${date}\nTime: ${time}${note ? `\nNote: ${note}` : ""}`;
      const url = buildWhatsAppUrl(config.whatsappNumber, message);
      if (!url) { error.textContent = "Template mode: add the verified WhatsApp number before release."; return; }
      error.textContent = "";
      window.open(url, "_blank", "noopener,noreferrer");
    });
  }

  return { buildWhatsAppUrl, validateEnquiry, translationKeysMatch, shouldReduceMotion, init };
});
