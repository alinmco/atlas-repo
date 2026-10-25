---
name: retete
description: Propune rețete noi (combinații de repo-uri din catalog) și idei de proiecte, apoi deschide un Pull Request. Rețetele sunt propuneri, netestate.
disable-model-invocation: true
---

Instrucțiuni suplimentare (opțional): $ARGUMENTS

## Pasul 1: planul
1. Verifică `content/index.json`. Dacă sunt mai puțin de 4 repo-uri în catalog, spune-mi că
   e prea devreme pentru rețete utile și oprește-te, dacă nu ți-am cerut explicit altfel.
2. Prezintă planul în formatul din CLAUDE.md:
   - câte repo-uri sunt în catalog și ce fel de combinații vei căuta;
   - că rezultatul vine ca Pull Request, cu rețete și idei noi;
   - durata estimată: ~10-20 min, consum mediu.
3. Așteaptă confirmarea.

## Pasul 2: rețete, idei, Pull Request
1. Treci pe `main` actualizat și creează branch-ul `continut/retete-<YYYY-MM-DD>`.
2. Lansează subagentul **recipe-architect**. Transmite-i și instrucțiunile suplimentare.
3. Lansează subagentul **editor** pe `drafts/recipes-<data>.json`.
4. Rulează `npm run validate` și `npm run build`, commit, push și deschide PR-ul cu
   `gh pr create --base main`. Titlu: `Rețete și idei noi – <data>`.

Raportul final, scurt: rețetele propuse, ideile noi, linkul PR-ului.
