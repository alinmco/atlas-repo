// Glosar: găsește termenii din content/glossary.json într-un text.
// Fiecare termen se marchează o singură dată pe pagină (prima apariție).
import { glossary } from "./data.js";

const escape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const entries = Array.isArray(glossary) ? glossary.filter((g) => g?.term && g?.explanation) : [];
const byForm = new Map();
for (const g of entries) {
  for (const f of [g.term, ...(g.aliases || [])]) byForm.set(f.toLowerCase(), g);
}
const forms = [...byForm.keys()].sort((a, b) => b.length - a.length);
const re = forms.length
  ? new RegExp(`(?<![\\p{L}\\p{N}_-])(${forms.map(escape).join("|")})(?![\\p{L}\\p{N}_-])`, "giu")
  : null;

// Un glosar nou pentru fiecare pagină (ține minte ce a fost deja marcat).
export function createGlossary() {
  const seen = new Set();
  let counter = 0;
  return {
    // Întoarce o listă de bucăți: { text } sau { text, explanation, id }.
    split(text) {
      const value = String(text ?? "");
      if (!re) return [{ text: value }];
      const parts = [];
      let last = 0;
      for (const m of value.matchAll(re)) {
        const entry = byForm.get(m[0].toLowerCase());
        if (!entry || seen.has(entry.term)) continue;
        seen.add(entry.term);
        if (m.index > last) parts.push({ text: value.slice(last, m.index) });
        parts.push({ text: m[0], explanation: entry.explanation, id: `gl-${++counter}` });
        last = m.index + m[0].length;
      }
      if (last < value.length) parts.push({ text: value.slice(last) });
      return parts;
    },
  };
}
