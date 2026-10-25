---
name: adauga-repo
description: Adaugă pe site unul sau mai multe repo-uri GitHub - cercetare din documentație, publicare în content/ și Pull Request.
disable-model-invocation: true
---

Repo-uri primite: $ARGUMENTS

Dacă nu ai primit niciun URL GitHub, cere-mi linkurile și oprește-te.

## Pasul 1: planul
1. Verifică dacă vreun repo există deja în `content/index.json`. Dacă da, e o actualizare.
2. Prezintă planul în formatul din CLAUDE.md („Cum comunici cu utilizatorul”):
   - ce repo-uri vei analiza (numele lor) și care sunt actualizări;
   - câte pagini noi apar pe site;
   - durata estimată: ~5-15 min per repo, consum mediu.
3. Așteaptă confirmarea.

## Pasul 2: cercetare și publicare
1. Asigură-te că ești pe `main`, actualizat (`git checkout main && git pull`), și că
   dependențele site-ului sunt instalate (`npm ci` dacă lipsește `node_modules`).
   Dacă există modificări necomise, spune-mi înainte și întreabă dacă le includ în PR.
2. Creează un branch nou: `continut/repo-<YYYY-MM-DD>-<slug-scurt>`.
3. Pentru fiecare repo (maximum 3 în paralel), lansează subagentul **researcher** cu URL-ul
   (și cu fișierul existent, dacă e o actualizare).
4. Când un researcher termină, lansează **editor** pentru draftul lui. Editorii rulează unul
   câte unul (nu în paralel), pentru că modifică aceleași fișiere de catalog.
5. Dacă un repo durează mult peste estimare sau researcher se blochează, te oprești pentru
   acel repo și mă întrebi scurt ce faci (continui / renunți).

## Pasul 3: Pull Request
1. Rulează `npm run validate` și `npm run build`. Dacă pică, cere editorului să repare.
2. Commit cu mesajul `Adaugă: <nume repo-uri>` și push pe branch.
3. Deschide un Pull Request cu `gh pr create --base main`. Titlu: `Adaugă: <nume repo-uri>`.
   Descrierea conține raportul editorului.

## Raportul final (scurt, în stilul din CLAUDE.md)
- ✅ Publicate: repo + dificultatea de pornire
- ❌ Probleme: repo + motivul într-o propoziție
- ❓ Ce trebuie să decid eu
- 🔗 Linkul PR-ului. Preview-ul Vercel apare automat în PR în 1-2 minute.
