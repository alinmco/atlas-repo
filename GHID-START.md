# Ghid de start

Lucrezi local, pe Windows, din aplicația **Claude desktop**, secțiunea **Code**. Ghidul
pornește de la situația ta: proiectul e deja pe GitHub (`alinmco/atlas-repo`), legat de
Vercel, în folderul `C:\Users\Alin\Desktop\atlas-repo`.

Cuvintele noi sunt explicate în **Glosar**, la final.

---

## Pasul 1. Programele de pe calculator (o singură dată)

Deschide **PowerShell** (din meniul Start) și rulează, pe rând:

```powershell
winget install Git.Git
winget install OpenJS.NodeJS.LTS
winget install GitHub.cli
```

- **Git**: salvează istoricul proiectului și îl urcă pe GitHub.
- **Node.js**: construiește site-ul pe calculatorul tău.
- **GitHub CLI** (`gh`): îi permite lui Claude să deschidă Pull Request-uri.

Închide PowerShell, deschide-l din nou și conectează-te la GitHub:

```powershell
gh auth login
```

Alege **GitHub.com → HTTPS → Login with a web browser**. Copiezi codul afișat în terminal
(de forma `ABCD-1234`) în pagina din browser.

Dacă Git îți cere numele și emailul, rulează întâi:
`git config --global user.name "Alin"` și `git config --global user.email "alin.magda@gmail.com"`.

Docker și containerul nu mai sunt necesare: agenții doar citesc repo-urile, nu le rulează.

## Pasul 2. Deschide proiectul în Claude

1. Deschide aplicația **Claude desktop** și intră în secțiunea **Code**.
2. Pornește o sesiune nouă și alege folderul `C:\Users\Alin\Desktop\atlas-repo`.
3. Dacă te întreabă dacă ai încredere în folder, răspunde **da**. Altfel nu se încarcă
   agenții, comenzile și regulile proiectului.
4. Prima dată, lipește promptul din `PROMPT-START.md`. Claude verifică situația proiectului
   și îți spune ce mai e de făcut.

Verificare rapidă: întreabă-l „Ce subagenți și ce comenzi ai în acest proiect?”. Ar trebui să
vezi `researcher`, `editor`, `recipe-architect`, `site-dev` și comenzile `/adauga-repo` și
`/retete`.

## Pasul 3. Adaugă un repo

În Claude scrii:

```
/adauga-repo https://github.com/UTILIZATOR/REPO
```

Poți da și mai multe linkuri deodată, separate prin spațiu.

1. **Primești planul**, în puncte scurte. Răspunzi `da` sau spui ce vrei altfel.
2. `researcher` citește repo-ul și documentația (nu rulează nimic), apoi `editor` scrie pagina.
   Durează cam 5-15 minute per repo.
3. **Primești linkul Pull Request-ului.** Pe pagina lui:
   - aștepți comentariul Vercel cu linkul de **preview** și te uiți pe site;
   - aștepți bifa verde la `validate-and-build`;
   - apeși **Merge pull request → Confirm merge**. Site-ul live se actualizează în 1-2 minute.

## Pasul 4. Rețete și idei (după primele 4 repo-uri)

```
/retete
```

Poți adăuga o direcție: `/retete concentrează-te pe unelte audio`. Rețetele apar pe site ca
„propuse, netestate”.

## Schimbări la site

Vorbești normal: „fă căutarea mai mare pe mobil”, „adaugă o pagină de contact”. Claude îți
arată planul, apoi agentul `site-dev` face modificarea, tot printr-un Pull Request.

---

## Comenzile tale, pe scurt

| Comanda | Ce face |
|---|---|
| `/adauga-repo <link> [<link> ...]` | Adaugă repo-uri noi pe site, până la Pull Request |
| `/retete` | Propune combinații între repo-uri și idei de proiecte noi |

## Opțional: site-ul vizibil doar pentru tine

Gratuit, din Vercel: proiectul → **Settings → Deployment Protection** → activezi **Vercel
Authentication** și alegi **All Deployments** → **Save**. Site-ul se deschide doar după ce te
loghezi în contul Vercel. Dacă repo-ul de pe GitHub e public, conținutul se vede oricum acolo.

## Probleme frecvente

| Ce vezi | Ce faci |
|---|---|
| Claude nu cunoaște `/adauga-repo` | Verifică dacă sesiunea e deschisă pe folderul `atlas-repo` și că ai confirmat încrederea în folder |
| `gh: command not found` sau `node` nu e găsit | Închide și redeschide aplicația Claude după instalări |
| PR-ul are X roșu la `validate-and-build` | Scrie în Claude: „Repară erorile din PR-ul deschis” |
| `git push` e refuzat pe `main` | E normal, `main` e protejat. Totul merge prin Pull Request |
| Ai atins limita de utilizare Claude | Aștepți resetarea și continui cu mai puține repo-uri o dată |

## Glosar

- **Repo (repository)**: un proiect pe GitHub, adică codul plus istoricul lui.
- **Commit**: o „salvare” a modificărilor, cu un mesaj.
- **Branch**: o copie de lucru paralelă. `main` e varianta oficială, cea publicată.
- **Pull Request (PR)**: propunerea de a aduce modificările dintr-un branch în `main`. Le
  verifici și apeși „Merge” ca să le accepți.
- **Preview**: o versiune temporară a site-ului, construită de Vercel pentru fiecare PR.
- **Subagent**: un asistent specializat, cu instrucțiunile lui, pe care Claude îl pornește
  pentru o sarcină anume.
- **Skill / comandă**: o comandă salvată (ex: `/adauga-repo`) care descrie un flux de lucru.
- **Hook**: o acțiune automată. Aici, după fiecare fișier scris în `content/`, se verifică
  formatul lui.
- **CLAUDE.md**: regulile proiectului, citite de Claude la fiecare pornire.
