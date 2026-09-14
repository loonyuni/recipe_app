# Recipe browsing + open-access redesign

Date: 2026-09-14
Status: draft for review
Repo: kitchen-archive (github.com/loonyuni/recipe_app), static SPA on GitHub Pages + Supabase.

## Goal

Two connected changes to how recipes are viewed and shared:

1. **Better recipe navigation.** Replace the side-drawer overlay with a full in-page detail view (breadcrumb, related recipes), add a "recently viewed" list, and make the "Family favorites" / "Recently cooked" tabs meaningful.
2. **Open access for demos.** Let a logged-out visitor browse the whole library read-only, add a real "Made this" cook counter, and add a low-friction magic-link/OTP login for the owner.

Non-goals: comments, multi-user social features, offline-first rework, redesigning import.

## Current state (what we build on)

- SPA: `index.html` shell (sidebar + `main`), `app.js` renders from `state`. `state.view ∈ {library, favorites, recent, pastry}`; `render()` = renderLabels + renderFilters + renderRecipes + updateReadOnlyChrome.
- Recipe open today = `openDrawer(id, {updateUrl})` overlay (`#recipe-drawer`), `closeDrawer()`. Permalink `?recipe=<slug>` already syncs via pushState/popstate (prior work).
- Data: Supabase `recipes` (RLS by household membership). Public sharing already exists: `is_public` + `slug` columns, `public_recipes` security-definer view (safe columns only), `publish_recipe(uuid, boolean)` RPC. Read-only mode via `isReadOnly()` / `canEditRecipe()`; anon loads `loadPublicRecipes()` from the view.
- Ratings: `ratings` table (has `cooked_at`). "Family favorites" = avg rating ≥ 4.5. "Recently cooked" = `recipe.cooked > 0` — but `cooked` is only set on the 6 hardcoded seed recipes and never incremented, so it is dead for real data.

## Design

### A. Full in-page detail view (replaces the drawer)

- Introduce `state.mode ∈ {'list','detail'}` alongside the existing `state.activeRecipe`.
- `render()` branches: `detail` + activeRecipe → render detail into `main`; else render the list. index.html gets two containers in `main`: `#list-view` (existing hero/search/grid sections) and `#detail-view` (new), toggled with `[hidden]`.
- Refactor the drawer's inner markup builder out of `openDrawer` into a pure `recipeDetailHtml(recipe)` + `wireRecipeDetail(recipe, root)` pair, reused by the detail view. Remove the `#recipe-drawer` overlay.
- `showRecipe(recipe)`: set mode=detail, render, push `?recipe=<slug>`, record a recent view, scroll to top. `showList()`: mode=list, clear the `recipe` param.
- **Breadcrumb** at the top of the detail view: `All recipes › <title>`; the crumb link calls `showList()`.
- **Related recipes** strip at the bottom: recipes sharing ≥ 1 tag, excluding self, capped at 6, each card calls `showRecipe`.
- Card clicks and popstate call `showRecipe` / `showList` instead of `openDrawer` / `closeDrawer`.
- Mobile: a full page reads better than an overlay, so this also improves small screens.

### B. Recently viewed (sidebar)

- localStorage key `kitchen-archive-recent-views`: array of `{ slug, id, title, ts }`, most-recent first, deduped by id, capped at 5.
- Recorded on every `showRecipe`. Rendered in the sidebar under a "Recently viewed" heading; entries call `showRecipe`.
- Works signed-in and anon (anon sees only what the public view returns).

### C. "Made this" + cook log → real "Recently cooked"

