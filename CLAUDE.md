# Kitchen Archive — project guide

A static-first household recipe app: import, clean, rate, cook-log, search, and
share recipes. Public homepage (no login to browse); editing is owner-only.

## Architecture (static-first, no build step)

- **Frontend:** `index.html` + `styles.css` + `app.js`. Plain HTML/CSS/vanilla JS,
  no bundler, no framework. `app.js` runs directly in the browser.
- **Data/auth:** Supabase (Postgres + Auth + Storage + an Edge Function). The
  browser talks to Supabase with the **publishable anon key** in
  `supabase-config.js` (safe to expose; Row Level Security is the real gate).
- **Hosting:** GitHub Pages (repo `loonyuni/recipe_app`), served from `main` at
  `https://loonyuni.github.io/recipe_app/`. Pages' Fastly CDN fronts everything
  for free.
- **Edge function:** `supabase/functions/distill-recipe` (LLM recipe cleanup),
  deployed separately via the Supabase CLI.

## Run locally

```bash
python3 -m http.server 4173      # from repo root, then open http://localhost:4173/
node --check app.js              # syntax check after JS edits (there is no test suite)
```
`?dev=1` shows the import debug packet; `?mock=1` disables LLM calls.

## Deploy

Merge to `main` → GitHub Pages rebuilds (~1 min) → live. **Bump the `?v=` query on
the `styles.css` and `app.js` tags in `index.html` on every deploy** or browsers
serve stale assets (Pages caches HTML for 10 min). The in-app "↻ Reset cache"
button clears local + service-worker caches and hard-reloads for testing.

## Data model (Supabase)

RLS-gated by household membership (`is_household_member`). Key tables: `recipes`
(ingredients/instructions/sections jsonb, `is_public`, `is_hidden`, `slug`,
`image_url`/`image_urls`), `households` (`public_library` flag), `household_members`,
`tags`/`recipe_tags`, `ratings`, `recipe_variants`, `cook_log`.

- **Public read:** anon never touches base tables. It reads the security-definer
  view `public_recipes` (public rows, safe columns, `tags`/`cook_count`/
  `last_cooked_at` aggregated). Visibility = `NOT is_hidden AND (household.public_library OR recipes.is_public)`.
- **RPCs (security definer):** `publish_recipe`, `set_public_library`, `log_cook`.
  Slugs auto-assigned by a `before insert/update` trigger.
- **Storage:** public `recipe-photos` bucket (authed upload, public read).
- **Writes stay authenticated always** — opening read access never opens writes.

### Applying SQL / DB ops

SQL migrations are numbered in `supabase/migrations/` (see its README). Apply via the Supabase
**Management API** SQL endpoint (`POST /v1/projects/<ref>/database/query`), auth
with the CLI token in the macOS keychain (`security find-generic-password -s "Supabase CLI" -a supabase -w`).
Use `curl` (not urllib). Project ref `axajsafyosisflrjqpya`. `created_by` =
`auth.users.id`. Free tier pauses on inactivity (restore via the Management API
`/restore`); a pause invalidates sessions.

## Design system

CSS custom properties are the theme. Current look: **Source Serif 4** as the
reading voice (titles, body, ingredients, steps) + **Inter ALL-CAPS** for labels
(eyebrows, section headers, meta, tags, buttons); flat surfaces (no gradients/
rounding/shadows); near-black text, charcoal-blue rules/labels, coral fills.
Icons are inline Lucide SVG `<symbol>`s in `index.html`.

Design tokens live in a single `:root` at the top of `styles.css`; the
"Editorial component styles" section below skins the main surfaces flat. (A
deeper merge of a few base component rules into that section is still open —
best done with a browser to confirm pixel-parity; see `docs/audit-2026-09-16.md`.)

## Conventions & gotchas

- Recipe permalinks: `?recipe=<slug>`; client-side routing in `app.js`
  (`showRecipe`/`showList`, popstate). Detail view takes over the main column.
- Perf: signed-out load is stale-while-revalidate (localStorage cache →
  `public-recipes.json` CDN snapshot → live Supabase). Regenerate the snapshot
  after importing recipes (curl the view to `public-recipes.json`).
- Escape all interpolated user/recipe values with `esc`/`escAttr` (recipes come
  from arbitrary URLs).
- This file supersedes `AGENT.md` for agent context; `AGENT.md` remains for
  product background.
