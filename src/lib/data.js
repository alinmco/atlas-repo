// Citește tot conținutul din content/ la build. Site-ul nu are bază de date:
// fișierele JSON sunt singura sursă de adevăr.

const repoModules = import.meta.glob("/content/repos/*.json", { eager: true, import: "default" });
const recipeModules = import.meta.glob("/content/recipes/*.json", { eager: true, import: "default" });
const listModules = import.meta.glob("/content/*.json", { eager: true, import: "default" });

function list(name) {
  return listModules[`/content/${name}.json`] ?? [];
}

export const repos = Object.values(repoModules).sort((a, b) => a.name.localeCompare(b.name, "ro"));
export const recipes = Object.values(recipeModules).sort((a, b) => a.title.localeCompare(b.title, "ro"));
export const categories = list("categories");
export const ideas = list("ideas");
export const index = list("index");

export function repoBySlug(slug) {
  return repos.find((r) => r.slug === slug);
}

export function repoByUrl(url) {
  const clean = (u) => (u || "").replace(/\/+$/, "").toLowerCase();
  return repos.find((r) => clean(r.repo_url) === clean(url));
}

export function verifiedExamples(repo) {
  return repo.examples.filter((e) => e.status === "verificat");
}

export function failedExamples(repo) {
  return repo.examples.filter((e) => e.status === "esuat" || e.status === "neverificat");
}

export function isDocMode(repo) {
  return repo.verification_level === "documentație";
}

export function docExamples(repo) {
  return repo.examples.filter((e) => e.status === "din documentație");
}

export function fastestMinutes(repo) {
  const times = verifiedExamples(repo)
    .map((e) => e.time_to_first_result_minutes)
    .filter((t) => typeof t === "number");
  return times.length ? Math.min(...times) : null;
}

export function recipesUsing(slug) {
  return recipes.filter((r) => r.steps.some((s) => s.repo_slug === slug));
}

const MONTHS = ["ian.", "feb.", "mar.", "apr.", "mai", "iun.", "iul.", "aug.", "sept.", "oct.", "nov.", "dec."];

export function formatDate(iso) {
  if (!iso) return "";
  const [y, m, d] = iso.split("-").map(Number);
  return `${d} ${MONTHS[m - 1]} ${y}`;
}

export function daysSince(iso) {
  if (!iso) return Infinity;
  return Math.floor((Date.now() - new Date(iso + "T00:00:00Z").getTime()) / 86400000);
}
