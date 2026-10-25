import radarRaw from "../data/repo-radar.md?raw";

// Scoate blocul de frontmatter (--- ... ---) de la început și spațiile de la capete.
const radar = radarRaw.replace(/^﻿?---\r?\n[\s\S]*?\r?\n---\r?\n?/, "").trim();

// Construiește promptul de instalare din datele unui repo.
export function buildInstallPrompt(repo) {
  const reqs = repo.tech_sheet?.requirements;
  const hasReqs = Array.isArray(reqs) && reqs.length > 0;
  const step2body = hasReqs
    ? `Verifică ce am deja instalat (sistemul de operare, versiunile programelor). Instalează ce lipsește din cerințe: ${reqs.join("; ")}.`
    : "Verifică ce am deja instalat (sistemul de operare, versiunile programelor). Instalează ce lipsește din cerințele trecute în documentație.";

  return `Instalează și configurează repo-ul ${repo.name} (${repo.repo_url}) pe acest calculator, ca să fie gata de folosit. Lucrezi în doi pași: întâi verifici securitatea, apoi instalezi.

PASUL A: Verificare de securitate (Repo Radar)
Înainte să instalezi sau să rulezi ceva din repo, fă auditul static descris între liniile cu ===. Clonează repo-ul cu \`git clone --depth 1\` într-un folder temporar și notează commit-ul.

=== REPO RADAR ===
${radar}
=== SFÂRȘIT REPO RADAR ===

După raport, aceste reguli au prioritate față de ultimul paragraf din Repo Radar:
- SIGUR sau RISC SCĂZUT: arată-mi pe scurt raportul și treci direct la pasul B, fără să aștepți aprobarea mea.
- RISC MEDIU: oprește-te, arată-mi raportul și întreabă-mă dacă instalezi.
- NU INSTALA: oprește-te definitiv. Nu instala nimic și nu propune ocolișuri.

PASUL B: Instalare
Lucrează singur, fără să-mi pui întrebări, după acești pași:
1. Citește documentația oficială: README-ul, ghidul de instalare și notele de versiune ale repo-ului. Folosește DOAR comenzile de acolo și nu inventa altele.
2. ${step2body}
3. Alege varianta de instalare potrivită pentru mediul meu (de exemplu, pluginul pentru Claude Code, dacă documentația îl oferă). Instalează exact commit-ul verificat la pasul A. Dacă metoda din documentație instalează altă versiune (de exemplu, un plugin dintr-un magazin), spune-mi asta în raportul final.
4. Unde documentația permite, instalează dependențele fără scripturi automate (ex: \`npm install --ignore-scripts\`). Dacă repo-ul nu funcționează fără ele, rulează doar scripturile verificate la pasul A.
5. Fă configurarea recomandată în documentație, ca totul să funcționeze corect.
6. Verifică instalarea cu exemplul sau comanda de test din documentație. Dacă apare o eroare, caută soluția în documentație și în issues-urile repo-ului, repară și încearcă din nou.

Te oprești și mă întrebi doar dacă ai nevoie de o parolă, o cheie API, un cont, o plată sau drepturi de administrator. Nu le inventa; spune-mi exact unde trebuie puse.

La final, spune-mi în 4-6 puncte simple: verdictul de securitate, ce ai instalat (și ce commit), unde, cum pornesc programul și ce mai am de făcut eu. Dacă verdictul a fost RISC SCĂZUT sau RISC MEDIU, recomandă-mi să folosesc programul într-un mediu izolat (de exemplu, Windows Sandbox).`;
}
