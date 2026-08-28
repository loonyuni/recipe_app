# Kitchen Archive

A static-first household recipe archive for importing, cleaning, rating, modifying, and searching recipes.

## Run locally

From this directory:

```bash
python3 -m http.server 4173
```

Open:

```text
http://localhost:4173/
```

Useful modes:

- `http://localhost:4173/?dev=1` — live Claude extraction with a debug packet
- `http://localhost:4173/?mock=1` — no LLM calls; local fallback/extract-only mode

Run a syntax check after JavaScript changes:

```bash
node --check app.js
```

## Current capabilities

- Recipe library with responsive cards and detail drawer
- Search, sorting, dynamic labels, and multi-label filtering
- Recipe CRUD: create, edit, delete
- Link-first recipe importing
- Claude-powered cleanup for pasted text and URLs
- JSON-LD and `og:image` extraction before model processing
- Local mock mode for no-cost testing
- Original and metric ingredient measurements
- Baking-friendly metric-first display mode
- Nutrition/macros display
- Recipe images and galleries
- Family ratings with half-star hover selection
- Local manual reviewers (`Uni` and `Alex`)
- Recipe variants and substitutions
- Duplicate detection by source URL or normalized title
- Local Codex-assisted import workflow
- Browser persistence through `localStorage`

## Codex-assisted imports

Recipes can be pasted or attached directly in Codex instead of using the app’s Claude importer. Codex can write normalized recipe data, SQL updates, and image assets into this repository without making an Anthropic API call.

See [`CODEX_IMPORT.md`](./CODEX_IMPORT.md).

## Supabase setup

Supabase provides authentication, household membership, recipe storage, ratings, and the recipe-distillation Edge Function.

Read [`SUPABASE_SETUP.md`](./SUPABASE_SETUP.md), then run these files in the Supabase SQL Editor:

1. [`supabase-schema.sql`](./supabase-schema.sql)
2. [`supabase-onboarding.sql`](./supabase-onboarding.sql)
3. [`supabase-images.sql`](./supabase-images.sql)
4. [`supabase-permissions-fix.sql`](./supabase-permissions-fix.sql)

The image backfill script for the existing salmon recipe is [`supabase-backfill-images.sql`](./supabase-backfill-images.sql).

The Edge Function is deployed with:

```bash
npx supabase functions deploy distill-recipe
```

Never put a service-role key or Anthropic API key in frontend code. `supabase-config.js` is intentionally ignored by git; use [`supabase-config.example.js`](./supabase-config.example.js) as its template.

## Hosting on GitHub Pages

GitHub Pages hosts the static frontend only. Supabase remains the backend for authentication, database access, and Edge Functions.

The project is already written with relative asset paths so it can work under a GitHub Pages project path.

Basic setup:

```bash
cd /Users/ykuang/kitchen-archive
git init
git add .
git commit -m "Initial Kitchen Archive"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/kitchen-archive.git
git push -u origin main
```

Then enable Pages in the repository settings using the `main` branch. Before deploying, configure the frontend Supabase URL and publishable key through a safe deployment workflow. Do not commit service-role or Anthropic secrets.

After deployment, add the GitHub Pages URL to Supabase Auth’s allowed site/redirect URLs.

## Recommended next priorities

1. Resolve the remaining Supabase permission/sync path so cloud loading never hides local Codex imports.
2. Add an authenticated GitHub Pages deployment workflow that injects the public Supabase config.
3. Add import history and confidence/review status.
4. Add reliable ingredient matching and nutrition data sources.
5. Add export/backup before implementing semantic search.
