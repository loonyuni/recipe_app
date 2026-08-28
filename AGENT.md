# Kitchen Archive — Agent Context

## Product

Kitchen Archive is a shared household recipe archive. It stores recipes imported from webpages, pasted text, PDFs/OCR, and personal notes.

The product should make recipes:

- searchable and scalable;
- easy to import and clean;
- readable in original measurements with metric alternatives where useful;
- tagged with dynamically created labels;
- rated manually by household members;
- editable, versionable, and deduplicated;
- optionally enriched with images, nutrition, macros, and semantic search later.

The user prefers a fast, practical workflow over a complicated admin system.

## Current architecture

- Static frontend: `index.html`, `styles.css`, `app.js`
- Local persistence: browser `localStorage`
- Cloud persistence: Supabase Postgres/Auth/Data API
- Recipe extraction: Supabase Edge Function at `supabase/functions/distill-recipe/index.ts`
- LLM provider: Anthropic Claude, configured through Supabase secrets
- Current default model: Claude Haiku (`claude-haiku-4-5-20251001`)
- Images: files under `assets/` plus image URLs

The frontend is intentionally static-first and can run without a build system.

## Run locally

From the repository root:

```bash
python3 -m http.server 4173
```

Open:

```text
http://localhost:4173/
```

For import debugging:

```text
http://localhost:4173/?dev=1
```

Modes:

- Normal URL: use the live extraction path.
- `?dev=1`: use live extraction and show the debug packet.
- `?mock=1`: explicitly disable Claude and use local/extract-only behavior.

If the UI still shows `[object Object]`, missing image fields, or old controls, the browser is serving an older frontend bundle. Check the URL, restart the local server, and hard-refresh. `index.html` uses cache-busting query parameters for the JS/CSS files.

## Important files

- `app.js` — application state, rendering, import flow, ratings, CRUD, Supabase integration
- `index.html` — application shell and modal/drawer markup
- `styles.css` — visual system and responsive layout
- `supabase-schema.sql` — initial database schema and RLS policies
- `supabase-onboarding.sql` — household creation/onboarding helpers
- `supabase-permissions-fix.sql` — Data API grants
- `supabase-images.sql` — image and measurement columns
- `supabase-backfill-images.sql` — one-time image update for the existing salmon recipe
- `supabase-config.js` — local Supabase URL/key; ignored by git
- `supabase-config.example.js` — safe configuration template
- `SUPABASE_SETUP.md` — setup instructions
- `assets/recipes/one-pan-salmon-broccoli-bake/` — personal salmon recipe photos

Use `apply_patch` for text edits. Do not overwrite unrelated user changes.

## Supabase

Project:

- Project ref: `axajsafyosisflrjqpya`
- Project name: Bell Recipes

The frontend may contain only the publishable/anon key. Never put a Supabase service-role key or an Anthropic key in frontend code.

The Edge Function is deployed with:

```bash
npx supabase functions deploy distill-recipe
```

The function may warn that Docker is not running; deployment can still succeed.

If the app reports:

```text
permission denied for table household_members
```

the Data API role grants have not been applied correctly. “Automatically expose new tables” does not repair every existing table. Rerun `supabase-permissions-fix.sql` in the Supabase SQL Editor. RLS policies still control actual row access.

## Recipe import behavior

The import flow is link-first because most recipes come from an external artifact.

The Edge Function:

1. fetches a source URL when supplied;
2. extracts Recipe JSON-LD and `og:image` when available;
3. optionally calls Claude to remove stories, ads, navigation, and other filler;
4. returns structured recipe data;
5. falls back to local extraction if the model is unavailable.

Claude should be the normal cleanup mechanism. Do not overfit the local fallback parser to one pasted recipe format.

The model output should contain:

```json
{
  "title": "string",
  "description": "string",
  "servings": 4,
  "time": "45 minutes",
  "ingredients": ["plain ingredient strings"],
  "instructions": ["plain instruction strings"],
  "tags": ["plain strings"],
  "measurementMode": "both",
  "imageUrl": "optional URL"
}
```

The client normalizes defensive variants so objects do not render as `[object Object]`.

## Measurements

Preserve the source measurement. Do not silently replace it.

The UI supports:

- original measurements only;
- original plus metric when available;
- metric-first for baking and similar recipes.

Ingredient records may contain:

```json
{
  "original": "1/2 cup flour",
  "metric": "60 g flour",
  "name": "flour",
  "preparation": ""
}
```

## Images

The existing salmon photos are:

```text
assets/recipes/one-pan-salmon-broccoli-bake/IMG_7622.JPG
assets/recipes/one-pan-salmon-broccoli-bake/IMG_7627.JPG
assets/recipes/one-pan-salmon-broccoli-bake/IMG_7628.JPG
```

Use relative asset paths so the site also works under a GitHub Pages project path.

The recipe drawer displays the full gallery. Recipe tiles use the final/plated image as the preview when multiple images exist.

Existing recipes can be matched by title and automatically backfilled with these images. `supabase-backfill-images.sql` is also available for an explicit database update.

## Deduplication

Reimporting a recipe must not create a second copy.

Current behavior:

1. normalize and compare source URLs;
2. fall back to normalized title matching;
3. update the existing recipe;
4. preserve ratings and variants;
5. update images and source data;
6. show a “no duplicate created” message.

Imported recipes should retain `sourceUrl` whenever available.

## Ratings

Ratings are manually entered for now and do not need to be tied to a login.

Default local reviewers:

- Uni
- Alex

`loonyuni` must not appear in the reviewer dropdown.

Ratings support half-star increments through a hover/focus/click star control. Stored scores use numeric values from `0.5` to `5`.

Manual ratings are kept in local storage. Cloud ratings are used when a matching Supabase household member exists.

## CRUD and recipe detail

Recipe detail supports:

- edit;
- delete;
- image gallery;
- nutrition display;
- original/metric ingredients;
- family ratings;
- recipe variants/substitutions;
- source information.

Do not remove existing ratings or variants when updating an imported recipe.

## Low-cost “Codex import” workflow

The user may paste a recipe into this ChatGPT/Codex session instead of invoking Claude through the app.

When asked to add a recipe from chat:

1. parse and clean the supplied text or URL;
2. preserve original measurements and add metric alternatives where reliable;
3. identify title, servings, time, ingredients, instructions, tags, source, and images;
4. estimate nutrition only when enough information exists, and mark it as an estimate;
5. check for a duplicate by source URL/title;
6. update an existing recipe rather than creating a duplicate;
7. modify the local repo or provide the exact Supabase SQL/update needed;
8. avoid calling Anthropic unless the user specifically asks for app-side Claude processing.

This chat-based path is intended to reduce API cost during development and curation. The app-side Claude path remains available for self-service imports.

## Security and privacy

- Never print or repeat API keys.
- Never commit `supabase-config.js`.
- Never place service-role or Anthropic secrets in frontend JavaScript.
- Treat pasted recipe text and source URLs as user-controlled input.
- Avoid broad anonymous database grants unless RLS is enabled and the tradeoff is understood.

## Verification checklist

After JavaScript changes:

```bash
node --check app.js
```

For import changes, verify:

- normal mode calls the Edge Function;
- `?dev=1` shows a live debug packet;
- `?mock=1` makes no Claude call;
- ingredient/time objects never render as `[object Object]`;
- duplicate imports update the existing recipe;
- image galleries and tile previews render;
- ratings support half-stars and persist locally;
- existing ratings and variants survive edits.

