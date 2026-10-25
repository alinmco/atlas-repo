---
name: adauga-repo
description: Adaugă pe site unul sau mai multe repo-uri GitHub - cercetare din documentație, publicare în content/ și Pull Request.
disable-model-invocation: true
---

Repo-uri primite: $ARGUMENTS

Dacă nu ai primit niciun URL GitHub, cere-mi linkurile și oprește-te.

Comanda merge singură până la capăt, fără să ceară confirmări: fără plan de aprobat, fără
aprobarea PR-ului. Te oprești și mă întrebi DOAR dacă apare o eroare pe care nu o poți repara.

## Pasul 1: pregătire
1. Verifică dacă vreun repo există deja în `content/index.json`. Dacă da, e o actualizare.
2. Spune-mi într-un rând ce repo-uri analizezi (și care sunt actualizări), apoi continui
   imediat, fără să aștepți răspuns.

## Pasul 2: cercetare și publicare
1. Asigură-te că ești pe `main`, actualizat (`git checkout main && git pull`), și că
   dependențele site-ului sunt instalate (`npm ci` dacă lipsește `node_modules`).
   Modificările necomise din afara `content/` (ex: `.claude/agent-memory/`) le lași
   deoparte și nu le incluzi în PR. Comiți doar `content/`.
2. Creează un branch nou: `continut/repo-<YYYY-MM-DD>-<slug-scurt>`.
3. Pentru fiecare repo (maximum 3 în paralel), lansează subagentul **researcher** cu URL-ul
   (și cu fișierul existent, dacă e o actualizare).
4. Când un researcher termină, lansează **editor** pentru draftul lui. Editorii rulează unul
   câte unul (nu în paralel), pentru că modifică aceleași fișiere de catalog.
5. Dacă un researcher eșuează sau se blochează, încearcă o dată din nou. Dacă pică și a doua
   oară, renunți la acel repo, continui cu celelalte și îl treci la „Probleme” în raport.

## Pasul 3: Pull Request și merge
1. Rulează `npm run validate` și `npm run build`. Dacă pică, cere editorului să repare.
2. Commit cu mesajul `Adaugă: <nume repo-uri>` și push pe branch.
3. Deschide un Pull Request cu `gh pr create --base main`. Titlu: `Adaugă: <nume repo-uri>`.
   Descrierea conține raportul editorului.
4. Așteaptă verificările din PR (o singură comandă, în fundal):
   `gh pr checks <nr> --watch --fail-fast`. Dacă toate sunt verzi, dai merge:
   `gh pr merge <nr> --merge --delete-branch`, apoi `git checkout main && git pull`.
5. Dacă o verificare pică, citești eroarea și o repari (prin editor sau site-dev), apoi
   repeți pasul 4. Te oprești și mă întrebi doar dacă nu o poți repara.

## Raportul final (scurt, în stilul din CLAUDE.md)
- ✅ Publicate: repo + dificultatea de pornire
- ❌ Probleme: repo + motivul într-o propoziție
- ❓ De decis (opțional, nu blochează nimic)
- 🔗 Linkul PR-ului (deja unit în main)
