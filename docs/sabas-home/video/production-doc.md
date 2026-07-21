# Sabaş Home — Pitch Video Production Doc

Produced end-to-end and self-verified per the WAMOCON master prompt.
Project: **Sabaş Home** · Live URL (local): `http://127.0.0.1:4180/?lang=tr`
VO language: **Turkish** (local business owner, non-technical) · Doc language: English.

## Deliverables (verified)

| File | Spec | Verified |
| --- | --- | --- |
| `scene2.mp4` | 1920×1080, **60/1 CFR**, H.264 crf18, **95.000 s** (5700 frames), no audio | ffprobe + full `-f null` decode clean; all 12 cues extracted & viewed at corrected timing |
| `mobile.mp4` _(deferred)_ | 1080×1920 portrait, 60/1 CFR, H.264, 12.0 s, no audio | **Not in this cut** — desktop-only for now; asset retained in scratchpad if wanted later |
| `scene2.srt` | 12 subtitles, generated from `cues.json` (single source of truth) | end = 95.0 s |
| `narration-tr.txt` | Text-only VO — **3 scenes, desktop-only** (no mobile scene); Scene 3 is one clean cut with no pricing line | — |
| `cues.json` | The one cue table driving both the SRT and `record.mjs` | — |
| `record.mjs` | Self-recording harness (puppeteer-core + local Chrome) | draft + smoke + full all passed |
| Raws (`raw.webm` ~594 MB, `raw-mobile.webm`) | VP9 33 Mbit/s, kept in scratchpad — **out of git** | — |

Only **Scene 2** is a screen recording. **Scene 1 & 3 are avatar scenes** (voiceover only) — no recording needed; generate them in the avatar tool.

## Sync instruction
`scene2.mp4` start = SRT `00:00:00` — lay the avatar/VO track for Scene 2 under it 1:1. Cue timing was verified at **worst drift 0.01 s** across all 12 cues, so the SRT lines land on the on-screen actions.

## Re-record commands
```
cd <scratchpad>/video
node record.mjs --draft            # headless, screenshots every cue + timing log (no window)
node record.mjs --capture --smoke  # 2-cue desktop smoke self-capture
node record.mjs --capture          # full desktop take -> raw.webm
node record.mjs --capture --mobile # mobile pickup -> raw-mobile.webm
# post (2 passes; trim offset + captured span from sidecar.json / probe):
#   1) ffmpeg -ss <trimOffset> -i raw.webm -vf "fps=60,scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2,setsar=1" -crf 18 -pix_fmt yuv420p -an tmp-cfr.mp4
#   2) ffmpeg -i tmp-cfr.mp4 -vf "setpts=(<SRTend>/<tmp-cfr dur>)*PTS,fps=60,setsar=1" -r 60 -an -t <SRTend> -crf 18 -pix_fmt yuv420p scene2.mp4
# NOTE: getDisplayMedia/MediaRecorder time-COMPRESSES under load (raw spans ~91 s of PTS for 95 s of on-screen action).
# Pass 2 time-STRETCHES the real content back to the SRT end so every cue lands on its planned time (do NOT tpad-freeze — that hides the drift).
```

## Section map (real scroll order · CSS selectors)
`#site-header` → `.hero#home` → `.trust-strip` → `.marquee` → `#about` → `#collections` (pinned horizontal "shop by room") → `#showroom` (3D configurator) → `#brands` → `.band` (parallax) → `#stores` (real Google maps) → `#concierge` (AI) → `#contact` → `.footer`. Floating: `#fab-ai`, WhatsApp FAB, `#chat-panel`.
Force-TR: `localStorage["sabas-lang"]="tr"` set via `evaluateOnNewDocument` before page scripts; default language is already Turkish.

## Fact table (narration claim → evidence) — ZERO fabrication
| Claim (TR) | Evidence |
| --- | --- |
| "20 yılı aşkın", "2005'ten bu yana" | Founded 2005 — sabashome.com about; `fact-ledger.md` ID-004 |
| "beş mağaza" | 5 stores — sabashome.com; ID-005 |
| "kırk bir marka" | 41 brands counted from brand grid; ID-025 |
| "dört dil (TR/EN/RU/DE)" | i18n dict, 140 keys × 4; site-config.js |
| "gerçek Google haritaları ve puanları" | real embeds + verified ratings Oba 4.5 / Gazipaşa 4.6 / Güllerpınarı 4.4 / Mahmutlar 4.6 / Alaiye new; ID-ST-1..5 |
| "otuz altı binden fazla yabancı" (Scene 1) | 36,465 foreign residents Alanya 2024; MKT-02 |
| "yapay zeka asistanı, sizin bilgilerinizle" | grounded proxy `server/ai-proxy.mjs`, live-tested; cue 10 shows a real answer listing the 5 actual stores + real WhatsApp (driven off-camera during setup, ~20 s latency, rendered with markdown-lite bold/bullets) |
| 3D sofa | labelled on-screen "Temsili 3D görselleştirme, belirli bir ürün değildir" (representative, CC0 model); MED-20 |
| Scene 3 pricing | **Omitted** in the client-facing cut — no invented prices; add a real offer line only once client-confirmed |
| ~~"teslim ve monte edilir" (delivery/install)~~ | **Removed from narration** (old cue 8) — delivery terms are BLOCKED in `fact-ledger.md`, not verified. ⚠️ The site's `.band` still asserts this in all 4 languages; confirm the service is real or soften the band copy |

## The 3-scene script
See `narration-tr.txt` for the clean VO. Scene 2 cue table (timestamp · TR · 🎬 screen · 🖱️ pointer) is `cues.json` / `scene2.srt`.
- **Scene 1** (avatar, ~40 s): hook (foreign homeowner + language barrier) → market numbers (36k residents, millions of tourists, rivals Turkish-only) → what was built (4-lang, AI, 3D) → handoff.
- **Scene 2** (screen, 95.0 s): 12 cues in exact scroll order, ending with a footer finale. (Desktop-only; mobile pickup deferred.)
- **Scene 3** (avatar, ~40 s): recap (everything real) → the sum on one page → next steps (approve + connect the domain) → CTA → brand line. **One clean cut, no pricing line.**

## Executability review (the gate)
Each cue's on-screen actions were summed (clicks ≥0.8 s, typing ~55 ms/char, smooth scrolls 1.2–1.6 s, AI latency measured live) and fit inside its slot with margin; the draft `--draft` run then confirmed **every cue fires within ±0.01 s** and each cue screenshot matched its expected state (hero, language menu open with 4 langs, About, horizontal scroller, 3D sofa + swatches, brand tabs, band, stores + maps, AI chat, filled form, footer).

## Fix-before-client
| Item | Status |
| --- | --- |
| Scene 3 pricing/offer | **Waiting for real pricing** — placeholder marker; never invent |
| Scene 1 & 3 avatar footage + Turkish voice | Human task (avatar tool + VO) |
| AI answer fully rendered in cue 10 | Chat opens + question sent + answer generating on camera; if you want the completed answer fully visible, raise the wait in `record.mjs` aiChat (currently caps at 9 s) |
| Legal imprint particulars on site | Still client-confirm (unrelated to video) |

## Remaining human tasks
1. Provide real offer/pricing for Scene 3 (or ship the no-pricing variant).
2. Generate Scene 1 & 3 avatar clips + Turkish voiceover; lay the Scene 2 VO under `scene2.mp4`.
3. Approve.
