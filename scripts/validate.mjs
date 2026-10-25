#!/usr/bin/env node
// Validarea „cu cod” a conținutului site-ului.
//
//   node scripts/validate.mjs                    → validează tot din content/
//   node scripts/validate.mjs --draft <fișier>   → validează un draft din drafts/
//   node scripts/validate.mjs --hook             → folosit de hook-ul Claude Code (citește stdin)
//
// Iese cu cod 0 dacă totul e în regulă. În modul --hook iese cu cod 2 la erori,
// ca Claude să primească mesajul și să repare.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Ajv from "ajv";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CONTENT = path.join(ROOT, "content");
const TODAY = new Date().toISOString().slice(0, 10);

const ajv = new Ajv({ allErrors: true, strict: false });
const repoSchema = readJson(path.join(CONTENT, "schema/repo.schema.json"));
const recipeSchema = readJson(path.join(CONTENT, "schema/recipe.schema.json"));
const checkRepo = ajv.compile(repoSchema);
const checkRecipe = ajv.compile(recipeSchema);

const SECRET_PATTERNS = [
  [/sk-ant-[A-Za-z0-9_-]{10,}/, "cheie API Anthropic"],
  [/\bsk-[A-Za-z0-9]{20,}/, "cheie API (sk-...)"],
  [/\bgh[pousr]_[A-Za-z0-9]{20,}/, "token GitHub"],
  [/\bAKIA[0-9A-Z]{16}\b/, "cheie AWS"],
  [/-----BEGIN [A-Z ]*PRIVATE KEY-----/, "cheie privată"],
  [/\bxox[baprs]-[A-Za-z0-9-]{10,}/, "token Slack"],
];

// ---------- utilitare ----------

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function tryReadJson(file, errors) {
  try {
    return readJson(file);
  } catch (e) {
    errors.push(`${rel(file)}: nu e JSON valid (${e.message})`);
    return null;
  }
}

function rel(file) {
  return path.relative(ROOT, file);
}

function wordCount(text) {
  return String(text ?? "").trim().split(/\s+/).filter(Boolean).length;
}

