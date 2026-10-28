#!/usr/bin/env node
// Verifică formatul conținutului site-ului, ca build-ul să nu se strice.
//
//   node scripts/validate.mjs                    → verifică tot din content/
//   node scripts/validate.mjs --draft <fișier>   → verifică un draft din drafts/
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
const checkRepo = ajv.compile(readJson(path.join(CONTENT, "schema/repo.schema.json")));
const checkRecipe = ajv.compile(readJson(path.join(CONTENT, "schema/recipe.schema.json")));

const SECRET_PATTERNS = [
  [/sk-ant-[A-Za-z0-9_-]{10,}/, "cheie API Anthropic"],
  [/\bsk-[A-Za-z0-9]{20,}/, "cheie API (sk-...)"],
  [/\bgh[pousr]_[A-Za-z0-9]{20,}/, "token GitHub"],
  [/\bAKIA[0-9A-Z]{16}\b/, "cheie AWS"],
  [/-----BEGIN [A-Z ]*PRIVATE KEY-----/, "cheie privată"],
  [/\bxox[baprs]-[A-Za-z0-9-]{10,}/, "token Slack"],
];

const HYPE = /garantat|venit pasiv|bani u[sș]or|sigur c[aâ][sș]tigi|[iî]mbog[aă][tț]|f[aă]r[aă] niciun efort|f[aă]r[aă] risc/i;

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

