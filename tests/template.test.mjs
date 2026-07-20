import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const workspace = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const api = require(join(workspace, "starter/assets/js/site.js"));
const config = require(join(workspace, "starter/assets/js/site-config.js"));

test("repository stays plain HTML/CSS/JS without package metadata", () => {
  assert.equal(existsSync(join(workspace, "package.json")), false);
  assert.ok(existsSync(join(workspace, "starter/index.html")));
  assert.ok(existsSync(join(workspace, "starter/assets/css/styles.css")));
  assert.ok(existsSync(join(workspace, "starter/assets/js/site.js")));
});

test("WhatsApp URL builder accepts verified E.164 digits and encodes content", () => {
  const url = api.buildWhatsAppUrl("+49 151 23456789", "Hello & welcome\nService: A/B");
  assert.equal(url, "https://wa.me/4915123456789?text=Hello%20%26%20welcome%0AService%3A%20A%2FB");
});

test("WhatsApp URL builder blocks tokens and invalid numbers", () => {
  assert.equal(api.buildWhatsAppUrl("[[WHATSAPP_E164]]", "Hello"), null);
  assert.equal(api.buildWhatsAppUrl("123", "Hello"), null);
});

test("enquiry validation covers empty, boundary, and valid partitions", () => {
  assert.deepEqual(Object.keys(api.validateEnquiry({}).errors).sort(), ["contact", "name", "service"]);
  assert.equal(api.validateEnquiry({ name: "A", contact: "1234", service: "" }).valid, false);
  assert.equal(api.validateEnquiry({ name: "Al", contact: "a@b.c", service: "Verified service" }).valid, true);
});

test("translation dictionaries have parity and non-empty values", () => {
  assert.equal(api.translationKeysMatch(config.translations), true);
  assert.ok(config.languages.length >= 1);
  assert.ok(config.languages.every((language) => config.translations[language.code]));
});

test("reduced-motion decision is deterministic", () => {
  assert.equal(api.shouldReduceMotion(true), true);
  assert.equal(api.shouldReduceMotion(false), false);
});

test("starter static validation passes", () => {
  const result = spawnSync(process.execPath, [join(workspace, "tests/validate-project.mjs"), "--mode=starter", "--root=starter"], { cwd: workspace, encoding: "utf8" });
  assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
  assert.match(result.stdout, /checks passed \(starter mode\)/);
});

test("untouched starter is intentionally blocked as a production release", () => {
  const result = spawnSync(process.execPath, [join(workspace, "tests/validate-project.mjs"), "--mode=release", "--root=starter"], { cwd: workspace, encoding: "utf8" });
  assert.notEqual(result.status, 0);
  assert.match(result.stdout, /FAIL RELEASE-TOKENS/);
  assert.match(result.stdout, /FAIL RELEASE-TEMPLATE-FLAG/);
});

test("project-owned skill has valid minimal frontmatter and UI metadata", () => {
  const skill = readFileSync(join(workspace, "skills/homepage-production/SKILL.md"), "utf8");
  const frontmatter = skill.match(/^---\s*\n([\s\S]*?)\n---/);
  assert.ok(frontmatter);
  const keys = [...frontmatter[1].matchAll(/^([a-z_]+):/gm)].map((match) => match[1]).sort();
  assert.deepEqual(keys, ["description", "name"]);
  assert.match(skill, /name: homepage-production/);
  const openaiYaml = readFileSync(join(workspace, "skills/homepage-production/agents/openai.yaml"), "utf8");
  assert.match(openaiYaml, /default_prompt: "Use \$homepage-production/);
});

test("roadmap seed preserves the required workbook schema", () => {
  const csv = readFileSync(join(workspace, "templates/roadmap.csv"), "utf8").trim().split(/\r?\n/);
  assert.equal(csv[0], "Priority,Action,Goal/KPI,Effort/time estimate,Status,Responsible");
});