function nonEmpty(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function schemaErrors(validate, data, where) {
  if (validate(data)) return [];
  return validate.errors.map(
    (e) => `${where}: câmpul ${e.instancePath || "(rădăcină)"} ${e.message}`
  );
}

function scanSecrets(data, where) {
  const text = JSON.stringify(data);
  return SECRET_PATTERNS.filter(([re]) => re.test(text)).map(
    ([, label]) => `${where}: pare să conțină un secret (${label}). Folosește un placeholder.`
  );
}

function checkDates(data, where, fields) {
  const errors = [];
  for (const [label, value] of fields) {
    if (nonEmpty(value) && value > TODAY) {
      errors.push(`${where}: ${label} (${value}) este în viitor.`);
    }
  }
  return errors;
}

function checkPrices(replaces, where) {
  const errors = [];
  (replaces || []).forEach((r, i) => {
    const at = `${where}: replaces[${i}] (${r.service})`;
    if (r.price !== null && r.price !== undefined) {
      if (!nonEmpty(r.price_source_url)) errors.push(`${at}: prețul nu are price_source_url.`);
      if (!nonEmpty(r.price_checked_at)) errors.push(`${at}: prețul nu are price_checked_at.`);
    }
    if (!Array.isArray(r.what_you_lose) || r.what_you_lose.length === 0) {
      errors.push(`${at}: lipsește „what_you_lose” (orice comparație trebuie să spună ce pierzi).`);
    }
    errors.push(...checkDates(r, at, [["price_checked_at", r.price_checked_at]]));
  });
  return errors;
}

// ---------- reguli pentru un repo ----------

function validateRepo(data, where, { published }) {
  const errors = [...schemaErrors(checkRepo, data, where)];
  // Regulile de mai jos rulează și când schema are erori, ca toate problemele să apară deodată.
  data = {
    ...data,
    one_liner: data.one_liner ?? "",
    examples: Array.isArray(data.examples) ? data.examples : [],
    replaces: Array.isArray(data.replaces) ? data.replaces : [],
    tech_sheet: data.tech_sheet ?? {},
  };

  if (wordCount(data.one_liner) > 15) {
    errors.push(`${where}: one_liner are ${wordCount(data.one_liner)} cuvinte (maximum 15).`);
  }

  const verified = data.examples.filter((e) => e.status === "verificat");
  verified.forEach((e) => {
    if (!nonEmpty(e.real_output)) {
      errors.push(`${where}: exemplul „${e.title}” e marcat verificat, dar real_output e gol.`);
    }
  });
  data.examples
    .filter((e) => e.status !== "verificat")
    .forEach((e) => {
      if (!nonEmpty(e.failure_reason)) {
        errors.push(`${where}: exemplul „${e.title}” are status „${e.status}”, dar fără failure_reason.`);
      }
    });

  if (published && verified.length === 0) {
    errors.push(`${where}: niciun exemplu verificat. Nu se poate publica.`);
  }
  if (verified.length > 0 && !nonEmpty(data.tech_sheet.tested_commit_sha)) {
    errors.push(`${where}: tech_sheet.tested_commit_sha lipsește.`);
  }

  const complet = data.replaces.some((r) => r.replacement_level === "complet");
  if (complet && verified.length === 0) {
    errors.push(`${where}: replacement_level „complet” fără niciun exemplu verificat.`);
  }

  errors.push(...checkPrices(data.replaces, where));
  errors.push(...checkDates(data, where, [["verified_at", data.verified_at]]));
  errors.push(...scanSecrets(data, where));
  return errors;
}

// ---------- reguli pentru o rețetă ----------

function validateRecipe(data, where, { published, knownSlugs }) {
  const errors = [...schemaErrors(checkRecipe, data, where)];
  data = {
    ...data,
    one_liner: data.one_liner ?? "",
    steps: Array.isArray(data.steps) ? data.steps : [],
    replaces: Array.isArray(data.replaces) ? data.replaces : [],
  };

  if (wordCount(data.one_liner) > 15) {
    errors.push(`${where}: one_liner are ${wordCount(data.one_liner)} cuvinte (maximum 15).`);
  }
  if (data.status === "verificat") {
    data.steps.forEach((s, i) => {
      if (!nonEmpty(s.real_output)) errors.push(`${where}: pasul ${i + 1} nu are real_output.`);
    });
    if (!nonEmpty(data.final_result)) errors.push(`${where}: final_result e gol.`);
  } else if (!nonEmpty(data.failure_reason)) {
    errors.push(`${where}: status „${data.status}” fără failure_reason.`);
  }
  if (published && data.status !== "verificat") {
    errors.push(`${where}: doar rețetele verificate se publică.`);
  }
  if (knownSlugs) {
    data.steps.forEach((s, i) => {
      if (!knownSlugs.has(s.repo_slug)) {
        errors.push(`${where}: pasul ${i + 1} folosește repo-ul „${s.repo_slug}”, care nu e în catalog.`);
      }
    });
  }
  errors.push(...checkPrices(data.replaces, where));
  errors.push(...checkDates(data, where, [["verified_at", data.verified_at]]));
  errors.push(...scanSecrets(data, where));
  return errors;
}

// ---------- validarea întregului content/ ----------

function validateContent() {
  const errors = [];
  const lists = {};
  for (const name of ["index", "categories", "candidates", "gaps", "ideas", "recipes"]) {
    const file = path.join(CONTENT, `${name}.json`);
    if (!fs.existsSync(file)) {
      errors.push(`content/${name}.json lipsește.`);
      continue;
    }
    const data = tryReadJson(file, errors);
    if (data !== null && !Array.isArray(data)) errors.push(`content/${name}.json trebuie să fie o listă ([]).`);
    lists[name] = Array.isArray(data) ? data : [];
  }
  const categories = new Set(lists.categories || []);
  const index = lists.index || [];
  const indexSlugs = new Set(index.map((e) => e.slug));

  // repo-uri
  const repoDir = path.join(CONTENT, "repos");
  const repoFiles = fs.existsSync(repoDir) ? fs.readdirSync(repoDir).filter((f) => f.endsWith(".json")) : [];
  const repoSlugs = new Set();
  for (const f of repoFiles) {
    const file = path.join(repoDir, f);
    const where = rel(file);
    const data = tryReadJson(file, errors);
    if (!data) continue;
    errors.push(...validateRepo(data, where, { published: true }));
    if (data.slug && `${data.slug}.json` !== f) errors.push(`${where}: numele fișierului trebuie să fie ${data.slug}.json.`);
    if (data.slug) repoSlugs.add(data.slug);
    if (data.slug && !indexSlugs.has(data.slug)) errors.push(`${where}: lipsește din content/index.json.`);
    (data.categories || []).forEach((c) => {
      if (!categories.has(c)) errors.push(`${where}: categoria „${c}” nu există în content/categories.json.`);
    });
    // dovezi
    const evDir = path.join(CONTENT, "evidence", data.slug || "");
    const evFiles = data.slug && fs.existsSync(evDir) ? fs.readdirSync(evDir) : [];
    if (data.slug && evFiles.length === 0) errors.push(`${where}: lipsesc dovezile din content/evidence/${data.slug}/.`);
    (data.examples || []).forEach((e) => {
      if (nonEmpty(e.evidence_file) && !evFiles.includes(e.evidence_file)) {
        errors.push(`${where}: fișierul de dovadă „${e.evidence_file}” nu există în content/evidence/${data.slug}/.`);
      }
    });
  }
  index.forEach((e) => {
    if (!repoSlugs.has(e.slug)) errors.push(`content/index.json: „${e.slug}” nu are fișier în content/repos/.`);
  });

  // rețete
  const recipeDir = path.join(CONTENT, "recipes");
  const recipeFiles = fs.existsSync(recipeDir) ? fs.readdirSync(recipeDir).filter((f) => f.endsWith(".json")) : [];
  const recipeList = new Set((lists.recipes || []).map((r) => r.slug));
  for (const f of recipeFiles) {
    const file = path.join(recipeDir, f);
    const where = rel(file);
    const data = tryReadJson(file, errors);
    if (!data) continue;
    errors.push(...validateRecipe(data, where, { published: true, knownSlugs: repoSlugs }));
    if (data.slug && `${data.slug}.json` !== f) errors.push(`${where}: numele fișierului trebuie să fie ${data.slug}.json.`);
    if (data.slug && !recipeList.has(data.slug)) errors.push(`${where}: lipsește din content/recipes.json.`);
  }
  return errors;
}

// ---------- validarea unui draft ----------

function validateDraft(file) {
  const errors = [];
  const abs = path.resolve(file);
  const where = rel(abs);
  if (!fs.existsSync(abs)) return [`${where}: fișierul nu există.`];
  const data = tryReadJson(abs, errors);
  if (!data) return errors;
  const indexFile = path.join(CONTENT, "index.json");
  const knownSlugs = fs.existsSync(indexFile) ? new Set(readJson(indexFile).map((e) => e.slug)) : null;

  if (Array.isArray(data.recipes)) {
    data.recipes.forEach((r, i) =>
      errors.push(...validateRecipe(r, `${where} recipes[${i}]`, { published: false, knownSlugs }))
    );
    if (!Array.isArray(data.missing_pieces)) errors.push(`${where}: lipsește lista missing_pieces.`);
  } else {
    errors.push(...validateRepo(data, where, { published: false }));
  }
  return errors;
}

// ---------- validarea unui singur fișier (folosită de hook) ----------
// Hook-ul rulează după fiecare scriere, deci verifică doar fișierul scris.
// Legăturile dintre fișiere (index, dovezi, categorii) le verifică `npm run validate`.

function validateSingleContentFile(abs) {
  const errors = [];
  const where = rel(abs);
  const data = tryReadJson(abs, errors);
  if (!data) return errors;
  const dir = path.basename(path.dirname(abs));
  if (dir === "repos") return validateRepo(data, where, { published: true });
  if (dir === "recipes") return validateRecipe(data, where, { published: true, knownSlugs: null });
  if (!Array.isArray(data)) return [`${where}: trebuie să fie o listă ([]).`];
  return [];
}

// ---------- pornire ----------

function report(errors, { hook }) {
  if (errors.length === 0) {
    if (!hook) console.log("✅ Validare reușită.");
    process.exit(0);
  }
  const text = `❌ Validarea a găsit ${errors.length} problem${errors.length === 1 ? "ă" : "e"}:\n- ${errors.join("\n- ")}`;
  console.error(text);
  process.exit(hook ? 2 : 1);
}

const args = process.argv.slice(2);

if (args[0] === "--hook") {
  let input = "";
  process.stdin.on("data", (c) => (input += c));
  process.stdin.on("end", () => {
    let filePath = "";
    try {
      filePath = JSON.parse(input)?.tool_input?.file_path || "";
    } catch {
      process.exit(0);
    }
    const abs = path.resolve(ROOT, filePath);
    const inContent = abs.startsWith(CONTENT + path.sep) && !abs.startsWith(path.join(CONTENT, "schema"));
    const isDraft = abs.startsWith(path.join(ROOT, "drafts") + path.sep) && abs.endsWith(".json") && !abs.endsWith(".audit.json");
    if (inContent && abs.endsWith(".json")) report(validateSingleContentFile(abs), { hook: true });
    else if (isDraft) report(validateDraft(abs), { hook: true });
    else process.exit(0);
  });
} else if (args[0] === "--draft") {
  if (!args[1]) {
    console.error("Folosire: node scripts/validate.mjs --draft drafts/<slug>.json");
    process.exit(1);
  }
  report(validateDraft(args[1]), { hook: false });
} else {
  report(validateContent(), { hook: false });
}
