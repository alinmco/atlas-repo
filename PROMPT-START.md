# Prompt de pornire

Copiază tot textul de sub linie și lipește-l în prima sesiune Claude Code, deschisă pe
folderul `C:\Users\Alin\Desktop\atlas-repo`.

---

Salut! Preiei proiectul meu „Atlas de repo-uri”. Mai jos ai contextul și ce vreau să faci acum.
Citește întâi `CLAUDE.md` și respectă-l, mai ales partea „Cum comunici cu utilizatorul”:
sunt începător, vreau răspunsuri scurte, în puncte, și planul înainte de orice execuție.

## Ce e proiectul
- Un site static (Astro), publicat pe Vercel, care explică repo-uri GitHub pe înțelesul oricui.
- Repo GitHub: `alinmco/atlas-repo`. Branch-ul `main` e protejat: totul intră prin Pull Request,
  cu verificarea `validate-and-build` și preview Vercel.
- Lucrez pe Windows, local, din aplicația Claude desktop (secțiunea Code). Fără Docker.

## Ce am decis până acum
- Agenți: `researcher` (citește repo-ul și documentația), `editor` (singurul care scrie în
  `content/`), `recipe-architect` (rețete și idei), `site-dev` (codul site-ului).
- Comenzi: `/adauga-repo <link>` și `/retete`.
- NU rulăm și NU testăm repo-urile. Am avut înainte un sistem de verificare cu exemple rulate
  (agenți `verifier` și `scout`, comanda `/sanatate`, dovezi în `content/evidence/`,
  container Docker). L-am scos complet: era prea scump și prea greu pentru repo-uri mari.
  Acum exemplele vin exact din documentația oficială, cu link, iar rețetele sunt
  „propuse, netestate”.
- Păstrăm: comparația cu serviciile plătite (cu prețuri și surse), ideile de monetizare
  realiste (cu avertisment când licența interzice uzul comercial; atunci ideea e pe drumul
  „construiești propria implementare”), planul în puncte înainte de execuție, și
  `scripts/validate.mjs`, care verifică doar formatul fișierelor, ca build-ul să nu pice.
- Modele: totul pe Sonnet, `editor` pe Haiku, ca să economisim.
- Am greșit inițial și am folosit GitHub Copilot din VS Code crezând că e Claude Code. Dacă
  vezi urme de la acea încercare, ignoră-le.

## Ce vreau să faci acum, în ordine
Prezintă-mi întâi planul pentru toți pașii, apoi așteaptă confirmarea.

1. **Aplică noul kit.** Am dezarhivat ultima versiune în `C:\Users\Alin\Desktop\atlas-repo-kit`
   (dacă nu e acolo, întreabă-mă unde e). Din el copiezi peste proiect, cu suprascriere:
   `.claude/`, `src/`, `scripts/`, `content/schema/`, `.github/`, `CLAUDE.md`, `GHID-START.md`,
   `PROMPT-START.md`, `README.md`, `.gitignore`, `.gitattributes`.
   NU copia restul folderului `content/` (fișierele de date ale site-ului).
2. **Șterge ce nu mai există în kit**, dacă apare în proiect:
   `.claude/agents/verifier.md`, `.claude/agents/scout.md`, `.claude/skills/sanatate/`,
   `.github/workflows/sanatate-saptamanala.yml`, `.devcontainer/`, `content/evidence/`,
   `src/pages/dovezi/`, `src/pages/metodologie.astro`.
3. **Verifică:** `npm ci`, apoi `npm run build`. Dacă pică, repară.
4. **Fă ordine în Git.** Uită-te la `git status`, la branch-uri și la PR-urile deschise
   (`gh pr list`). Știu că există:
   - PR #1, din branch-ul `continut/repo-2026-10-25-altlas-repo` (versiune mai veche a
     configurației; noul kit îl înlocuiește);
   - branch-ul local `continut/repo-2026-10-25-ruflo`, fără conținut publicat.
   Propune-mi cum le curățăm (de exemplu: închidem PR #1, ștergem branch-urile vechi) și pune
   toată actualizarea într-un singur PR nou, „Simplificare: fără verificare”.
5. **La final**, spune-mi pe scurt cum adaug primul repo. Primul candidat la care mă gândeam e
   `https://github.com/ruvnet/ruflo`, dar dacă vezi unul mai simplu pentru un prim test, spune-mi.
