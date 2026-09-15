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

### D. Drop the "Family favorites" tab; treat rating and cook-frequency as separate signals

Audit finding (2026-09-14): all ~85 cloud recipes have zero ratings. The rating-driven "Family favorites" tab is empty for real data; any 4.5+ entries seen were seed recipes or browser-local ratings never saved to the cloud. So the tab shows demo data, not reality.

- **Remove the "Family favorites" nav item** (and its `favorites` branch in `filteredRecipes`). Delete the tab from `index.html` and the `titles` map.
- **Keep per-recipe ratings.** The star rating input on the detail view stays. Rating = "how good it is."
- **Cook frequency is a distinct signal.** "How often I make it" (cook count) is not the same as rating: a top-rated recipe can be high-effort and rarely made. Surface both independently rather than collapsing them into one "favorites" bucket.
- **Sorting** (dropdown): add **"Most cooked"** (cook count desc) alongside the existing "Highest rated", recent, title, time. Separate options.
- **Filter by rating:** add a minimum-rating filter (e.g. only 4+ or 4.5+ stars) in the filter row, next to tag filters. This replaces the dead Favorites tab: filter/sort by rating for your best-rated; sort by Most cooked for your go-tos.

**Rating persistence (verified + one gap to close).** `saveRatingToCloud` (app.js) correctly writes to the `ratings` table when signed in; verified end-to-end on 2026-09-14 by inserting as the `authenticated` role under RLS (succeeded, aggregated, cleaned up). The empty DB was just "nothing rated while signed in." Gap: ratings entered signed-out or offline persist only in `localStorage` (`kitchen-archive-manual-ratings`) and are never uploaded — `loadCloudRecipesInner` merges them for display but does not push them. Fix: on sign-in, backfill any localStorage-only ratings to the cloud (then drop the local copy), so nothing is stranded. Going forward the open homepage is read-only when signed out, so no new local-only ratings accrue.

### E. Open homepage: the whole library is public, read-only

The app is built for one person (the owner). Viewing is fully open with no login: the public library **is** the homepage. This is not a "demo mode" and there is no prominent toggle. Editing still requires being the owner (see F); only viewing is open.

- Add `households.public_library boolean not null default false` and `recipes.is_hidden boolean not null default false` (per-recipe override). Set `public_library = true` for the owner's household in the migration.
- **Public visibility rule** (rewrite `public_recipes` view, joining `households`):
  `NOT r.is_hidden AND (h.public_library OR r.is_public)`.
  With the flag on, the whole library is public except recipes explicitly hidden; with it off, behavior is exactly today's per-recipe sharing.
- **Slugs for everything.** With the flag on, every visible recipe needs a permalink. Add a `before insert or update of title` trigger on `recipes` that assigns a unique slug from the title when `slug is null` (reusing the slugify + uniqueness loop from `publish_recipe`). This also backfills imports (the three recipes just added have no slug yet). One-time backfill for existing rows in the migration.
- Owner controls on the detail view (**hide-only**): "Copy link" + "Hide from public" (toggles `is_hidden` via a normal authenticated UPDATE under existing recipes RLS). Per-recipe "Share / Stop sharing" buttons are removed from the UI since the library is public by default. The `is_public` column and `publish_recipe` RPC stay in the DB (harmless, available if the flag is later turned off), just not surfaced.
- **No settings toggle for now** (YAGNI). The flag defaults on for this household; flipping it is a `set_public_library(enabled boolean)` security-definer RPC (kept in the DB for the future) or a one-line SQL change. The inline settings popover from earlier is dropped for this feature.
- **Note:** this makes every non-hidden recipe readable by anyone with the link on a public site. The owner opted in; per-recipe hide and the flag give escape hatches.

### E2. Two-way door (keeping login as a future option)

The point of going open now is to remove the owner's daily friction, without burning the ability to add login/gatekeeping later. Guarantees:

- **Ownership metadata stays.** Every recipe keeps `household_id` + `created_by`; households/members/auth tables and RLS remain. Nothing is deleted.
- **"Open" is one read-visibility flag,** not a schema change. Reading is public when `public_library` is on; flip it off and reading requires household membership again, with zero data migration.
- **Writes stay authenticated always.** Opening read access never opens write access; the `anon` role never gets write grants. The security model is untouched by going open.
- **Login UI stays in the code,** just not required to view.

