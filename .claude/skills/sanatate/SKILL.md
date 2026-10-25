---
name: sanatate
description: Verifică sănătatea catalogului - ce e vechi, ce prețuri trebuie reconfirmate, ce candidați merită adăugați - și re-verifică automat ce e expirat.
disable-model-invocation: true
---

Instrucțiuni suplimentare (opțional): $ARGUMENTS

## Pasul 0: planul, pe scurt
Înainte de orice altceva, prezintă planul în formatul din CLAUDE.md („Cum comunici cu
utilizatorul”) și așteaptă confirmarea. Pentru această comandă, planul spune:
- câte repo-uri, prețuri și rețete au expirat (citește întâi `content/`);
- ce vei re-verifica în această rulare (maximum 5 repo-uri);
- durata estimată. Pentru „doar raport”, nu e nevoie de confirmare.
Dacă variabila de mediu `GITHUB_ACTIONS` are valoarea `true`, sari peste confirmare.

## 1. Raportul
Pe baza fișierelor din `content/`, întocmește lista:
- repo-urile cu `"verified_at"` mai vechi de 90 de zile;
- prețurile cu `"price_checked_at"` mai vechi de 30 de zile;
- rețetele cu `"verified_at"` mai vechi de 90 de zile;
- categoriile cu un singur repo sau cu peste 15;
- cei mai promițători 5 candidați din `content/candidates.json`, cu motivul.

## 2. Re-verificarea
Dacă instrucțiunile suplimentare conțin „doar raport”, te oprești aici și îmi arăți raportul.
Altfel:
1. Treci pe `main` actualizat și creează branch-ul `continut/sanatate-<YYYY-MM-DD>`.
2. Pentru fiecare repo expirat (maximum 5 pe rulare, cele mai vechi primele):
   **researcher** în modul re-verificare (îi dai URL-ul și fișierul existent) →
   **verifier** → dacă e aprobat, **editor**.
   Dacă un exemplu care mergea nu mai merge, NU îl șterge: editorul îl marchează
   `"status": "esuat"` cu motivul, iar site-ul îl va afișa la „Limitări cunoscute”.
3. Pentru prețurile expirate din repo-uri care nu sunt re-verificate complet, cere-i lui
   researcher doar reconfirmarea prețurilor, apoi verifier și editor.
4. Rulează `npm run validate` și `npm run build`, commit, push și deschide PR-ul cu
   `gh pr create`. Titlu: `Sănătate catalog – <data>`. În descriere pune raportul.

Raportul final către mine: ce s-a re-verificat, ce s-a stricat între timp, candidații
recomandați, linkul PR-ului.
