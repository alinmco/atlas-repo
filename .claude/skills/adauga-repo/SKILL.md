---
name: adauga-repo
description: Adaugă pe site unul sau mai multe repo-uri GitHub, cap-coadă - cercetare, verificare independentă, publicare și Pull Request.
disable-model-invocation: true
---

Repo-uri primite: $ARGUMENTS

Dacă nu ai primit niciun URL GitHub, cere-mi linkurile și oprește-te.

## Pregătire
1. Asigură-te că ești pe `main`, actualizat (`git checkout main && git pull`), și că
   dependențele site-ului sunt instalate (`npm ci` dacă lipsește `node_modules`).
2. Creează un branch nou: `continut/repo-<YYYY-MM-DD>-<slug-scurt>`.
3. Pentru fiecare URL, verifică dacă repo-ul există deja în `content/index.json`. Dacă da,
   spune-mi și tratează-l ca re-verificare (dă-i lui researcher și fișierul existent).

## Pentru fiecare repo (maximum 3 în paralel)
1. Lansează subagentul **researcher** cu URL-ul.
2. Când termină, lansează subagentul **verifier** pe `drafts/<slug>.json`.
3. Dacă verdictul e `"respins"`, trimite lista `"problems"` înapoi la researcher, apoi rulează
   din nou verifier. Maximum 2 runde de corectură. Dacă tot e respins, renunță la acel repo
   și reține motivul pentru raport.
4. Dacă verdictul e `"aprobat"`, lansează subagentul **editor** pentru acel draft.
   Editorii rulează unul câte unul (nu în paralel), pentru că modifică aceleași fișiere de catalog.

## Publicare
1. Rulează `npm run validate` și `npm run build`. Dacă pică, cere editorului să repare.
2. Commit cu mesajul `Adaugă: <nume repo-uri>` și push pe branch.
3. Deschide un Pull Request cu `gh pr create`. Titlu: `Adaugă: <nume repo-uri>`.
   Descrierea conține raportul editorului (cele 3 părți) și, pentru fiecare repo respins,
   motivul.

## Raportul final către mine (scurt)
- ✅ Publicate: lista repo-urilor
- ❌ Respinse: repo + motivul într-o propoziție
- ❓ Ce trebuie să decid eu
- 🔗 Linkul PR-ului. Preview-ul Vercel apare automat în PR în 1-2 minute.
