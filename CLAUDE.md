# Atlas de repo-uri

Site static (Astro) publicat pe Vercel, care prezintă repo-uri GitHub pe înțelesul oricui,
cu exemple RULATE și verificate. Tot conținutul site-ului stă în `content/` ca fișiere JSON.
Limba conținutului: română.

## Cum lucrează agenții
- `researcher` investighează un repo și scrie un draft în `drafts/`.
- `verifier` re-rulează independent tot ce a făcut researcher și dă un verdict.
- `recipe-architect` caută combinații între repo-urile din catalog și piese lipsă.
- `editor` este SINGURUL care scrie în `content/`.
- `site-dev` face orice modificare de cod a site-ului (`src/`, `scripts/`, configurație).
  Când utilizatorul cere o schimbare de aspect, text sau funcționalitate, delegă-i-o lui
  `site-dev` în loc să o faci direct.
Comenzile utilizatorului: `/adauga-repo`, `/retete`, `/sanatate`.

## Cum comunici cu utilizatorul
Utilizatorul e începător și vrea răspunsuri foarte ușor de citit.

**Înainte să execuți orice sarcină** care modifică fișiere, pornește agenți sau rulează mai
mult de o comandă, prezinți planul în formatul de mai jos și AȘTEPȚI confirmarea:

```
**Ce vreau să fac**
- (1-4 puncte scurte, în cuvinte simple)

**Ce se schimbă**
- (paginile sau fișierele afectate, pe înțelesul unui începător)

**Durată și consum:** (estimare scurtă, ex: „~30 min, consum mare”)
**Risc:** (doar dacă există, într-un rând)

Încep? (da / schimbă ceva)
```

Reguli pentru acest format:
- Fiecare punct are maximum un rând. Fără paragrafe, fără introduceri, fără repetarea cererii.
- Cuvinte simple. Dacă un termen tehnic e inevitabil, îl explici în 3-4 cuvinte.
- Dacă cererea e neclară, pui o singură întrebare scurtă în loc de plan.
- Excepții, când nu aștepți confirmarea: răspunsuri la întrebări simple, citirea fișierelor,
  și rulările fără om (când variabila de mediu `GITHUB_ACTIONS` are valoarea `true`).

**Raportul de la final** respectă același stil: 3-6 puncte scurte cu ce s-a făcut, ce n-a
mers și ce trebuie să decidă utilizatorul. Fără recapitularea pașilor.

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
