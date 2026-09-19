# Meal planning + grocery list

Date: 2026-09-18
Status: draft for review
Repo: kitchen-archive (github.com/loonyuni/recipe_app), static SPA on GitHub Pages + Supabase.

## Goal

Let the household plan the week's meals inside the app and generate a shopping list from them, replacing the ad-hoc whiteboard/todo-list workflow.

1. **Meal plan.** A shared "This week" list of saved recipes. Each meal can optionally be tagged to a day (Mon–Sun), reordered, and checked off when made (strikethrough).
2. **Grocery list.** One living, household-shared shopping list generated from the planned recipes' ingredients. Quantities aggregate across recipes where possible ("2 onions" + "1 onion" → "3 onions"). Pantry staples (salt, oil…) are excluded by default. Regenerating after adding a recipe merges in the new items without losing what's already checked off or pruned.

Non-goals (v1): multi-week calendar / dates, external URLs or free-text meals (saved recipes only), scaling groceries to a chosen serving count, unit conversion across measurement families (weight↔volume), nutrition roll-ups for the week, sharing the grocery list outside the household.

## Current state (what we build on)

- SPA: `index.html` shell (sidebar + `main`), `src/{helpers,data,ui}.js` render from a global `state`. `state.view ∈ {library, recent, pastry}`, `state.mode ∈ {list, detail}`; `render()` decides list vs detail and calls `renderRecipes`, `renderLabels`, `renderRecentlyViewed`, etc. Sidebar nav items set `state.view` (`ui.js` wires `[data-view]`).
- Recipes: Supabase `recipes` (RLS by `is_household_member`), ingredients/instructions/`sections` as jsonb. `recipeFromRow` maps a row → the in-memory recipe. Writes stay authenticated; anon reads the `public_recipes` view only.
- **Ingredient parsing already exists** (`helpers.js`) and is reused here:
  - `normalizeIngredientList(list)` → atomizes compound lines via `splitCompoundIngredient` (idempotent).
  - `isIngredientHeader(line)` → true for split-off section labels like `"Lemon rice:"` (skip these).
  - `parseLeadingQuantity(text)` → `{ value, token, rest }` or null; pulls the leading amount (handles mixed numbers, unicode fractions, decimals). `rest` is the text after the number, e.g. `"3 tablespoons cornstarch"` → `value: 3, rest: " tablespoons cornstarch"`.
  - `formatQuantity(value)` → tidy number string.
- Detail view (`renderDetail`/`showRecipe`) is where an "Add to this week" entry point goes. Sidebar already has a "Recently viewed" section pattern to mirror.
- Household id / member helpers exist for RLS-scoped writes (same path recipes use).

## Design

### A. Data model (Supabase, household-shared)

Three new tables, all RLS-gated by `is_household_member(household_id)` (mirror the `recipes` policies: household members read/write, anon no access). New numbered migration in `supabase/migrations/`.

**`planned_meals`**: the "This week" list.
| column | type | notes |
|---|---|---|
| `id` | uuid pk | `gen_random_uuid()` |
| `household_id` | uuid not null | FK households |
| `recipe_id` | uuid not null | FK recipes (on delete cascade; a deleted recipe drops from the plan) |
| `day` | smallint null | 0=Mon … 6=Sun; null = "no day" |
| `sort_order` | int not null default 0 | manual ordering within the list |
| `made` | boolean not null default false | checked-off / strikethrough |
| `created_by` | uuid null | auth.users id |
| `created_at` | timestamptz default now() |

