# Ghid de start: de la zero la site publicat

Ghidul presupune că n-ai mai folosit Claude Code. Urmează pașii în ordine. Prima configurare
durează cam 1-2 ore. După aceea, adăugarea unui repo înseamnă o singură comandă.

Cuvintele noi sunt explicate în **Glosar**, la final.

---

## Faza 1. Conturile (o singură dată)

1. **GitHub** – cont gratuit pe [github.com](https://github.com). Aici stă codul site-ului.
2. **Vercel** – cont gratuit pe [vercel.com](https://vercel.com). Intră cu „Continue with GitHub”,
   ca cele două conturi să fie legate din start. Planul gratuit (Hobby) e pentru proiecte personale.
3. **Claude** – Claude Code cere un abonament Pro, Max, Team sau Enterprise (planul gratuit nu
   îl include). Analiza unui repo, cu doi agenți care rulează cod, consumă destul de mult din limita
   de utilizare, așa că la început adaugă unul sau două repo-uri o dată.

## Faza 2. Programele de pe calculator (o singură dată)

Instalează, în ordinea asta:

1. **Git** – [git-scm.com/downloads](https://git-scm.com/downloads)
2. **VS Code** – [code.visualstudio.com](https://code.visualstudio.com)
3. **Docker Desktop** – [docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop)
   Pornește-l după instalare și lasă-l deschis când lucrezi la proiect.
4. În VS Code, din bara din stânga (Extensions), instalează extensia **Dev Containers** (de la Microsoft).

**De ce Docker?** Agenții rulează cod descărcat de pe GitHub și instalează singuri tot ce le
trebuie. Docker le dă un „calculator separat” (containerul), complet izolat de fișierele tale.
Orice s-ar întâmpla acolo, calculatorul tău nu e atins. Claude Code, Node, Python și celelalte
unelte se instalează automat în container, nu pe calculatorul tău.

## Faza 3. Urcă proiectul pe GitHub

1. Pe github.com, apasă **New repository**. Nume: `atlas-repo`. Lasă-l gol (fără README).
   Apasă **Create repository**.
2. Dezarhivează kit-ul într-un folder, de exemplu `Documente/atlas-repo`.
3. Deschide folderul în VS Code (**File → Open Folder**).
4. Deschide un terminal în VS Code (**Terminal → New Terminal**) și rulează, pe rând
   (înlocuiește `UTILIZATORUL-TAU` cu numele tău de pe GitHub):

   ```bash
   git init
   git add .
   git commit -m "Pornire: kit Atlas de repo-uri"
   git branch -M main
   git remote add origin https://github.com/UTILIZATORUL-TAU/atlas-repo.git
   git push -u origin main
   ```

   Dacă Git îți cere numele și emailul, rulează întâi:
   `git config --global user.name "Numele Tău"` și `git config --global user.email "emailul@tau.ro"`.

## Faza 4. Deschide proiectul în container

1. În VS Code, apasă `Ctrl+Shift+P` (pe Mac `Cmd+Shift+P`) și scrie **Dev Containers: Reopen in Container**.
2. Prima dată durează 5-10 minute: se construiește containerul și se instalează totul.
   În colțul din stânga jos scrie apoi „Dev Container: atlas-repo”. De acum lucrezi mereu așa.
3. Deschide un terminal nou (**Terminal → New Terminal**). Acesta rulează în container.

## Faza 5. Pornește Claude Code

În terminalul din container:

```bash
gh auth login
```
Alege **GitHub.com → HTTPS → Login with a web browser** și urmează pașii. Asta îi permite lui
Claude să deschidă Pull Request-uri în numele tău.

Apoi:

```bash
claude
```

1. La prima pornire, se deschide browserul ca să te autentifici cu contul Claude.
2. Claude te întreabă dacă ai încredere în acest folder. Răspunde **da**: altfel nu se încarcă
   agenții, comenzile și regulile din proiect.
3. Verifică instalarea: întreabă „Ce subagenți și ce skill-uri ai în acest proiect?”.
   Ar trebui să vezi `researcher`, `verifier`, `editor`, `recipe-architect` și comenzile
   `/adauga-repo`, `/retete`, `/sanatate`.

Ca să ieși din Claude Code, scrie `/exit` sau apasă `Ctrl+C` de două ori.

## Faza 6. Conectează Vercel

1. Pe [vercel.com](https://vercel.com), apasă **Add New → Project**.
2. La „Import Git Repository”, alege `atlas-repo` (dacă nu apare, apasă „Adjust GitHub App
   Permissions” și dă-i acces la repo).
3. Vercel detectează singur Astro. Nu schimba nimic la comenzi.
4. Deschide **Environment Variables** și adaugă:
   - Name: `PUBLIC_SITE_REPO`
   - Value: `UTILIZATORUL-TAU/atlas-repo`

   (folosită de butonul „Vreau să lucrez la asta” de pe pagina de idei)
5. Apasă **Deploy**. În 1-2 minute ai site-ul live, gol deocamdată, la o adresă `.vercel.app`.
   Din **Settings → Domains** poți adăuga mai târziu un domeniu propriu.

De acum: tot ce ajunge pe `main` se publică automat. Fiecare Pull Request primește un link de
**preview** separat, ca să vezi schimbările înainte să fie live.

## Faza 7. Protejează site-ul live

Pe GitHub, în repo: **Settings → Rules → Rulesets → New ruleset → New branch ruleset**.

- Ruleset name: `protejare main`
- Enforcement status: **Active**
- Target branches: **Add target → Include default branch**
- Bifează **Require a pull request before merging**
- Bifează **Require status checks to pass**, apoi **Add checks** și alege `validate-and-build`
  (apare în listă după primul Pull Request; poți reveni să-l adaugi atunci)
- Bifează **Block force pushes**
- **Create**

Așa, nimic nu ajunge live fără să treacă validarea și fără să apeși tu „Merge”.

## Faza 8. Primul repo

În Claude Code (în container):

```
/adauga-repo https://github.com/UTILIZATOR/REPO
```

Poți da și mai multe linkuri deodată, separate prin spațiu.

**Ce se întâmplă:** `researcher` investighează și rulează exemplele, `verifier` le re-rulează de la
zero, `editor` scrie fișierele site-ului, apoi se deschide un Pull Request. Durează de obicei
între 15 și 60 de minute per repo. Poți lăsa calculatorul să lucreze.

**Dacă Claude cere o permisiune:** citește ce vrea să facă. Pentru comenzi obișnuite din
proiect, poți alege opțiunea care nu mai întreabă data viitoare. Instalările de pachete sunt deja
permise automat.

**La final primești linkul Pull Request-ului.** Pe pagina lui:
1. Așteaptă comentariul Vercel cu linkul de preview (1-2 minute) și uită-te pe site.
2. Verifică să apară bifa verde la `validate-and-build`.
3. Dacă îți place, apasă **Merge pull request → Confirm merge**. Site-ul live se actualizează
   în 1-2 minute.

Apoi, în terminal, întoarce-te pe `main` actualizat: `git checkout main && git pull`.
(Comanda `/adauga-repo` face oricum asta la pornire.)

## Faza 9. Re-verificarea automată de luni dimineață

1. În Claude Code, rulează `/install-github-app` și urmează pașii. Când te întreabă de autentificare,
   alege abonamentul Claude (token de lungă durată). Claude salvează automat secretul
   `CLAUDE_CODE_OAUTH_TOKEN` în repo.
2. Când îți propune fișiere de workflow, le poți sări: proiectul are deja
   `.github/workflows/sanatate-saptamanala.yml`.
3. Test: pe GitHub, tab-ul **Actions → Sănătate săptămânală → Run workflow**.

De acum, în fiecare luni, Claude re-verifică ce e mai vechi de 90 de zile și îți deschide un PR.
Tu doar verifici preview-ul și apeși Merge.

Dacă pe PR-ul automat nu pornește verificarea `validate-and-build`, închide PR-ul și redeschide-l
(butoanele **Close** și **Reopen** de jos).

## Faza 10. Rețete și idei (după primele 5 repo-uri)

```
/retete
```

Poți adăuga o direcție: `/retete concentrează-te pe unelte audio`.

Pentru un raport fără modificări: `/sanatate doar raport`.

---

## Comenzile tale, pe scurt

| Comanda | Ce face |
|---|---|
| `/adauga-repo <link> [<link> ...]` | Adaugă repo-uri noi, cap-coadă, până la Pull Request |
| `/retete` | Caută combinații între repo-uri și idei de proiecte noi |
| `/sanatate` | Re-verifică ce e vechi și propune repo-uri noi |
| `/sanatate doar raport` | Doar raportul, fără modificări |

Poți vorbi și liber cu Claude în proiect. De exemplu: „Fă butonul de căutare mai mare” sau
„De ce a fost respins repo-ul X?”. Regulile din `CLAUDE.md` se aplică mereu.

## Probleme frecvente

| Ce vezi | Ce faci |
|---|---|
| „Reopen in Container” dă eroare | Verifică dacă Docker Desktop e pornit, apoi încearcă din nou |
| `claude: command not found` în container | Închide terminalul și deschide altul nou. Dacă persistă: `curl -fsSL https://claude.ai/install.sh \| bash` |
| Claude nu cunoaște `/adauga-repo` | Ieși (`/exit`) și pornește `claude` din folderul proiectului. Confirmă că ai încredere în folder |
| PR-ul are X roșu la `validate-and-build` | Scrie în Claude: „Repară erorile din PR-ul deschis” |
| Un repo a fost respins de două ori | E normal pentru unele repo-uri (instalare complicată, cer hardware special). Motivul e în raport |
| Ai atins limita de utilizare Claude | Așteaptă resetarea limitei și continuă cu mai puține repo-uri o dată |

## Glosar

- **Repo (repository)** – un proiect pe GitHub: codul plus istoricul lui.
- **Commit** – o „salvare” a modificărilor, cu un mesaj.
- **Branch** – o copie de lucru paralelă. `main` e varianta oficială, cea publicată.
- **Pull Request (PR)** – propunerea de a aduce modificările dintr-un branch în `main`. Le vezi,
  le verifici și apeși „Merge” ca să le accepți.
- **Preview** – o versiune temporară a site-ului, construită de Vercel pentru fiecare PR.
- **Container** – un mediu izolat, ca un calculator separat, în care rulează Claude și agenții.
- **Subagent** – un asistent specializat, cu instrucțiunile lui, pe care Claude îl pornește
  pentru o sarcină anume. Aici: `researcher`, `verifier`, `editor`, `recipe-architect`.
- **Skill** – o comandă salvată (ex: `/adauga-repo`) care descrie un flux de lucru complet.
- **Hook** – o acțiune automată. Aici, după fiecare fișier scris în `content/`, rulează validarea.
- **CLAUDE.md** – regulile proiectului, citite de Claude la fiecare pornire.
