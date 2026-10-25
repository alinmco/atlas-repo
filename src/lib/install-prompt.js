// Construiește promptul de instalare din datele unui repo.
export function buildInstallPrompt(repo) {
  const reqs = repo.tech_sheet?.requirements;
  const hasReqs = Array.isArray(reqs) && reqs.length > 0;
  const step2 = hasReqs
    ? `2. Verifică ce am deja instalat (sistemul de operare, versiunile programelor). Instalează ce lipsește din cerințe: ${reqs.join("; ")}.`
    : "2. Verifică ce am deja instalat (sistemul de operare, versiunile programelor). Instalează ce lipsește din cerințele trecute în documentație.";

  return `Instalează și configurează repo-ul ${repo.name} (${repo.repo_url}) pe acest calculator, ca să fie gata de folosit.

Lucrează singur, fără să-mi pui întrebări, după acești pași:
1. Citește documentația oficială: README-ul, ghidul de instalare și notele de versiune ale repo-ului. Folosește DOAR comenzile de acolo și nu inventa altele.
${step2}
3. Alege varianta de instalare potrivită pentru mediul meu (de exemplu, pluginul pentru Claude Code, dacă documentația îl oferă) și instalează repo-ul.
4. Fă configurarea recomandată în documentație, ca totul să funcționeze corect.
5. Verifică instalarea cu exemplul sau comanda de test din documentație. Dacă apare o eroare, caută soluția în documentație și în issues-urile repo-ului, repară și încearcă din nou.

Te oprești și mă întrebi doar dacă ai nevoie de o parolă, o cheie API, un cont, o plată sau drepturi de administrator. Nu le inventa; spune-mi exact unde trebuie puse.

La final, spune-mi în 3-5 puncte simple: ce ai instalat, unde, cum pornesc programul și ce mai am de făcut eu.`;
}
