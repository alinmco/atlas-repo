# Atlas de repo-uri

Un site care explică repo-uri GitHub pe înțelesul oricui, pe baza documentației lor oficiale:
ce fac, ce servicii plătite pot înlocui, cum se combină și ce idei de afaceri permit.
Construit cu Astro, publicat pe Vercel, întreținut cu subagenți Claude Code.

**Începi de aici:** [GHID-START.md](GHID-START.md). Pentru prima sesiune: [PROMPT-START.md](PROMPT-START.md).

## Cum funcționează

```
/adauga-repo <link>
      │
researcher ──► editor ──► Pull Request ──► preview Vercel ──► Merge ──► live
(citește doc.)  (scrie în content/)
```

Repo-urile nu sunt rulate sau testate. Exemplele vin din documentația oficială, cu link,
iar rețetele sunt propuneri netestate.

## Ce e în proiect

| Cale | Rol |
|---|---|
| `CLAUDE.md` | Regulile proiectului, citite de Claude la fiecare pornire |
| `.claude/agents/` | Subagenții: `researcher`, `editor`, `recipe-architect`, `site-dev` |
| `.claude/skills/` | Comenzile: `/adauga-repo`, `/retete` |
| `.claude/settings.json` | Model, permisiuni și verificarea automată a formatului |
| `content/` | Tot conținutul site-ului, ca JSON. Doar `editor` scrie aici |
| `content/schema/` | Formatul obligatoriu pentru repo-uri și rețete |
| `scripts/validate.mjs` | Verifică formatul conținutului, ca build-ul să nu pice |
| `src/` | Site-ul Astro |
| `.github/workflows/ci.yml` | Verificarea fiecărui Pull Request |

## Comenzi utile

```bash
npm run dev        # site-ul local, la http://localhost:4321
npm run validate   # verifică formatul conținutului
npm run build      # verificare + build, exact ca pe Vercel
```
