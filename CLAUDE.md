# Atlas de repo-uri

Site static (Astro), publicat pe Vercel, care prezintă repo-uri GitHub pe înțelesul oricui.
Conținutul se bazează pe documentația oficială și pe codul fiecărui repo, citite și explicate
de agenți AI. Nu rulăm și nu testăm repo-urile. Rețetele și ideile sunt propuneri, netestate.
Tot conținutul site-ului stă în `content/`, ca fișiere JSON. Limba conținutului: română.

Proiectul rulează local, pe Windows, din aplicația Claude desktop (secțiunea Code).

## Agenții
- `researcher` citește un repo (README, documentație, cod) și scrie un draft în `drafts/`.
- `editor` este SINGURUL care scrie în `content/`. Leagă repo-urile între ele și rulează build-ul.
- `recipe-architect` propune rețete (combinații de repo-uri din catalog) și idei de proiecte noi.
- `site-dev` face orice modificare de cod a site-ului (`src/`, `scripts/`, configurație).
  Când utilizatorul cere o schimbare de aspect, text sau funcționalitate, delegă-i-o lui
  `site-dev` în loc să o faci direct.

Comenzile utilizatorului: `/adauga-repo <link> [<link> ...]` și `/retete`.

## Cum comunici cu utilizatorul
Utilizatorul e începător și vrea răspunsuri foarte ușor de citit.

**Înainte să execuți orice sarcină** care modifică fișiere, pornește agenți sau rulează mai
mult de o comandă, prezinți planul în formatul de mai jos și AȘTEPȚI confirmarea:

```
**Ce vreau să fac**
- (1-4 puncte scurte, în cuvinte simple)

**Ce se schimbă**
- (paginile sau fișierele afectate, pe înțelesul unui începător)

**Durată și consum:** (estimare scurtă, ex: „~10 min, consum mediu”)
**Risc:** (doar dacă există, într-un rând)

Încep? (da / schimbă ceva)
```

Reguli pentru acest format:
- Fiecare punct are maximum un rând. Fără paragrafe, fără introduceri, fără repetarea cererii.
- Cuvinte simple. Dacă un termen tehnic e inevitabil, îl explici în 3-4 cuvinte.
- Dacă cererea e neclară, pui o singură întrebare scurtă în loc de plan.
- Excepții, când nu aștepți confirmarea: răspunsuri la întrebări simple și citirea fișierelor.
- Dacă o sarcină începe să dureze sau să consume mult peste estimare, te oprești și îl
  avertizezi, scurt, cu opțiunile. Nu continui pe tăcute.

**Raportul de la final** respectă același stil: 3-6 puncte scurte cu ce s-a făcut, ce n-a
mers și ce trebuie să decidă utilizatorul. Fără recapitularea pașilor.

## Reguli de neîncălcat
- Nu rulezi codul repo-urilor analizate. Le citești: clonare cu `git clone --depth 1` în
  `sandbox/`, documentație, cod sursă.
- Nu inventezi nimic: comenzi, output-uri, prețuri, funcții. Exemplele de cod vin exact din
  documentația oficială, cu link spre sursă. Ce nu găsești, lași gol și spui.
- Pe site, conținutul e prezentat onest: „din documentație”, rețetele „propuse, netestate”.
- Totul se publică prin Pull Request. Niciodată push direct pe `main` (e protejat).
- Nu introduci niciodată chei API, parole sau date personale reale în fișiere.
- După orice modificare în `content/`, rulezi `npm run validate`. Verifică doar formatul
  fișierelor, ca site-ul să nu se strice la build. Dacă pică, repari înainte de orice altceva.

## Structura fișierelor
- `content/repos/<slug>.json` – o pagină de repo (schema: `content/schema/repo.schema.json`)
- `content/recipes/<slug>.json` – o rețetă (schema: `content/schema/recipe.schema.json`)
- `content/index.json` – catalogul (rezumatul fiecărui repo)
- `content/categories.json`, `candidates.json`, `gaps.json`, `ideas.json`, `recipes.json`
- `drafts/` și `sandbox/` – zone de lucru, nu intră în git
