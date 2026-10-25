# Atlas de repo-uri

Site static (Astro) publicat pe Vercel, care prezintă repo-uri GitHub pe înțelesul oricui,
cu exemple RULATE și verificate. Tot conținutul site-ului stă în `content/` ca fișiere JSON.
Limba conținutului: română.

## Cum lucrează agenții
- `researcher` investighează un repo și scrie un draft în `drafts/`.
- `verifier` re-rulează independent tot ce a făcut researcher și dă un verdict.
- `recipe-architect` caută combinații între repo-urile din catalog și piese lipsă.
- `editor` este SINGURUL care scrie în `content/` și deschide Pull Request-uri.
Comenzile utilizatorului: `/adauga-repo`, `/retete`, `/sanatate`.

## Reguli de neîncălcat
- Nimic nu ajunge în `content/` fără `drafts/<slug>.audit.json` cu `"verdict": "aprobat"`.
- Niciun output, preț, comandă sau rezultat inventat. Ce nu e verificat se marchează ca atare.
- Codul repo-urilor analizate se rulează DOAR în `sandbox/`, niciodată în rădăcina proiectului.
- Totul se publică prin Pull Request. Niciodată push direct pe `main`.
- Nu introduce niciodată chei API, parole sau date personale reale în fișiere. Doar placeholder-e (ex: YOUR_API_KEY).
- După orice modificare în `content/`, rulează `npm run validate`. Dacă pică, repari înainte de orice altceva.

## Dependențe
- Când ai nevoie de o dependență ca să obții un rezultat mai bun sau ca să rulezi un exemplu,
  instaleaz-o imediat, fără să întrebi. Nu căuta ocolișuri și nu te mulțumi cu un rezultat
  mai slab din cauza unei dependențe lipsă.
- Instalează izolat, per repo, în `sandbox/<slug>/`: venv sau `uv` pentru Python, `npm install`
  local pentru Node, nu global. Excepție: uneltele de sistem (ffmpeg, build-essential etc.)
  se instalează la nivel de container.
- Fixează versiunile. Fiecare dependență instalată se notează cu versiunea exactă în
  `"prerequisites"` și în `"environment.versions"`, iar toate comenzile de instalare,
  în ordine, ajung în `sandbox/<slug>/setup.sh`.
- Pentru site (rădăcina proiectului), dependențele noi se adaugă în `package.json` cu versiune
  fixă, iar lockfile-ul se include în commit.
- Dacă o instalare eșuează, încearcă o alternativă (altă versiune, alt manager de pachete,
  build din sursă) înainte să marchezi exemplul ca eșuat. Notează în `"confidence_notes"`
  ce ai încercat.

## Structura fișierelor
- `content/repos/<slug>.json` – o pagină de repo (schema: `content/schema/repo.schema.json`)
- `content/recipes/<slug>.json` – o rețetă (schema: `content/schema/recipe.schema.json`)
- `content/evidence/<slug>/` – log-urile brute ale rulărilor și `setup.sh`
- `content/index.json` – catalogul (rezumatul fiecărui repo)
- `content/categories.json`, `candidates.json`, `gaps.json`, `ideas.json`, `recipes.json`
- `drafts/` și `sandbox/` – zone de lucru, nu intră în git
