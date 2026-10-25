# Atlas de repo-uri

Un site care explică repo-uri GitHub pe înțelesul oricui, cu exemple rulate de un agent AI și
reproduse independent de un al doilea. Construit cu Astro, publicat pe Vercel, întreținut de
subagenți Claude Code.

**Începi de aici:** [GHID-START.md](GHID-START.md)

## Cum funcționează

```
/adauga-repo <link>
      │
researcher ──► verifier ──► editor ──► Pull Request ──► preview Vercel ──► Merge ──► live
 (rulează)    (re-rulează   (scrie în
               de la zero)   content/)
```

## Ce e în proiect

| Cale | Rol |
|---|---|
| `CLAUDE.md` | Regulile proiectului, citite de Claude la fiecare pornire |
| `.claude/agents/` | Subagenții: `researcher`, `verifier`, `editor`, `recipe-architect` |
| `.claude/skills/` | Comenzile: `/adauga-repo`, `/retete`, `/sanatate` |
| `.claude/settings.json` | Permisiuni (instalări automate) și hook-ul de validare |
| `.devcontainer/` | Mediul izolat în care rulează totul |
| `content/` | Tot conținutul site-ului, ca JSON. Doar `editor` scrie aici |
| `content/schema/` | Formatul obligatoriu pentru repo-uri și rețete |
| `scripts/validate.mjs` | Validarea automată a conținutului |
| `src/` | Site-ul Astro |
| `.github/workflows/` | Verificarea PR-urilor și re-verificarea de luni |

## Comenzi utile

```bash
npm run dev        # site-ul local, la http://localhost:4321
npm run validate   # verifică tot conținutul
npm run build      # validare + build, exact ca pe Vercel
```
