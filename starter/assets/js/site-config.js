(function attachConfig(root, factory) {
  const config = factory();
  if (typeof module === "object" && module.exports) module.exports = config;
  if (root) root.HOMEPAGE_CONFIG = config;
})(typeof globalThis !== "undefined" ? globalThis : this, function createConfig() {
  "use strict";

  return {
    templateMode: true,
    defaultLanguage: "en",
    whatsappNumber: "[[WHATSAPP_E164]]",
    clientName: "[[CLIENT_NAME]]",
    languages: [
      { code: "en", label: "English" },
      { code: "de", label: "Deutsch" }
    ],
    translations: {
      en: {
        skip: "Skip to content",
        menuOpen: "Open menu",
        menuClose: "Close menu",
        language: "Language",
        navServices: "Services",
        navApproach: "Why this business",
        navProcess: "Process",
        navContact: "Contact",
        ctaPrimary: "Start an enquiry",
        ctaSecondary: "Explore services",
        servicesTitle: "A clear offer, organised around customer needs",
        servicesIntro: "Replace these rows with the verified service portfolio and approved use cases.",
        approachTitle: "Turn verified strengths into a reason to choose",
        processTitle: "Make the next step easy to understand",
        trustTitle: "Use evidence, not marketing filler",
        contactTitle: "Give visitors one dependable next step",
        contactIntro: "This starter prepares an enquiry for WhatsApp. It never claims a message was sent.",
        formName: "Name",
        formContact: "Phone or email",
        formService: "Service of interest",
        formMessage: "Message",
        formChoose: "Choose a verified service",
        formSubmit: "Prepare WhatsApp enquiry",
        formContinue: "Continue to WhatsApp",
        formErrorName: "Enter at least two characters.",
        formErrorContact: "Enter a usable phone number or email.",
        formErrorService: "Choose a service.",
        formReady: "The enquiry is ready. Review it before opening WhatsApp.",
        formNotConfigured: "Template mode: add the verified WhatsApp number before this handoff can open.",
        legalImprint: "Imprint",
        legalPrivacy: "Privacy",
        templateStatus: "Template mode — publishing is blocked until every token is verified and replaced."
      },
      de: {
        skip: "Zum Inhalt springen",
        menuOpen: "Menü öffnen",
        menuClose: "Menü schließen",
        language: "Sprache",
        navServices: "Leistungen",
        navApproach: "Warum dieses Unternehmen",
        navProcess: "Ablauf",
        navContact: "Kontakt",
        ctaPrimary: "Anfrage beginnen",
        ctaSecondary: "Leistungen ansehen",
        servicesTitle: "Ein klares Angebot, gegliedert nach Kundenbedürfnissen",
        servicesIntro: "Ersetzen Sie diese Zeilen durch das verifizierte Leistungsportfolio und freigegebene Anwendungsfälle.",
        approachTitle: "Verifizierte Stärken werden zum nachvollziehbaren Auswahlgrund",
        processTitle: "Der nächste Schritt muss sofort verständlich sein",
        trustTitle: "Belege statt austauschbarer Werbeaussagen",
        contactTitle: "Ein verlässlicher nächster Schritt für Interessenten",
        contactIntro: "Diese Vorlage bereitet eine WhatsApp-Anfrage vor. Sie behauptet niemals, dass eine Nachricht versendet wurde.",
        formName: "Name",
        formContact: "Telefon oder E-Mail-Adresse",
        formService: "Gewünschte Leistung",
        formMessage: "Nachricht",
        formChoose: "Verifizierte Leistung auswählen",
        formSubmit: "WhatsApp-Anfrage vorbereiten",
        formContinue: "Weiter zu WhatsApp",
        formErrorName: "Geben Sie mindestens zwei Zeichen ein.",
        formErrorContact: "Geben Sie eine nutzbare Telefonnummer oder E-Mail-Adresse ein.",
        formErrorService: "Wählen Sie eine Leistung aus.",
        formReady: "Die Anfrage ist vorbereitet. Prüfen Sie sie vor dem Öffnen von WhatsApp.",
        formNotConfigured: "Vorlagenmodus: Hinterlegen Sie zuerst die verifizierte WhatsApp-Nummer.",
        legalImprint: "Impressum",
        legalPrivacy: "Datenschutz",
        templateStatus: "Vorlagenmodus — die Veröffentlichung bleibt gesperrt, bis alle Platzhalter verifiziert und ersetzt sind."
      }
    }
  };
});