**`grocery_items`**: the living shopping list (see §D/§E for how it's populated and merged).
| column | type | notes |
|---|---|---|
| `id` | uuid pk | |
| `household_id` | uuid not null | |
| `item_key` | text not null | normalized ingredient name used for merge/dedup (see §D); unique per household |
| `display` | text not null | rendered label, e.g. `"3 onions"` or `"flour: 200 g + 1 cup"` |
| `status` | text not null default `'need'` | `need` \| `have` \| `got` (see §E) |
| `manual` | boolean not null default false | true = user-added, never auto-removed |
| `source` | jsonb not null default `'{}'` | debug/provenance: contributing recipe ids + raw amounts (not shown in UI) |
| `sort_order` | int not null default 0 | |
| `created_at` / `updated_at` | timestamptz | |

Unique constraint `(household_id, item_key)` so re-aggregation upserts rather than duplicates.

**`pantry_staples`**: names that auto-exclude from the grocery list.
| column | type | notes |
|---|---|---|
| `id` | uuid pk | |
| `household_id` | uuid not null | |
| `name` | text not null | lowercased staple name; unique `(household_id, name)` |

Seed on first use with: `salt`, `pepper`, `black pepper`, `olive oil`, `oil`, `butter`, `water`, `sugar`, `flour`. Editable (add/remove).

None of these are exposed publicly (no `public_recipes` change, no snapshot regeneration).

### B. Meal plan view ("This week")

- New sidebar nav item **"This week"** (Lucide calendar/list icon) under Library. Sets `state.view = 'plan'`.
- New in-memory state: `state.plannedMeals` (array of `{ id, recipeId, day, sortOrder, made }`), `state.grocery` (items), `state.staples`. Loaded alongside recipes on boot for signed-in members; empty/hidden for anon (feature is owner/household only).
- `render()` gains a `plan` branch that renders `#plan-view` into `main` (a new container beside `#list-view` and `#detail-view`).
- The plan view has two panes behind a segmented toggle at the top, **Plan | Groceries**: Plan is the meal list (below); Groceries is the shopping list (§E).
- Layout (chosen): single "This week" list.
  ```
  THIS WEEK                                   [ + Add meal ]
  ────────────────────────────────────────────────────────
  ⠿  ▢  Thai poached chicken                    [ MON ▾ ]  ×
  ⠿  ▢  Cabbage miso pasta                       [ TUE ▾ ]  ×
  ⠿  ▢  Pumpkin cheesecake muffins               [ none ▾ ]  ×
  ⠿  ✓  Tomato pie                (made)         [ none ▾ ]  ×
  ────────────────────────────────────────────────────────
  [ Generate / update grocery list ]              [ Clear made ]
  ```
  - `⠿` drag handle → reorder (persists `sort_order`).
  - `▢/✓` made checkbox → toggles `made`, strikes through; made meals sink below unmade (stable within each group by `sort_order`).
  - Title → `showRecipe(recipeId)`.
  - `[ DAY ▾ ]` chip → small menu to set Mon–Sun or clear. Purely a label; multiple meals may share a day.
  - `×` → remove from plan.
  - **Clear made** → deletes all `made` rows (with a confirm).
- **Start a new week** (top of the view): one action clears made meals and the checked-off (`got`) grocery items together, for a clean slate. The granular "Clear made" (plan) and "Clear got" (groceries) remain for resetting a single side.
- All mutations write to Supabase and update `state` optimistically (same pattern as ratings/cook-log).

### C. Adding meals to the plan

Three entry points, so you're never forced to detour:
- **From the plan, `+ Add meal`:** a **modal picker** with a search box over saved recipes and **multi-select** (tap several, then "Add N meals"). Reuses the existing search/`filteredRecipes` matching. Each selection appends a `planned_meals` row (`day` null, `made` false, `sort_order` = max+1).
  ```
  ┌ Add to this week ───────────────────── × ┐
  │ [ search your recipes…                  ] │
  │ ───────────────────────────────────────── │
  │   ▢  Cabbage miso pasta            35 min  │
  │   ▣  Thai poached chicken          40 min  │
  │   ▢  One-pan salmon & broccoli     30 min  │
  │   ▣  Pumpkin cheesecake muffins    55 min  │
  │ ───────────────────────────────────────── │
  │                 [ Add 2 meals ]            │
  └────────────────────────────────────────── ┘
  ```
- **While browsing, quick add:** a small **"＋ Plan"** affordance on each recipe card in the Library grid, and an **"＋ Add to this week"** button in the recipe detail actions row. Both add without leaving the current view; a toast confirms. If already planned and not made, no-op with "Already on this week's plan".
- **On import:** the import review/confirm screen gets an **"Add to this week after saving"** checkbox (default off). When checked, saving the imported recipe also appends it to the plan in one step.

### D. Grocery list: aggregation

Triggered by **Generate / update grocery list**. Pure, unit-tested functions in `helpers.js`; no cloud calls inside them.

Inputs: the planned recipes to include, by default **only meals not marked made** (already shopped for). The generate step shows which recipes are included with per-recipe toggles before it runs.

Algorithm (`aggregateGroceries(recipes) → [{ item_key, display, amounts }]`):
1. For each recipe, `normalizeIngredientList(recipe.ingredients)`; drop `isIngredientHeader` lines.
2. For each line, `parseLeadingQuantity` → `{ value, rest }`. Split `rest` into `{ unit, name }` with a **unit lexicon** (new `parseUnitAndName(rest)`):
   - Units recognized: mass `g, kg, gram(s), oz, ounce(s), lb, pound(s)`; volume `ml, l, tsp, teaspoon(s), tbsp, tablespoon(s), cup(s)`; count-ish `clove(s), can(s), bunch(es), handful(s), sprig(s), stalk(s), slice(s)`. Unknown leading word → treat as no unit (count of the item).
   - `name` = the remainder, **normalized**: lowercase, strip a trailing prep clause after a comma (`", sliced"`, `", drained"`), strip parentheticals, drop a leading article, singularize a trailing `s` heuristically (`onions → onion`, but keep known-invariant words). Normalization lives in `normalizeIngredientName(text)` and is the `item_key`.
3. Group by `item_key`, then by unit within each key. Sum `value` per unit.
   - Same-family safe conversions before summing: mass `kg↔g`, volume `l↔ml`, and count (no unit). US-customary volume (tsp/tbsp/cup) is summed **only within the identical unit** in v1 (no tsp→cup math) to avoid rounding surprises; cross-family (e.g. weight + volume of "flour") never merges.
4. Render `display`:
   - single unit bucket → `"<sum> <unit> <name>"` (e.g. `"3 onions"`, `"4 tbsp oil"`); `formatQuantity` tidies the number.
   - multiple buckets → join with `" + "` (e.g. `"flour: 200 g + 1 cup"`).
   - lines with no parseable amount ("a big handful of cilantro", "Kosher salt") → keep the original text; if the same `item_key` recurs, show once.

**Honest limitation** (call out in UI copy): aggregation is best-effort on free-text ingredients. It sums the clean cases and otherwise lists the amounts side by side rather than guessing a wrong total. Tests cover the messy inputs in our own library.

### E. Grocery list: persistent, mergeable state

The list is **one living list**, not a fresh pick each time. `status` per item:
- **need**: to buy (default for new items). Shown in the active list.
- **have**: you already have it, or it matched a pantry staple. Greyed / collapsed under a "Have / skipping" group; excluded from the buy list. Toggle back to `need` anytime.
- **got**: checked off while shopping. Stays in the list, struck through.

**Generate / update** merges by `item_key` (upsert):
1. Run `aggregateGroceries(includedRecipes)`.
2. For each aggregated item:
   - **exists** in `grocery_items` → update `display` to the new total; **preserve `status`** (don't un-check `got`, don't un-skip `have`).
   - **new** → insert as `need`, unless its `item_key` matches a pantry staple → insert as `have`.
3. Recipe-derived items (`manual = false`) whose `item_key` is no longer produced by any included recipe → delete (the recipe was removed/made). `manual = true` items are never auto-removed.
4. Pantry-staple matching only sets the **default** on first insert; a staple you manually flip to `need` stays `need`.

Result: add a recipe, hit update, and only the new ingredients appear (as `need`); everything you already checked off or marked "have" is untouched.

Grocery list UI (the **Groceries** pane of the plan-view toggle):
```
GROCERY LIST                         [ + add item ]  [ ⚙ staples ]
────────────────────────────────────────────────────────────────
NEED
  ▢  3 onions
  ▢  4 tbsp oil
  ▢  flour: 200 g + 1 cup
  ▢  milk            (added by you)
GOT
  ✓  1 lemon
HAVE / SKIPPING  (3)                                     [ show ▾ ]
────────────────────────────────────────────────────────────────
                                          [ Clear got ]  [ Clear all ]
```
- Row checkbox toggles `need ↔ got`.
- Swipe/⋯ per row → "I have this" (→ `have`) / remove.
- `+ add item` → free-text `manual` item (`need`).
- `⚙ staples` → pantry-staples editor (add/remove names; same modal pattern as the label manager).
- `Clear got` removes checked items; `Clear all` empties the list (confirm).

### F. Boot / loading

- On authenticated boot, load `planned_meals`, `grocery_items`, `pantry_staples` for the household in parallel with recipes (extend the existing load path in `data.js`). Anon: skip; the "This week" nav item is hidden when not a household member (reuse `isReadOnly`/membership check).

## Edge cases

- Recipe deleted while planned → `on delete cascade` drops the `planned_meals` row; next grocery update removes its now-orphaned `need` items (kept if `got`/`have`/manual).
- Same recipe added twice → allowed (two rows); aggregation counts its ingredients once per row (so 2× the recipe = 2× quantities), which is correct for cooking it twice.
- Ingredient with a section header only (no real ingredients) → nothing to aggregate.
- All meals made → generate produces an empty (or unchanged) list; UI shows "Nothing to buy: all planned meals are made."
- Staple added that matches existing `need` items → does **not** retroactively flip them; only affects future inserts (predictable). Offer a one-click "skip existing matches" in the staples editor as a convenience.
- Offline / write failure → optimistic update rolls back with a toast (match existing error handling).

## Testing

- Pure functions get unit tests (there is no runner today; add a minimal `node --test` file or inline asserts run via `node`): `parseUnitAndName`, `normalizeIngredientName`, `aggregateGroceries` (2 onions + 1 onion = 3; mixed units listed; no-amount passthrough; header skipping; kg/g and l/ml conversion; no tsp→cup math), and the merge/upsert reducer (`mergeGrocery(existing, aggregated, staples)` preserves `got`/`have`, adds new as `need`, drops orphaned non-manual).
- Manual browser pass (local server + Playwright): add meals, set days, reorder, mark made; generate; prune; add a recipe; update and confirm checked state survives; edit staples.

## Rollout

- One migration (three tables + RLS policies), applied via the Management API SQL path (see project DB-ops notes). No edge-function changes, no `public_recipes`/snapshot changes.
- Ship behind normal deploy; bump `?v=` on assets. Feature is invisible to signed-out visitors.
- Implementation order: migration → data load + state → plan view (CRUD) → aggregation + tests → grocery merge/state + tests → staples → polish.

## Resolved decisions

- The plan is a **tab** (sidebar "This week"), not a modal. Modals are used only for the add-meal picker and the staples editor.
- Add-meal picker: **modal with search + multi-select** (add several recipes at once).
- Quick add while browsing lives on **both** recipe cards ("＋ Plan") and the recipe detail page.
- Import review has an **"Add to this week after saving"** checkbox.
- Grocery list shown via a **"Plan | Groceries" toggle** at the top of the plan view (revisit on a browser during build for small-screen polish).
- **"Start a new week"**: a single top-of-view action clears made meals and the checked-off (`got`) grocery items together; granular "Clear made" / "Clear got" remain for finer control.