- New table `public.cook_log`: `id uuid pk`, `recipe_id uuid fk recipes on delete cascade`, `cooked_by uuid fk auth.users on delete set null`, `cooked_at timestamptz default now()`, `note text default ''`. Index on `(recipe_id, cooked_at desc)`.
- RLS: household members may `select`/`insert`/`delete` cook logs for recipes in their household (membership check through the recipe's household). No anon access to the table.
- `log_cook(target_recipe uuid)` security-definer RPC: membership-checked, inserts a row `cooked_by = auth.uid()`, returns the new count.
- **Public exposure = aggregate only.** Extend `public_recipes` view with `cook_count` (count of cook_log rows) and `last_cooked_at` (max). Individual rows (who/when/note) stay private.
- Frontend: a **"Made this"** button on the detail view (authed owners only). On click → `log_cook` → optimistic count bump. Display `Made N times · last made <relative>` on the detail page **and a `Made N×` badge on the grid cards** (decision: badge on cards too).
- Household load computes per-recipe `cookCount` / `lastCookedAt` (one aggregated query). Anon reads them from the view.
- **"Recently cooked" tab** = recipes with `cookCount > 0`, sorted by `lastCookedAt desc`. Update `filteredRecipes()` to use these instead of the dead `cooked` field. Seed recipes keep working (map their static `cooked` into `cookCount` for the offline/no-cloud case).

### D. Family favorites

- Keep rating-driven (avg ≥ 4.5). Add an empty-state: "Rate a recipe 4.5★ or higher to see it here." No manual favorite toggle for now (YAGNI; revisit if it feels off).

### E. Whole library public, read-only (demo mode)

- Add `households.public_library boolean not null default false` and `recipes.is_hidden boolean not null default false` (per-recipe override).
- **Public visibility rule** (rewrite `public_recipes` view, joining `households`):
  `NOT r.is_hidden AND (h.public_library OR r.is_public)`.
  So with `public_library` on, the whole library is public except recipes explicitly hidden; with it off, behavior is exactly today's per-recipe sharing.
- **Slugs for everything.** With `public_library` on, every visible recipe needs a permalink. Add a `before insert or update of title` trigger on `recipes` that assigns a unique slug from the title when `slug is null` (reusing the same slugify + uniqueness loop as `publish_recipe`). This also backfills imports (e.g. the two recipes just added have no slug yet). One-time backfill for existing rows in the migration.
- Owner controls on the detail view (decision: **hide-only**): show "Copy link" + "Hide from public" (toggles `is_hidden`). The per-recipe "Share / Stop sharing" buttons are removed from the UI since demo mode makes the whole library public. The `is_public` column and `publish_recipe` RPC stay in the DB (harmless, and available if demo mode is later turned off), just not surfaced in the UI.
- **Settings toggle** (decision: **small inline panel**). Wire the existing sidebar "⚙ Settings" button to a lightweight popover with a "Public library (demo mode)" switch (owner only), backed by a `set_public_library(enabled boolean)` security-definer RPC scoped to the caller's household (there is no `households` update RLS policy today, so an RPC is cleaner than adding one).
- Enable `public_library = true` for the owner's household in the migration (that is the whole point of the request), leaving `is_hidden` for exceptions.
- **Privacy note:** this makes every non-hidden recipe readable by anyone with the link on a public site. Reversible by flipping the switch off. Called out explicitly; the owner opted in.

### F. Magic-link / OTP login (owner convenience)

- Add an "Email me a code" path in the auth modal using Supabase `signInWithOtp({ email })` then `verifyOtp({ email, token, type: 'email' })` (6-digit code, no cross-device redirect needed, easier than a link on someone else's phone). Keep password login as-is.
- Requires nothing new server-side beyond the default email auth already in use (password login works, so email auth is enabled). Site URL is already registered in Supabase Auth.

## Data model / migration (`supabase-open-browsing.sql`)

1. `households.public_library boolean not null default false`.
2. `recipes.is_hidden boolean not null default false`.
3. `cook_log` table + indexes + RLS policies + `authenticated` grants.
4. Slug-assignment trigger + function; backfill slugs for existing rows.
5. Rewrite `public_recipes` view: join households, apply the visibility rule, add `cook_count` + `last_cooked_at`.
6. RPCs: `log_cook(uuid)`, `set_public_library(boolean)`. (`set_recipe_hidden` handled by a normal authenticated UPDATE under existing recipes RLS — no new RPC needed.)
7. Data: set `public_library = true` for household `baf66ac8-...`.

Applied via the Supabase Management API SQL path (documented in memory). All additive; backward compatible with the current live frontend (new columns default safe; view keeps returning a valid shape).

## Frontend changes (`app.js`, `index.html`, `styles.css`)

- `index.html`: `#list-view` / `#detail-view` containers; sidebar "Recently viewed" block; settings panel markup; auth-modal OTP fields. Bump the `?v=` cache-bust on JS/CSS.
- `app.js`: `state.mode`; `render()` branch; `recipeDetailHtml` / `wireRecipeDetail`; `showRecipe` / `showList`; recent-views store; related-recipe computation; "Made this" wiring + cook-count load; `filteredRecipes()` updates (favorites empty-state, recent by lastCookedAt); public_library-aware owner controls; settings toggle + `set_public_library`; OTP auth path. Retire `openDrawer`/`closeDrawer`/`#recipe-drawer`.
- `styles.css`: detail-view layout, breadcrumb, related strip, recently-viewed list, settings panel, "Made this" button + count badge.

## Testing

- `node --check app.js`.
- SQL applied to prod; verify: anon `public_recipes` returns the whole non-hidden library with `cook_count`/`last_cooked_at`; a hidden recipe disappears from anon; `log_cook` increments; imported recipes get slugs via the trigger.
- Playwright (anon): whole library visible read-only; opening a recipe shows a full page with breadcrumb + related; recently-viewed populates; back button returns to the grid. Playwright (authed, via session injection per memory): "Made this" bumps the count and moves the recipe into "Recently cooked"; "Hide from public" removes it from the anon view; OTP UI renders.

## Risks / decisions

- **Exposure:** demo mode publishes everything non-hidden. Mitigations: per-recipe hide, one-switch off, clear labeling. Accepted by owner.
- **Slug collisions across the whole library:** handled by the existing uniqueness loop, now in a trigger so imports and bulk backfill are covered.
- **Drawer removal:** a focused rewrite of the view layer; the detail markup is reused, so content/logic risk is low, but every card/keyboard/permalink entry point must route through `showRecipe`. Covered by tests.
- **Cook count on public view:** intentional (fun social proof); only the aggregate is exposed, never who/when.

## Resolved decisions

1. Cook count: show a `Made N×` badge on cards **and** the count on the detail page.
2. Settings: **small inline popover** off the sidebar ⚙ button.
3. Sharing UI: **hide-only** in demo mode (Copy link + Hide from public); per-recipe Share buttons removed from the UI (DB path retained).