function nonEmpty(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function wordCount(text) {
  return String(text ?? "").trim().split(/\s+/).filter(Boolean).length;
}

function schemaErrors(validate, data, where) {
  if (validate(data)) return [];
  return validate.errors.map((e) => `${where}: câmpul ${e.instancePath || "(rădăcină)"} ${e.message}`);
}

function scanSecrets(data, where) {
  const text = JSON.stringify(data);
  return SECRET_PATTERNS.filter(([re]) => re.test(text)).map(
    ([, label]) => `${where}: pare să conțină un secret (${label}). Folosește un placeholder.`
  );
}

function notInFuture(value, label, where) {
  return nonEmpty(value) && value > TODAY ? [`${where}: ${label} (${value}) este în viitor.`] : [];
}

// ---------- reguli comune ----------

function checkOneLiner(text, where) {
  const n = wordCount(text);
  return n > 15 ? [`${where}: one_liner are ${n} cuvinte (maximum 15).`] : [];
}

function checkPrices(replaces, where) {
  const errors = [];
  (Array.isArray(replaces) ? replaces : []).forEach((r, i) => {
    const at = `${where}: replaces[${i}] (${r?.service})`;
    if (r?.price !== null && r?.price !== undefined) {
      if (!nonEmpty(r.price_source_url)) errors.push(`${at}: prețul nu are price_source_url.`);
      if (!nonEmpty(r.price_checked_at)) errors.push(`${at}: prețul nu are price_checked_at.`);
    }
    errors.push(...notInFuture(r?.price_checked_at, "price_checked_at", at));
  });
  return errors;
}

function checkMonetization(list, where, { repoLicense } = {}) {
  const errors = [];
  (Array.isArray(list) ? list : []).forEach((m, i) => {
    const at = `${where}: monetization[${i}]`;
    if (HYPE.test(JSON.stringify(m))) {
      errors.push(`${at}: conține promisiuni de câștig („garantat”, „venit pasiv” etc.). Ideile trebuie să fie realiste.`);
    }
    const evidence = Array.isArray(m?.demand_evidence) ? m.demand_evidence : [];
    if (evidence.length === 0) {
      errors.push(`${at}: lipsește „demand_evidence” (cel puțin o afacere reală, cu link).`);
    }
    evidence.forEach((e, j) => {
      if (!nonEmpty(e?.url)) errors.push(`${at}: demand_evidence[${j}] nu are url.`);
      errors.push(...notInFuture(e?.checked_at, "checked_at", `${at}: demand_evidence[${j}]`));
    });
    if (!Array.isArray(m?.risks) || m.risks.length === 0) {
      errors.push(`${at}: lipsesc riscurile. Orice idee de afacere are riscuri.`);
    }
    const use = m?.license_check?.commercial_use;
    if ((use === "interzis" || use === "neclar") && m?.path !== "construiești propria implementare") {
      errors.push(`${at}: licența ${use === "interzis" ? "interzice" : "nu clarifică"} uzul comercial, deci „path” trebuie să fie „construiești propria implementare”.`);
    }
    if (m?.path === "construiești propria implementare" && !nonEmpty(m?.own_build_notes)) {
      errors.push(`${at}: lipsește „own_build_notes” (ce construiești tu și ce nu ai voie să preiei).`);
    }
    if (repoLicense && m?.license_check?.license && m.license_check.license !== repoLicense) {
      errors.push(`${at}: licența din license_check („${m.license_check.license}”) diferă de cea din tech_sheet („${repoLicense}”).`);
    }
  });
  return errors;
}

// ---------- formatul nou de pagină de repo ----------

// Repo-uri din formatul vechi, scutite de regulile formatului nou.
// Se scot din listă când sunt completate în formatul nou.
const LEGACY_FORMAT_SLUGS = new Set([
  "react", "ruflo", "scientific-agent-skills",
]);

const REQUIRED_NEW_KEYS = [
  "at_a_glance", "cost", "platforms", "risk_flags", "features",
  "audience_reason", "setup_difficulty_reason", "notes_summary",
];

function sentenceCount(text) {
  return (String(text ?? "").trim().match(/[.!?]+(?=\s|$)/g) || []).length;
}

function checkNewFormat(data, where) {
  if (LEGACY_FORMAT_SLUGS.has(data?.slug)) return [];
  const errors = [];
  for (const key of REQUIRED_NEW_KEYS) {
    if (data[key] === undefined || data[key] === null) {
      errors.push(`${where}: lipsește câmpul „${key}” (obligatoriu în formatul nou de pagină${key === "risk_flags" ? "; poate fi listă goală" : ""}).`);
    }
  }
  if (data.first_steps === undefined) {
    errors.push(`${where}: lipsește „first_steps” (Primii pași). Dacă nu s-a găsit o experiență reală, pune null și explică în notes, cu textul „Primii pași”.`);
  } else if (data.first_steps === null) {
    if (!String(data.notes ?? "").includes("Primii pași")) {
      errors.push(`${where}: first_steps este null, dar notes nu conține textul „Primii pași” cu explicația.`);
    }
  } else if (data.first_steps.origin !== "experiență utilizator" || !nonEmpty(data.first_steps.story_url)) {
    errors.push(`${where}: first_steps trebuie să aibă origin „experiență utilizator” și un story_url (exemplele inventate nu mai sunt permise).`);
  }
  const ai = data.cost?.ai_access;
  if (!ai || typeof ai !== "object") {
    errors.push(`${where}: lipsește „cost.ai_access” (ce servicii AI merg: abonament, cheie API etc.).`);
  } else {
    if (!nonEmpty(ai.mode)) errors.push(`${where}: lipsește „cost.ai_access.mode”.`);
    else if (!["abonament sau API", "doar API", "doar abonament", "nu folosește AI", "necunoscut"].includes(ai.mode)) errors.push(`${where}: „cost.ai_access.mode” are o valoare nepermisă („${ai.mode}”).`);
    if (!nonEmpty(ai.detail)) errors.push(`${where}: lipsește „cost.ai_access.detail” (o frază).`);
  }
  const examples = Array.isArray(data.examples) ? data.examples : [];
  if (!examples.some((e) => e?.kind === "folosire")) {
    errors.push(`${where}: niciun exemplu din „examples” nu are kind „folosire”.`);
  }
  const sentences = sentenceCount(data.problem_solved);
  const words = wordCount(data.problem_solved);
  if (sentences > 2 || words > 60) {
    errors.push(`${where}: problem_solved are ${sentences} propoziții și ${words} cuvinte (maximum 2 propoziții și 60 de cuvinte).`);
  }
  return errors;
}

// ---------- un repo / o rețetă ----------

function validateRepo(data, where) {
  return [
    ...schemaErrors(checkRepo, data, where),
    ...checkOneLiner(data.one_liner, where),
    ...checkNewFormat(data, where),
    ...checkPrices(data.replaces, where),
    ...checkMonetization(data.monetization, where, { repoLicense: data.tech_sheet?.license }),
    ...notInFuture(data.updated_at, "updated_at", where),
    ...scanSecrets(data, where),
  ];
}

function validateRecipe(data, where, knownSlugs) {
  const errors = [
    ...schemaErrors(checkRecipe, data, where),
    ...checkOneLiner(data.one_liner, where),
    ...checkPrices(data.replaces, where),
    ...notInFuture(data.created_at, "created_at", where),
    ...scanSecrets(data, where),
  ];
  if (knownSlugs) {
    (Array.isArray(data.steps) ? data.steps : []).forEach((s, i) => {
      if (!knownSlugs.has(s?.repo_slug)) {
        errors.push(`${where}: pasul ${i + 1} folosește repo-ul „${s?.repo_slug}”, care nu e în catalog.`);
      }
    });
  }
  return errors;
}

// ---------- glosar ----------

function validateGlossary(data, where) {
  const errors = [];
  if (!Array.isArray(data)) return [`${where}: trebuie să fie o listă ([]).`];
  const seen = new Map();
  data.forEach((g, i) => {
    const at = `${where}[${i}]`;
    if (!g || typeof g !== "object" || Array.isArray(g)) return errors.push(`${at}: trebuie să fie un obiect.`);
    if (!nonEmpty(g.term)) errors.push(`${at}: lipsește „term”.`);
    if (!Array.isArray(g.aliases) || g.aliases.some((a) => !nonEmpty(a))) {
      errors.push(`${at}: „aliases” trebuie să fie o listă de texte nevide (poate fi goală).`);
    }
    if (!nonEmpty(g.explanation)) errors.push(`${at}: „explanation” e gol.`);
    for (const form of [g.term, ...(Array.isArray(g.aliases) ? g.aliases : [])]) {
      if (!nonEmpty(form)) continue;
      const key = form.trim().toLowerCase();
      if (seen.has(key) && seen.get(key) !== i) errors.push(`${at}: „${form}” apare și la intrarea ${seen.get(key)} (termenii trebuie să fie unici).`);
      else seen.set(key, i);
    }
  });
  return errors;
}

// ---------- tot conținutul ----------

function readList(name, errors) {
  const file = path.join(CONTENT, `${name}.json`);
  if (!fs.existsSync(file)) {
    errors.push(`content/${name}.json lipsește.`);
    return [];
  }
  const data = tryReadJson(file, errors);
  if (data !== null && !Array.isArray(data)) errors.push(`content/${name}.json trebuie să fie o listă ([]).`);
  return Array.isArray(data) ? data : [];
}

function jsonFiles(dir) {
  return fs.existsSync(dir) ? fs.readdirSync(dir).filter((f) => f.endsWith(".json")) : [];
}

function validateContent() {
  const errors = [];
  const lists = {};
  for (const name of ["index", "categories", "candidates", "gaps", "ideas", "recipes"]) {
    lists[name] = readList(name, errors);
  }
  const glossaryFile = path.join(CONTENT, "glossary.json");
  if (fs.existsSync(glossaryFile)) {
    const g = tryReadJson(glossaryFile, errors);
    if (g !== null) errors.push(...validateGlossary(g, "content/glossary.json"));
  }
  const categories = new Set(lists.categories);
  const indexSlugs = new Set(lists.index.map((e) => e.slug));

  lists.ideas.forEach((idea, i) => {
    errors.push(...checkMonetization(idea?.monetization, `content/ideas.json[${i}] (${idea?.title})`));
  });

  const repoSlugs = new Set();
  for (const f of jsonFiles(path.join(CONTENT, "repos"))) {
    const file = path.join(CONTENT, "repos", f);
    const where = rel(file);
    const data = tryReadJson(file, errors);
    if (!data) continue;
    errors.push(...validateRepo(data, where));
    if (data.slug && `${data.slug}.json` !== f) errors.push(`${where}: numele fișierului trebuie să fie ${data.slug}.json.`);
    if (data.slug) repoSlugs.add(data.slug);
    if (data.slug && !indexSlugs.has(data.slug)) errors.push(`${where}: lipsește din content/index.json.`);
    (data.categories || []).forEach((c) => {
      if (!categories.has(c)) errors.push(`${where}: categoria „${c}” nu există în content/categories.json.`);
    });
  }
  lists.index.forEach((e) => {
    if (!repoSlugs.has(e.slug)) errors.push(`content/index.json: „${e.slug}” nu are fișier în content/repos/.`);
  });

  const recipeList = new Set(lists.recipes.map((r) => r.slug));
  for (const f of jsonFiles(path.join(CONTENT, "recipes"))) {
    const file = path.join(CONTENT, "recipes", f);
    const where = rel(file);
    const data = tryReadJson(file, errors);
    if (!data) continue;
    errors.push(...validateRecipe(data, where, repoSlugs));
    if (data.slug && `${data.slug}.json` !== f) errors.push(`${where}: numele fișierului trebuie să fie ${data.slug}.json.`);
    if (data.slug && !recipeList.has(data.slug)) errors.push(`${where}: lipsește din content/recipes.json.`);
  }
  return errors;
}

// ---------- un draft ----------

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
    data.recipes.forEach((r, i) => errors.push(...validateRecipe(r, `${where} recipes[${i}]`, knownSlugs)));
    if (!Array.isArray(data.missing_pieces)) errors.push(`${where}: lipsește lista missing_pieces.`);
    (data.missing_pieces || []).forEach((p, i) => {
      errors.push(...checkMonetization(p?.monetization, `${where} missing_pieces[${i}]`));
    });
  } else {
    errors.push(...validateRepo(data, where));
  }
  return errors;
}

