---
name: retete
description: Caută și testează rețete noi (combinații de repo-uri din catalog) și transformă golurile în idei de proiecte, apoi deschide un Pull Request.
disable-model-invocation: true
---

Instrucțiuni suplimentare (opțional): $ARGUMENTS

## Pasul 0: planul, pe scurt
Înainte de orice altceva, prezintă planul în formatul din CLAUDE.md („Cum comunici cu
utilizatorul”) și așteaptă confirmarea. Pentru această comandă, planul spune:
- câte repo-uri sunt în catalog și ce fel de combinații vei căuta;
- că rezultatul vine ca Pull Request, cu rețete și idei noi;
- durata estimată și că consumul e mare.
Dacă variabila de mediu `GITHUB_ACTIONS` are valoarea `true`, sari peste confirmare.

1. Verifică `content/index.json`. Dacă sunt mai puțin de 5 repo-uri în catalog, spune-mi că
   e prea devreme pentru rețete utile și oprește-te, dacă nu ți-am cerut explicit altfel.
2. Treci pe `main` actualizat și creează branch-ul `continut/retete-<YYYY-MM-DD>`.
3. Lansează subagentul **recipe-architect**. Transmite-i și instrucțiunile suplimentare, dacă există.
4. Lansează subagentul **verifier** pe `drafts/recipes-<data>.json`.
5. Dacă verdictul e `"respins"`, trimite problemele înapoi la recipe-architect și rulează din
   nou verifier. Maximum 2 runde. Rețetele care tot nu trec se elimină din draft, iar
   restul merg mai departe dacă verifier le aprobă.
6. Lansează subagentul **editor** pe draftul aprobat.
7. Rulează `npm run validate` și `npm run build`, commit, push și deschide PR-ul cu
   `gh pr create`. Titlu: `Rețete și idei noi – <data>`.

Raportul final către mine: rețetele publicate, ideile noi, ce a fost respins și de ce,
linkul PR-ului.
