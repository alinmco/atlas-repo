// Publică log-urile brute și setup.sh din content/evidence/<slug>/ ca fișiere text,
// la adresa /dovezi/<slug>/<fișier>.
import fs from "node:fs";
import path from "node:path";

const ROOT = path.join(process.cwd(), "content", "evidence");

export function getStaticPaths() {
  if (!fs.existsSync(ROOT)) return [];
  return fs
    .readdirSync(ROOT, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .flatMap((d) =>
      fs
        .readdirSync(path.join(ROOT, d.name), { withFileTypes: true })
        .filter((f) => f.isFile() && !f.name.startsWith("."))
        .map((f) => ({ params: { slug: d.name, file: f.name } }))
    );
}

export function GET({ params }) {
  const text = fs.readFileSync(path.join(ROOT, params.slug, params.file), "utf8");
  return new Response(text, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