// ---------- un singur fișier (hook) ----------
// Hook-ul rulează după fiecare scriere, deci verifică doar fișierul scris.
// Legăturile dintre fișiere le verifică `npm run validate`.

function validateSingleContentFile(abs) {
  const errors = [];
  const where = rel(abs);
  const data = tryReadJson(abs, errors);
  if (!data) return errors;
  const dir = path.basename(path.dirname(abs));
  if (dir === "repos") return validateRepo(data, where);
  if (dir === "recipes") return validateRecipe(data, where, null);
  if (path.basename(abs) === "glossary.json") return validateGlossary(data, where);
  return Array.isArray(data) ? [] : [`${where}: trebuie să fie o listă ([]).`];
}

// ---------- pornire ----------

function report(errors, { hook }) {
  if (errors.length === 0) {
    if (!hook) console.log("✅ Validare reușită.");
    process.exit(0);
  }
  console.error(`❌ Validarea a găsit ${errors.length} problem${errors.length === 1 ? "ă" : "e"}:\n- ${errors.join("\n- ")}`);
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
    const inside = (dir) => abs.startsWith(path.join(ROOT, dir) + path.sep);
    if (inside("content") && !inside(path.join("content", "schema")) && abs.endsWith(".json")) {
      report(validateSingleContentFile(abs), { hook: true });
    } else if (inside("drafts") && abs.endsWith(".json")) {
      report(validateDraft(abs), { hook: true });
    } else {
      process.exit(0);
    }
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