Reverting to gated = flip `public_library` off (one RPC/SQL call). Adding real multi-user later = the household/membership model is already there. No rebuild either direction.

### F. Editing = stay logged in (owner only)

Decision: **stay-logged-in editing.** Viewing needs no login; editing requires the owner's session, made sticky enough to be invisible day to day.

- **Long-lived session.** `persistSession` + `autoRefreshToken` are already on. The "log in every time" annoyance points at a short token expiry in the Supabase Auth config. Raise the JWT / refresh-token lifetime (and confirm refresh-token rotation keeps the device authed indefinitely) so one login per device lasts months. This is a Supabase Auth setting, not SQL; check the current value and extend it as part of the work.
- **Painless re-auth** when a session does drop: add an "Email me a code" path to the auth modal using `signInWithOtp({ email })` then `verifyOtp({ email, token, type: 'email' })` (6-digit code, no cross-device redirect, no password typing). Keep password login as-is.
- No new server-side infra beyond the existing email auth (password login already works, so email auth is enabled; site URL is registered).
- The owner no longer needs to log in on other people's devices at all: friends just view the open homepage read-only.

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

- `index.html`: `#list-view` / `#detail-view` containers; sidebar "Recently viewed" block; auth-modal OTP fields. Bump the `?v=` cache-bust on JS/CSS.
- `app.js`: `state.mode`; `render()` branch; `recipeDetailHtml` / `wireRecipeDetail`; `showRecipe` / `showList`; recent-views store; related-recipe computation; "Made this" wiring + cook-count load; `filteredRecipes()` updates (remove the `favorites` view, `recent` sorts by lastCookedAt, add a "Most cooked" sort and a minimum-rating filter); hide-only owner controls (Copy link + Hide from public); OTP auth path. Remove the "Family favorites" nav item from `index.html` + `titles`. Retire `openDrawer`/`closeDrawer`/`#recipe-drawer`. No settings-panel UI (the public-read flag has no toggle for now).
- `styles.css`: detail-view layout, breadcrumb, related strip, recently-viewed list, "Made this" button + count badge.

## Testing

- `node --check app.js`.
- SQL applied to prod; verify: anon `public_recipes` returns the whole non-hidden library with `cook_count`/`last_cooked_at`; a hidden recipe disappears from anon; `log_cook` increments; imported recipes get slugs via the trigger.
- Playwright (anon): whole library visible read-only; opening a recipe shows a full page with breadcrumb + related; recently-viewed populates; back button returns to the grid. Playwright (authed, via session injection per memory): "Made this" bumps the count and moves the recipe into "Recently cooked"; "Hide from public" removes it from the anon view; OTP UI renders.

## Risks / decisions

- **Exposure:** the open homepage publishes everything non-hidden. Mitigations: per-recipe hide, the flag can be flipped off, writes stay authenticated. Accepted by owner.
- **Slug collisions across the whole library:** handled by the existing uniqueness loop, now in a trigger so imports and bulk backfill are covered.
- **Drawer removal:** a focused rewrite of the view layer; the detail markup is reused, so content/logic risk is low, but every card/keyboard/permalink entry point must route through `showRecipe`. Covered by tests.
- **Cook count on public view:** intentional (fun social proof); only the aggregate is exposed, never who/when.

## Resolved decisions

1. Cook count: show a `Made N×` badge on cards **and** the count on the detail page.
2. Access: the whole library is the **open homepage** (public read, no login). Not "demo mode", no prominent toggle; flag defaults on, flip via RPC/SQL later. Settings popover dropped.
3. Sharing UI: **hide-only** (Copy link + Hide from public); per-recipe Share buttons removed from the UI (DB path retained).
4. Editing: **stay-logged-in** (owner only). Extend Supabase token life so one login per device lasts months; add OTP re-auth. Two-way door preserved (see E2).
5. Favorites: **drop the Family favorites tab** (audit showed zero ratings in the DB). Keep per-recipe ratings; rating and cook-frequency are separate signals. Add a "Most cooked" sort and a minimum-rating filter instead of a dedicated tab.
