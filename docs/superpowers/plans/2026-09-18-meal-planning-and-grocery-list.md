# Meal Planning + Grocery List Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a household-shared "This week" meal plan and a living grocery list generated from the planned recipes (with quantity aggregation, pantry-staple exclusion, and a stateful merge on regenerate).

**Architecture:** Three new Supabase tables (`planned_meals`, `grocery_items`, `pantry_staples`), RLS-gated by `is_household_member`. A new pure-logic module `src/grocery.js` (loaded as a classic script between `helpers.js` and `data.js`) holds the ingredient aggregation and merge functions, unit-tested under Node via a guarded `module.exports`. `data.js` gains load + CRUD for the new tables; `ui.js` gains a "This week" view (a sidebar tab with a Plan | Groceries toggle) plus add-meal entry points; `index.html` gains the view container, two modals, and an import checkbox.

**Tech Stack:** Vanilla JS classic scripts (no bundler), Supabase (Postgres + Auth, JS client `cloud.client`), `node --test` for unit tests (Node 18+, no package.json needed).

**Spec:** `docs/superpowers/specs/2026-09-18-meal-planning-and-grocery-list-design.md`

## Global Constraints

- No build step. `src/helpers.js`, `src/grocery.js`, `src/data.js`, `src/ui.js` load in that order as classic scripts sharing ONE global scope; do not add `import`/`export` statements to browser code paths (Node interop is done behind `typeof module` guards only).
- Escape every interpolated user/recipe value in HTML with `esc()` / `escAttr()` (already global in `helpers.js`).
- All writes stay authenticated and go through `cloud.client.from(...)`; guard every write with `if (!cloud.connected || !cloud.client || !cloud.householdId) return;` (mirror `saveRecipeToCloud`).
- Do not use em-dash punctuation anywhere (including code comments and UI copy strings); a repo write-lint hook rejects any file containing it. Use commas, colons, parentheses, or hyphens instead.
- After any deploy-affecting change, bump the `?v=` query on the `styles.css` / `src/*.js` tags in `index.html` (single shared value).
- Reuse the existing ingredient parser in `helpers.js`: `normalizeIngredientList`, `isIngredientHeader`, `parseLeadingQuantity`, `formatQuantity`. Do not reimplement quantity parsing.
- Syntax check after JS edits: `node --check src/<file>.js`. There is no lint/build; `node --check` + `node --test test/` + a browser pass are the gates.

---

## File structure

- **Create** `src/grocery.js`: pure functions: `parseUnitAndName`, `normalizeIngredientName`, `aggregateGroceries`, `mergeGrocery`, and the `GROCERY_STATUS` constant. No DOM/cloud access. Node-testable.
- **Create** `test/grocery.test.js`: `node --test` unit tests for the above.
- **Create** `supabase/migrations/0009_meal_planning.sql`: three tables + RLS.
- **Modify** `src/helpers.js`: guard two top-level browser-global reads so the file is `require()`-able in Node; append a guarded `module.exports`; add new `state` fields; add `seedStaples` default list constant.
- **Modify** `src/data.js`: load `planned_meals`/`grocery_items`/`pantry_staples` in `loadCloudRecipesInner`; add CRUD helpers.
- **Modify** `src/ui.js`: `render()` plan branch + `renderPlan`, `renderGroceries`, add-meal picker, staples editor, quick-add handlers, import checkbox, "Start a new week"/clears, event wiring.
- **Modify** `index.html`: sidebar nav item, `#plan-view` container with Plan|Groceries toggle, add-meal + staples modals, import-review checkbox, new `<script src="src/grocery.js?v=...">` tag, `?v=` bump.
- **Modify** `styles.css`: plan view, toggle, grocery rows, modal reuse (flat editorial styling).

---

## Task 1: Test harness + `grocery.js` scaffold + `parseUnitAndName`

Establishes the Node test path (helpers.js require-safety + dual-mode exports) and ships the first pure function.

**Files:**
- Modify: `src/helpers.js:133`, `src/helpers.js:191`, end of `src/helpers.js`
- Create: `src/grocery.js`
- Create: `test/grocery.test.js`

**Interfaces:**
- Produces: `parseUnitAndName(rest: string) -> { unit: string, name: string }`. `unit` is a canonical token (`"g","kg","oz","lb","ml","l","tsp","tbsp","cup","clove","can","bunch","handful","sprig","stalk","slice"`) or `""` when the leading word is not a known unit. `name` is the remaining text (not yet normalized).
- Produces (Node): `require("./grocery.js")` returns `{ parseUnitAndName, normalizeIngredientName, aggregateGroceries, mergeGrocery, GROCERY_STATUS }`; `require("./helpers.js")` returns `{ parseLeadingQuantity, isIngredientHeader, normalizeIngredientList, formatQuantity, splitCompoundIngredient }`.

- [ ] **Step 1: Make `helpers.js` require-safe.** Guard the two top-level browser reads.

At `src/helpers.js:133`, replace:
```javascript
const storedRecipes = JSON.parse(localStorage.getItem("kitchen-archive-recipes") || "null");
```
with:
```javascript
const storedRecipes = (typeof localStorage !== "undefined")
  ? JSON.parse(localStorage.getItem("kitchen-archive-recipes") || "null")
  : null;
```

At `src/helpers.js:191`, replace:
```javascript
const queryParams = new URLSearchParams(window.location.search);
```
with:
```javascript
const queryParams = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "");
```

- [ ] **Step 2: Export the pure parsers from `helpers.js` for Node.** Append to the END of `src/helpers.js`:
```javascript
// Node-only: expose the pure parsers for unit tests. Guarded so the browser
// (where `module` is undefined) never sees this and the shared-scope model is
// unchanged.
if (typeof module !== "undefined" && module.exports) {
  module.exports = { parseLeadingQuantity, isIngredientHeader, normalizeIngredientList, formatQuantity, splitCompoundIngredient };
}
```

- [ ] **Step 3: Create `src/grocery.js`** with the Node interop header, the unit lexicon, and `parseUnitAndName`:
```javascript
// grocery.js: pure meal-plan/grocery logic (aggregation + merge). No DOM or
// cloud access so it is unit-testable. Loads as a classic script after
// helpers.js (its parsers are globals in the browser); under Node the parsers
// are pulled in explicitly below.
if (typeof module !== "undefined" && module.exports) {
  // eslint-disable-next-line no-var
  var { parseLeadingQuantity, isIngredientHeader, normalizeIngredientList } = require("./helpers.js");
}

// Canonical unit tokens. Keys are lowercased words we might see leading an
// ingredient's remainder; values are the canonical token we group/convert by.
const UNIT_ALIASES = {
  g: "g", gram: "g", grams: "g", kg: "kg", kilogram: "kg", kilograms: "kg",
  oz: "oz", ounce: "oz", ounces: "oz", lb: "lb", lbs: "lb", pound: "lb", pounds: "lb",
  ml: "ml", milliliter: "ml", milliliters: "ml", l: "l", liter: "l", liters: "l", litre: "l", litres: "l",
  tsp: "tsp", teaspoon: "tsp", teaspoons: "tsp", tbsp: "tbsp", tablespoon: "tbsp", tablespoons: "tbsp",
  cup: "cup", cups: "cup",
  clove: "clove", cloves: "clove", can: "can", cans: "can",
  bunch: "bunch", bunches: "bunch", handful: "handful", handfuls: "handful",
  sprig: "sprig", sprigs: "sprig", stalk: "stalk", stalks: "stalk", slice: "slice", slices: "slice"
};

// Split the text that follows a leading quantity into { unit, name }. The first
// word (optionally with a trailing period, e.g. "tbsp.") is treated as a unit
// only when it is in UNIT_ALIASES; otherwise there is no unit and the whole
// remainder is the name (e.g. "onions", "large eggs").
function parseUnitAndName(rest) {
  const text = String(rest == null ? "" : rest).trim();
  if (!text) return { unit: "", name: "" };
  const match = text.match(/^([a-zA-Z]+)\.?(?:\s+|$)([\s\S]*)$/);
  if (match) {
    const canon = UNIT_ALIASES[match[1].toLowerCase()];
    if (canon) return { unit: canon, name: match[2].trim() };
  }
  return { unit: "", name: text };
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = { parseUnitAndName, UNIT_ALIASES };
}
```

- [ ] **Step 4: Write the failing test.** Create `test/grocery.test.js`:
```javascript
const test = require("node:test");
const assert = require("node:assert");
const { parseUnitAndName } = require("../src/grocery.js");

test("parseUnitAndName: recognizes a unit and name", () => {
  assert.deepStrictEqual(parseUnitAndName(" tablespoons cornstarch"), { unit: "tbsp", name: "cornstarch" });
});
test("parseUnitAndName: no unit when leading word is not a measure", () => {
  assert.deepStrictEqual(parseUnitAndName(" onions"), { unit: "", name: "onions" });
});
test("parseUnitAndName: handles abbreviations and periods", () => {
  assert.deepStrictEqual(parseUnitAndName(" g flour"), { unit: "g", name: "flour" });
  assert.deepStrictEqual(parseUnitAndName(" tbsp. olive oil"), { unit: "tbsp", name: "olive oil" });
});
test("parseUnitAndName: empty input", () => {
  assert.deepStrictEqual(parseUnitAndName(""), { unit: "", name: "" });
});
```

- [ ] **Step 5: Run tests, verify pass.** Run: `node --test test/`
Expected: 4 passing. (If `require("../src/helpers.js")` throws, the Step 1 guards are wrong; fix before proceeding.)

- [ ] **Step 6: Syntax-check the browser path.** Run: `node --check src/helpers.js && node --check src/grocery.js`
Expected: no output (success).

- [ ] **Step 7: Commit.**
```bash
git add src/helpers.js src/grocery.js test/grocery.test.js
git commit -m "feat(grocery): pure unit parser + Node test harness"
```

---

## Task 2: `normalizeIngredientName`

The grouping/merge key. Lowercases, drops parentheticals and prep clauses, strips articles/punctuation, singularizes.

**Files:**
- Modify: `src/grocery.js`, `test/grocery.test.js`

**Interfaces:**
- Produces: `normalizeIngredientName(text: string) -> string` (the `item_key`). Deterministic, lowercase, singular.

- [ ] **Step 1: Write the failing test.** Append to `test/grocery.test.js`:
```javascript
const { normalizeIngredientName } = require("../src/grocery.js");

test("normalizeIngredientName: singularizes and lowercases", () => {
  assert.strictEqual(normalizeIngredientName("Onions"), "onion");
  assert.strictEqual(normalizeIngredientName("cherry tomatoes"), "cherry tomato");
});
test("normalizeIngredientName: drops parentheticals and prep", () => {
  assert.strictEqual(normalizeIngredientName("garlic, sliced"), "garlic");
  assert.strictEqual(normalizeIngredientName("coconut yogurt (see Tip)"), "coconut yogurt");
});
test("normalizeIngredientName: keeps invariant words and short words", () => {
  assert.strictEqual(normalizeIngredientName("molasses"), "molasses");
  assert.strictEqual(normalizeIngredientName("peas"), "peas");
});
test("normalizeIngredientName: strips leading article", () => {
  assert.strictEqual(normalizeIngredientName("a big handful cilantro"), "big handful cilantro");
});
```

- [ ] **Step 2: Run to verify fail.** Run: `node --test test/`
Expected: the new tests error with "normalizeIngredientName is not a function".

- [ ] **Step 3: Implement.** Add to `src/grocery.js` (before the final export block) and add `normalizeIngredientName` to BOTH `module.exports` objects:
```javascript
// Words ending in "s" that must not be singularized.
const INVARIANT_PLURALS = new Set(["molasses", "hummus", "couscous", "asparagus", "peas", "oats", "greens"]);

// Reduce an ingredient name to a stable grouping key: lowercase, drop
// parentheticals and any prep clause after the first comma, strip a leading
// article, remove punctuation, and singularize the last word heuristically.
function normalizeIngredientName(text) {
  let s = String(text == null ? "" : text).toLowerCase();
  s = s.replace(/\([^)]*\)/g, " ");     // drop "(see Tip)" etc.
  s = s.split(",")[0];                   // drop ", sliced"
  s = s.replace(/^(?:a |an |the |of )+/, "");
  s = s.replace(/[^a-z0-9\s-]/g, " ").replace(/\s+/g, " ").trim();
  if (!s) return "";
  const words = s.split(" ");
  const last = words[words.length - 1];
  if (last.length > 3 && !INVARIANT_PLURALS.has(last) && last.endsWith("s") && !last.endsWith("ss")) {
    words[words.length - 1] = last.endsWith("ies") ? last.slice(0, -3) + "y" : last.slice(0, -1);
  }
  return words.join(" ").trim();
}
```
Update the export line to:
```javascript
  module.exports = { parseUnitAndName, normalizeIngredientName, UNIT_ALIASES };
```

- [ ] **Step 4: Run tests, verify pass.** Run: `node --test test/`
Expected: all passing.

- [ ] **Step 5: Commit.**
```bash
git add src/grocery.js test/grocery.test.js
git commit -m "feat(grocery): ingredient name normalization key"
```

---

## Task 3: `aggregateGroceries` (with safe unit conversion + display)

**Files:**
- Modify: `src/grocery.js`, `test/grocery.test.js`

**Interfaces:**
- Consumes: `parseUnitAndName`, `normalizeIngredientName` (Task 1-2); `normalizeIngredientList`, `isIngredientHeader`, `parseLeadingQuantity` (helpers.js).
- Produces: `aggregateGroceries(recipes: Array<{ id, ingredients: string[] }>) -> Array<{ item_key: string, display: string, recipeIds: string[] }>`. `display` is the merged label; same name+unit sums, `kg<->g` and `l<->ml` convert before summing, `tsp/tbsp/cup` stay separate, no-quantity lines pass through by name.

- [ ] **Step 1: Write the failing tests.** Append to `test/grocery.test.js`:
```javascript
const { aggregateGroceries } = require("../src/grocery.js");

const R = (id, ingredients) => ({ id, ingredients });

test("aggregateGroceries: sums same name + unitless count", () => {
  const out = aggregateGroceries([R("a", ["2 onions"]), R("b", ["1 onion"])]);
  const onion = out.find(i => i.item_key === "onion");
  assert.strictEqual(onion.display, "3 onions");
});
test("aggregateGroceries: sums same US volume unit", () => {
  const out = aggregateGroceries([R("a", ["3 tablespoons oil"]), R("b", ["1 tbsp oil"])]);
  assert.strictEqual(out.find(i => i.item_key === "oil").display, "4 tbsp oil");
});
test("aggregateGroceries: converts within metric mass", () => {
  const out = aggregateGroceries([R("a", ["500 g flour"]), R("b", ["1 kg flour"])]);
  assert.strictEqual(out.find(i => i.item_key === "flour").display, "1.5 kg flour");
});
test("aggregateGroceries: lists incompatible units side by side", () => {
  const out = aggregateGroceries([R("a", ["200 g flour"]), R("b", ["1 cup flour"])]);
  const d = out.find(i => i.item_key === "flour").display;
  assert.ok(d.includes("200 g") && d.includes("1 cup"), d);
});
test("aggregateGroceries: skips headers, keeps no-quantity lines once", () => {
  const out = aggregateGroceries([R("a", ["Lemon rice:", "Kosher salt", "1 lemon"]), R("b", ["Kosher salt"])]);
  assert.ok(!out.some(i => i.item_key.endsWith(":")));
  const salt = out.filter(i => i.item_key === "kosher salt");
  assert.strictEqual(salt.length, 1);
});
```

- [ ] **Step 2: Run to verify fail.** Run: `node --test test/`
Expected: new tests error ("aggregateGroceries is not a function").

- [ ] **Step 3: Implement.** Add to `src/grocery.js` (before final export) and add to exports:
```javascript
// Metric conversion to a base unit so kg/g and l/ml combine. US-customary
// volume (tsp/tbsp/cup) is intentionally NOT converted (no tsp->cup math);
// each stays its own bucket. Returns null for units we do not convert.
const METRIC_BASE = { g: ["mass", 1], kg: ["mass", 1000], ml: ["vol", 1], l: ["vol", 1000] };

function bucketKeyFor(unit) {
  const m = METRIC_BASE[unit];
  return m ? m[0] : unit;            // "mass" | "vol" | the raw unit ("tbsp","cup","")
}

// Render one grouped ingredient into a display string.
function renderGrocery(key, buckets) {
  const parts = [];
  for (const [bucketKey, amount] of buckets) {
    if (bucketKey === "mass") {
      parts.push(amount >= 1000 ? `${formatQuantity(amount / 1000)} kg ${key}` : `${formatQuantity(amount)} g ${key}`);
    } else if (bucketKey === "vol") {
      parts.push(amount >= 1000 ? `${formatQuantity(amount / 1000)} l ${key}` : `${formatQuantity(amount)} ml ${key}`);
    } else if (bucketKey === "") {
      parts.push(`${formatQuantity(amount)} ${key}${amount > 1 ? pluralize(key) : ""}`);
    } else {
      parts.push(`${formatQuantity(amount)} ${bucketKey} ${key}`);
    }
  }
  return parts.join(" + ");
}

// Minimal display pluralization for unitless counts ("3 onion" -> "3 onions").
function pluralize(name) {
  if (/[^aeiou]y$/.test(name)) return name.slice(0, -1) + "ies";
  if (/(s|sh|ch|x|z)$/.test(name)) return name + "es";
  return name + "s";
}

function aggregateGroceries(recipes) {
  const map = new Map(); // item_key -> { buckets: Map<bucketKey, amount>, noQty: string|null, recipeIds: Set }
  const entryFor = (key) => {
    if (!map.has(key)) map.set(key, { buckets: new Map(), noQty: null, recipeIds: new Set() });
    return map.get(key);
  };
  for (const recipe of recipes || []) {
    for (const line of normalizeIngredientList(recipe.ingredients || [])) {
      if (isIngredientHeader(line)) continue;
      const parsed = parseLeadingQuantity(line);
      if (!parsed) {
        const key = normalizeIngredientName(line);
        if (!key) continue;
        const e = entryFor(key);
        if (e.noQty === null) e.noQty = String(line).trim();
        e.recipeIds.add(recipe.id);
        continue;
      }
      const { unit, name } = parseUnitAndName(parsed.rest);
      const key = normalizeIngredientName(name);
      if (!key) continue;
      const e = entryFor(key);
      const metric = METRIC_BASE[unit];
      const bKey = bucketKeyFor(unit);
      const value = metric ? parsed.value * metric[1] : parsed.value;
      e.buckets.set(bKey, (e.buckets.get(bKey) || 0) + value);
      e.recipeIds.add(recipe.id);
    }
  }
  return [...map.entries()].map(([key, e]) => ({
    item_key: key,
    display: e.buckets.size ? renderGrocery(key, e.buckets) : e.noQty,
    recipeIds: [...e.recipeIds]
  }));
}
```
Add `aggregateGroceries` to the `module.exports` object.

- [ ] **Step 4: Run tests, verify pass.** Run: `node --test test/`
Expected: all passing. If "flour 200 g + 1 cup" ordering differs, the assertion uses `includes`, so order is fine.

- [ ] **Step 5: Real-data smoke check.** Run this one-off (not committed) to eyeball output against the seed library is optional; instead assert no throw on empty:
```javascript
// add to test file
test("aggregateGroceries: empty input returns empty", () => {
  assert.deepStrictEqual(aggregateGroceries([]), []);
});
```
Run: `node --test test/`: expect pass. Commit this test with the rest.

- [ ] **Step 6: Commit.**
```bash
git add src/grocery.js test/grocery.test.js
git commit -m "feat(grocery): aggregate ingredients with safe unit conversion"
```

---

## Task 4: `mergeGrocery` reducer + `GROCERY_STATUS`

Pure merge that preserves status/checked state across regenerations.

**Files:**
- Modify: `src/grocery.js`, `test/grocery.test.js`

**Interfaces:**
- Consumes: aggregated items (Task 3), existing grocery rows, staple names.
- Produces:
  - `GROCERY_STATUS = { NEED: "need", HAVE: "have", GOT: "got" }`.
  - `mergeGrocery(existing, aggregated, stapleKeys) -> Array<{ item_key, display, status, manual }>` where `existing` is the current list (each `{ item_key, display, status, manual }`), `aggregated` is `aggregateGroceries(...)` output, `stapleKeys` is a `Set<string>` of normalized staple names. Rules: existing item keeps its `status`, updates `display`; new item is `need` unless its key is in `stapleKeys` (then `have`); non-manual existing items whose key is absent from `aggregated` are dropped; `manual` items are always kept.

- [ ] **Step 1: Write the failing tests.** Append to `test/grocery.test.js`:
```javascript
const { mergeGrocery, GROCERY_STATUS } = require("../src/grocery.js");

test("mergeGrocery: preserves status and updates display", () => {
  const existing = [{ item_key: "onion", display: "2 onions", status: "got", manual: false }];
  const agg = [{ item_key: "onion", display: "3 onions", recipeIds: [] }];
  const out = mergeGrocery(existing, agg, new Set());
  assert.deepStrictEqual(out, [{ item_key: "onion", display: "3 onions", status: "got", manual: false }]);
});
test("mergeGrocery: new item is need, staple is have", () => {
  const out = mergeGrocery([], [
    { item_key: "onion", display: "1 onion", recipeIds: [] },
    { item_key: "salt", display: "Kosher salt", recipeIds: [] }
  ], new Set(["salt"]));
  assert.strictEqual(out.find(i => i.item_key === "onion").status, "need");
  assert.strictEqual(out.find(i => i.item_key === "salt").status, "have");
});
test("mergeGrocery: drops orphaned non-manual, keeps manual", () => {
  const existing = [
    { item_key: "onion", display: "1 onion", status: "need", manual: false },
    { item_key: "milk", display: "milk", status: "need", manual: true }
  ];
  const out = mergeGrocery(existing, [], new Set());
  assert.ok(!out.some(i => i.item_key === "onion"));
  assert.ok(out.some(i => i.item_key === "milk"));
});
```

- [ ] **Step 2: Run to verify fail.** Run: `node --test test/`: new tests error.

- [ ] **Step 3: Implement.** Add to `src/grocery.js` and exports:
```javascript
const GROCERY_STATUS = { NEED: "need", HAVE: "have", GOT: "got" };

// Merge freshly aggregated items into the existing living list. Preserves each
// existing item's status (got/have survive), refreshes display totals, adds new
// items as need (or have when they match a pantry staple), drops non-manual
// items no longer produced by any recipe, and always keeps manual items.
function mergeGrocery(existing, aggregated, stapleKeys) {
  const staples = stapleKeys || new Set();
  const existingByKey = new Map((existing || []).map((it) => [it.item_key, it]));
  const aggByKey = new Map((aggregated || []).map((it) => [it.item_key, it]));
  const out = [];
  // 1. aggregated items: update existing (keep status) or insert new.
  for (const agg of aggregated || []) {
    const prev = existingByKey.get(agg.item_key);
    if (prev) {
      out.push({ item_key: prev.item_key, display: agg.display, status: prev.status, manual: prev.manual });
    } else {
      out.push({
        item_key: agg.item_key,
        display: agg.display,
        status: staples.has(agg.item_key) ? GROCERY_STATUS.HAVE : GROCERY_STATUS.NEED,
        manual: false
      });
    }
  }
  // 2. keep manual items and existing items not in this aggregation only if manual.
  for (const it of existing || []) {
    if (aggByKey.has(it.item_key)) continue; // already emitted in step 1
    if (it.manual) out.push({ ...it });
    // non-manual + not in aggregation => dropped
  }
  return out;
}
```
Add `mergeGrocery` and `GROCERY_STATUS` to `module.exports`.

- [ ] **Step 4: Run tests, verify pass.** Run: `node --test test/`: all passing.

- [ ] **Step 5: Commit.**
```bash
git add src/grocery.js test/grocery.test.js
git commit -m "feat(grocery): stateful merge reducer preserving checked items"
```

---

## Task 5: Database migration (three tables + RLS)

**Files:**
- Create: `supabase/migrations/0009_meal_planning.sql`

**Interfaces:**
- Produces: tables `planned_meals`, `grocery_items`, `pantry_staples` with the columns the spec §A lists and RLS mirroring `is_household_member`.

- [ ] **Step 1: Write the migration.** Create `supabase/migrations/0009_meal_planning.sql`:
```sql
-- 0009_meal_planning.sql: meal plan + grocery list + pantry staples.
create table if not exists public.planned_meals (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  recipe_id uuid not null references public.recipes(id) on delete cascade,
  day smallint,
  sort_order int not null default 0,
  made boolean not null default false,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create table if not exists public.grocery_items (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  item_key text not null,
  display text not null,
  status text not null default 'need',
  manual boolean not null default false,
  source jsonb not null default '{}'::jsonb,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (household_id, item_key)
);

create table if not exists public.pantry_staples (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now(),
  unique (household_id, name)
);

alter table public.planned_meals enable row level security;
alter table public.grocery_items enable row level security;
alter table public.pantry_staples enable row level security;

create policy "members manage planned_meals"
  on public.planned_meals for all
  using (public.is_household_member(household_id))
  with check (public.is_household_member(household_id));

create policy "members manage grocery_items"
  on public.grocery_items for all
  using (public.is_household_member(household_id))
  with check (public.is_household_member(household_id));

create policy "members manage pantry_staples"
  on public.pantry_staples for all
  using (public.is_household_member(household_id))
  with check (public.is_household_member(household_id));

create index if not exists planned_meals_household_idx on public.planned_meals (household_id);
create index if not exists grocery_items_household_idx on public.grocery_items (household_id);
create index if not exists pantry_staples_household_idx on public.pantry_staples (household_id);
```

- [ ] **Step 2: Apply via the Management API.** (Project ref `axajsafyosisflrjqpya`; token in keychain. Run with sandbox disabled since it needs network.)
```bash
TOKEN=$(security find-generic-password -s "Supabase CLI" -a "supabase" -w)
python3 - "$TOKEN" <<'PY'
import json,sys,subprocess
sql=open('supabase/migrations/0009_meal_planning.sql').read()
open('/tmp/mp_q.json','w').write(json.dumps({"query":sql}))
PY
curl -s -X POST "https://api.supabase.com/v1/projects/axajsafyosisflrjqpya/database/query" \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" --data @/tmp/mp_q.json
```
Expected: `[]` (DDL returns no rows) and no error object.

- [ ] **Step 3: Verify the tables exist.**
```bash
curl -s -X POST "https://api.supabase.com/v1/projects/axajsafyosisflrjqpya/database/query" \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"query":"select table_name from information_schema.tables where table_schema=''public'' and table_name in (''planned_meals'',''grocery_items'',''pantry_staples'') order by table_name;"}'
```
Expected: three rows.

- [ ] **Step 4: Commit.**
```bash
git add supabase/migrations/0009_meal_planning.sql
git commit -m "feat(db): meal planning + grocery + staples tables (0009)"
```

---

## Task 6: `state` fields + data-layer load & CRUD

**Files:**
- Modify: `src/helpers.js:140` (state object), end of helpers for `DEFAULT_STAPLES`
- Modify: `src/data.js` (extend `loadCloudRecipesInner`; add CRUD functions)

**Interfaces:**
- Produces (state): `state.plannedMeals: Array<{id, recipeId, day, sortOrder, made}>`, `state.grocery: Array<{id, itemKey, display, status, manual, sortOrder}>`, `state.staples: string[]`, `state.planPane: "plan"|"groceries"`.
- Produces (data.js), all `async`, all guarded by `cloud.connected && cloud.client && cloud.householdId`:
  - `loadPlanData()`: populate the three state arrays; seed staples if empty.
  - `addPlannedMeal(recipeId)`, `removePlannedMeal(id)`, `updatePlannedMeal(id, patch)` (patch keys: `day`, `made`, `sortOrder`), `clearMadeMeals()`.
  - `replaceGrocery(items)` (bulk upsert+delete to match a merged list), `addGroceryItem(display)`, `setGroceryStatus(id, status)`, `clearGotItems()`, `clearAllGrocery()`.
  - `addStaple(name)`, `removeStaple(name)`.
  - `startNewWeek()`: `clearMadeMeals()` + delete `got` grocery rows.

- [ ] **Step 1: Add state fields.** In `src/helpers.js` `state` object (line 140), add after `activeImportDraft: null`:
```javascript
  plannedMeals: [],
  grocery: [],
  staples: [],
  planPane: "plan"
```
(Add a comma after the previous last property.)

- [ ] **Step 2: Add the default staples constant** at the end of `src/helpers.js` (before the Node export block):
```javascript
const DEFAULT_STAPLES = ["salt", "pepper", "black pepper", "olive oil", "oil", "butter", "water", "sugar", "flour"];
```

- [ ] **Step 3: Load plan data.** In `src/data.js`, at the end of `loadCloudRecipesInner` (right before `cloud.connected = true;` at line 103, or immediately after it), call a new loader. Add after `cloud.connected = true;`:
```javascript
  await loadPlanData();
```
Then add the function (near the other loaders):
```javascript
async function loadPlanData() {
  if (!cloud.client || !cloud.householdId) return;
  const [{ data: meals }, { data: groceries }, { data: staples }] = await Promise.all([
    cloud.client.from("planned_meals").select("*").eq("household_id", cloud.householdId).order("sort_order"),
    cloud.client.from("grocery_items").select("*").eq("household_id", cloud.householdId).order("sort_order"),
    cloud.client.from("pantry_staples").select("name").eq("household_id", cloud.householdId).order("name")
  ]);
  state.plannedMeals = (meals || []).map((r) => ({ id: r.id, recipeId: r.recipe_id, day: r.day, sortOrder: r.sort_order, made: r.made }));
  state.grocery = (groceries || []).map((r) => ({ id: r.id, itemKey: r.item_key, display: r.display, status: r.status, manual: r.manual, sortOrder: r.sort_order }));
  state.staples = (staples || []).map((r) => r.name);
  if (!state.staples.length) {
    await seedStaples();
  }
}

async function seedStaples() {
  const rows = DEFAULT_STAPLES.map((name) => ({ household_id: cloud.householdId, name }));
  const { error } = await cloud.client.from("pantry_staples").insert(rows);
  if (!error) state.staples = [...DEFAULT_STAPLES];
}
```

- [ ] **Step 4: Add planned-meal CRUD** in `src/data.js`:
```javascript
async function addPlannedMeal(recipeId) {
  if (!cloud.connected || !cloud.client || !cloud.householdId) return;
  const sortOrder = state.plannedMeals.reduce((m, x) => Math.max(m, x.sortOrder), 0) + 1;
  const { data, error } = await cloud.client.from("planned_meals").insert({
    household_id: cloud.householdId, recipe_id: recipeId, sort_order: sortOrder, created_by: cloud.session?.user?.id || null
  }).select().single();
  if (error) throw error;
  state.plannedMeals.push({ id: data.id, recipeId, day: null, sortOrder, made: false });
}

async function removePlannedMeal(id) {
  if (!cloud.connected || !cloud.client || !cloud.householdId) return;
  const { error } = await cloud.client.from("planned_meals").delete().eq("id", id).eq("household_id", cloud.householdId);
  if (error) throw error;
  state.plannedMeals = state.plannedMeals.filter((m) => m.id !== id);
}

async function updatePlannedMeal(id, patch) {
  if (!cloud.connected || !cloud.client || !cloud.householdId) return;
  const dbPatch = {};
  if ("day" in patch) dbPatch.day = patch.day;
  if ("made" in patch) dbPatch.made = patch.made;
  if ("sortOrder" in patch) dbPatch.sort_order = patch.sortOrder;
  const { error } = await cloud.client.from("planned_meals").update(dbPatch).eq("id", id).eq("household_id", cloud.householdId);
  if (error) throw error;
  const meal = state.plannedMeals.find((m) => m.id === id);
  if (meal) Object.assign(meal, patch);
}

async function clearMadeMeals() {
  if (!cloud.connected || !cloud.client || !cloud.householdId) return;
  const { error } = await cloud.client.from("planned_meals").delete().eq("household_id", cloud.householdId).eq("made", true);
  if (error) throw error;
  state.plannedMeals = state.plannedMeals.filter((m) => !m.made);
}
```
(Use `updatePlannedMeal(id, { day })`, `{ made }`, `{ sortOrder }` for the day/made/reorder cases; a single patch function keeps this DRY.)

- [ ] **Step 5: Add grocery + staple CRUD** in `src/data.js`:
```javascript
// Replace the persisted grocery list to match a merged in-memory list. Deletes
// removed keys, upserts the rest. `merged` items are { item_key, display, status, manual }.
async function replaceGrocery(merged) {
  if (!cloud.connected || !cloud.client || !cloud.householdId) return;
  const keep = new Set(merged.map((m) => m.item_key));
  const toDelete = state.grocery.filter((g) => !keep.has(g.itemKey)).map((g) => g.id);
  if (toDelete.length) {
    const { error } = await cloud.client.from("grocery_items").delete().in("id", toDelete);
    if (error) throw error;
  }
  const rows = merged.map((m, i) => ({
    household_id: cloud.householdId, item_key: m.item_key, display: m.display,
    status: m.status, manual: m.manual, sort_order: i, updated_at: new Date().toISOString()
  }));
  const { data, error } = await cloud.client.from("grocery_items")
    .upsert(rows, { onConflict: "household_id,item_key" }).select();
  if (error) throw error;
  state.grocery = (data || []).map((r) => ({ id: r.id, itemKey: r.item_key, display: r.display, status: r.status, manual: r.manual, sortOrder: r.sort_order }));
}

async function addGroceryItem(display) {
  if (!cloud.connected || !cloud.client || !cloud.householdId) return;
  const itemKey = `manual:${display.toLowerCase().trim()}`;
  const sortOrder = state.grocery.reduce((m, x) => Math.max(m, x.sortOrder), 0) + 1;
  const { data, error } = await cloud.client.from("grocery_items").insert({
    household_id: cloud.householdId, item_key: itemKey, display: display.trim(), status: "need", manual: true, sort_order: sortOrder
  }).select().single();
  if (error) throw error;
  state.grocery.push({ id: data.id, itemKey, display: display.trim(), status: "need", manual: true, sortOrder });
}

async function setGroceryStatus(id, status) {
  if (!cloud.connected || !cloud.client || !cloud.householdId) return;
  const { error } = await cloud.client.from("grocery_items").update({ status, updated_at: new Date().toISOString() }).eq("id", id).eq("household_id", cloud.householdId);
  if (error) throw error;
  const item = state.grocery.find((g) => g.id === id);
  if (item) item.status = status;
}

async function clearGrocery(predicate) {
  if (!cloud.connected || !cloud.client || !cloud.householdId) return;
  const ids = state.grocery.filter(predicate).map((g) => g.id);
  if (!ids.length) return;
  const { error } = await cloud.client.from("grocery_items").delete().in("id", ids);
  if (error) throw error;
  state.grocery = state.grocery.filter((g) => !ids.includes(g.id));
}

async function addStaple(name) {
  if (!cloud.connected || !cloud.client || !cloud.householdId) return;
  const clean = name.toLowerCase().trim();
  if (!clean || state.staples.includes(clean)) return;
  const { error } = await cloud.client.from("pantry_staples").insert({ household_id: cloud.householdId, name: clean });
  if (error) throw error;
  state.staples.push(clean);
}

async function removeStaple(name) {
  if (!cloud.connected || !cloud.client || !cloud.householdId) return;
  const { error } = await cloud.client.from("pantry_staples").delete().eq("household_id", cloud.householdId).eq("name", name);
  if (error) throw error;
  state.staples = state.staples.filter((s) => s !== name);
}

async function startNewWeek() {
  await clearMadeMeals();
  await clearGrocery((g) => g.status === "got");
}
```

- [ ] **Step 6: Syntax check.** Run: `node --check src/helpers.js && node --check src/data.js`
Expected: success.

- [ ] **Step 7: Commit.**
```bash
git add src/helpers.js src/data.js
git commit -m "feat(data): load + CRUD for planned meals, grocery, staples"
```

---

## Task 7: `index.html`: nav item, plan view, modals, import checkbox, script tag

**Files:**
- Modify: `index.html`

**Interfaces:**
- Produces DOM ids used by Task 8-11: `#plan-view`, `#plan-toggle` (two buttons `[data-pane="plan"|"groceries"]`), `#planned-list`, `#grocery-list`, `#add-meal-button`, `#generate-grocery-button`, `#start-new-week-button`, `#add-meal-modal` (+ `#add-meal-search`, `#add-meal-results`, `#add-meal-confirm`), `#staples-modal` (+ `#staples-list`, `#staples-input`, `#staples-add`, `#staples-close`), `#add-grocery-button`, import checkbox `name="addToPlan"`.

- [ ] **Step 1: Add the sidebar nav item.** In `index.html`, inside the `<nav>` (after the `data-view="recent"` button, before `data-view="pastry"` is fine), add:
```html
          <button class="nav-item" data-view="plan">
            <svg class="nav-icon icon"><use href="#i-book"/></svg> This week
          </button>
```
(Reuse `#i-book` icon; a dedicated icon is optional polish.)

- [ ] **Step 2: Add the `#plan-view` container.** After the `<div id="detail-view" hidden></div>` line (index.html:152), add:
```html
        <div id="plan-view" hidden>
          <section class="content-section plan-section">
            <div class="plan-toggle" id="plan-toggle" role="tablist">
              <button class="plan-toggle-btn is-active" data-pane="plan">Plan</button>
              <button class="plan-toggle-btn" data-pane="groceries">Groceries</button>
            </div>

            <div id="plan-pane">
              <div class="section-heading">
                <h2 id="view-title-plan">This week</h2>
                <div class="plan-actions">
                  <button class="filter-button" id="add-meal-button">＋ Add meal</button>
                  <button class="ghost-button" id="start-new-week-button">Start a new week</button>
                </div>
              </div>
              <div id="planned-list" class="planned-list"></div>
              <div class="plan-footer">
                <button class="primary-button" id="generate-grocery-button">Generate / update grocery list</button>
                <button class="ghost-button" id="clear-made-button">Clear made</button>
              </div>
            </div>

            <div id="grocery-pane" hidden>
              <div class="section-heading">
                <h2>Grocery list</h2>
                <div class="plan-actions">
                  <button class="filter-button" id="add-grocery-button">＋ Add item</button>
                  <button class="icon-button" id="staples-button" title="Pantry staples">⚙</button>
                </div>
              </div>
              <div id="grocery-list" class="grocery-list"></div>
              <div class="plan-footer">
                <button class="ghost-button" id="clear-got-button">Clear got</button>
                <button class="ghost-button" id="clear-all-grocery-button">Clear all</button>
              </div>
            </div>
          </section>
        </div>
```

- [ ] **Step 3: Add the add-meal modal** (mirror the label-manager modal skeleton at index.html:328). Place next to the other `.modal-backdrop` blocks:
```html
    <div id="add-meal-modal" class="modal-backdrop" hidden>
      <section class="modal" aria-labelledby="add-meal-title">
        <button class="modal-close" id="add-meal-close" aria-label="Close">×</button>
        <p class="eyebrow">Plan the week</p>
        <h2 id="add-meal-title">Add to this week</h2>
        <input id="add-meal-search" class="filter-search" type="search" placeholder="Search your recipes…" autocomplete="off" enterkeyhint="search" />
        <div id="add-meal-results" class="add-meal-results"></div>
        <div class="form-actions">
          <button type="button" class="primary-button" id="add-meal-confirm">Add 0 meals</button>
        </div>
      </section>
    </div>
```

- [ ] **Step 4: Add the staples modal:**
```html
    <div id="staples-modal" class="modal-backdrop" hidden>
      <section class="modal" aria-labelledby="staples-title">
        <button class="modal-close" id="staples-close" aria-label="Close">×</button>
        <p class="eyebrow">Grocery list</p>
        <h2 id="staples-title">Pantry staples</h2>
        <p class="modal-intro">Items you usually have. These start unchecked ("have") when you generate a grocery list.</p>
        <div class="staples-add-row">
          <input id="staples-input" placeholder="e.g. soy sauce" />
          <button type="button" class="primary-button" id="staples-add">Add</button>
        </div>
        <div id="staples-list" class="staples-list"></div>
        <div class="form-actions">
          <button type="button" class="primary-button" id="staples-done">Done</button>
        </div>
      </section>
    </div>
```

- [ ] **Step 5: Add the import "add to this week" checkbox.** In `index.html`, inside `#import-review-form`, after the suggestion-box block (index.html:302), add:
```html
            <label class="add-to-plan-field">
              <input type="checkbox" name="addToPlan" /> Add to this week after saving
            </label>
```

- [ ] **Step 6: Add the grocery.js script tag + bump cache.** Add before the `src/data.js` tag (so load order is helpers, grocery, data, ui):
```html
  <script src="src/grocery.js?v=20260918-meal-planning"></script>
```
And update the `?v=` on the existing `styles.css`, `src/helpers.js`, `src/data.js`, `src/ui.js` tags to `20260918-meal-planning`.

- [ ] **Step 7: Verify markup loads.** Run a local server and confirm no console errors (the new ids are inert until Task 8-12 wire them):
```bash
python3 -m http.server 4173
```
Open `http://localhost:4173/`, confirm the "This week" nav item appears and the page has no console errors.

- [ ] **Step 8: Commit.**
```bash
git add index.html
git commit -m "feat(ui): plan view container, add-meal + staples modals, import checkbox"
```

---

## Task 8: `render()` plan branch + `renderPlan` (meal list) + nav + toggle

**Files:**
- Modify: `src/ui.js` (`render` at 239, nav wiring at 1425, add `renderPlan`)

**Interfaces:**
- Consumes: `state.plannedMeals`, `state.view`, `state.planPane`, `state.recipes`, `updatePlannedMeal`, `removePlannedMeal`, `clearMadeMeals`, `startNewWeek`, `showRecipe`.
- Produces: `renderPlan()` fills `#planned-list`; `render()` shows `#plan-view` when `state.view === "plan"` and not in detail mode.

- [ ] **Step 1: Branch `render()` to the plan view.** In `src/ui.js` `render()` (239), after the `const detail = ...` / list-vs-detail visibility lines, set plan visibility. Replace:
```javascript
  const detail = state.mode === "detail" && state.activeRecipe;
  $("#list-view").hidden = detail;
  $("#detail-view").hidden = !detail;
  if (detail) {
    renderDetail(state.activeRecipe);
    return;
  }
```
with:
```javascript
  const detail = state.mode === "detail" && state.activeRecipe;
  const planView = !detail && state.view === "plan";
  $("#detail-view").hidden = !detail;
  $("#plan-view").hidden = !planView;
  $("#list-view").hidden = detail || planView;
  if (detail) {
    renderDetail(state.activeRecipe);
    return;
  }
  $$(".nav-item").forEach((item) => item.classList.toggle("is-active", item.dataset.view === state.view));
  if (planView) {
    renderPlan();
    renderGroceries();
    return;
  }
```
(The existing `$$(".nav-item")...is-active` line lower down stays; it is harmless to set twice, or remove the later duplicate.)

- [ ] **Step 2: Implement `renderPlan`.** Add to `src/ui.js`:
```javascript
const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function renderPlan() {
  const listEl = $("#planned-list");
  if (!listEl) return;
  const byId = new Map(state.recipes.map((r) => [r.id, r]));
  const meals = [...state.plannedMeals]
    .sort((a, b) => (a.made === b.made ? a.sortOrder - b.sortOrder : a.made ? 1 : -1));
  if (!meals.length) {
    listEl.innerHTML = `<p class="loading-note">No meals planned yet. Use “Add meal”, or “Add to this week” on any recipe.</p>`;
    return;
  }
  listEl.innerHTML = meals.map((m) => {
    const recipe = byId.get(m.recipeId);
    const title = recipe ? esc(recipe.title) : "(recipe removed)";
    const day = m.day == null ? "none" : DAY_LABELS[m.day];
    return `<div class="planned-row${m.made ? " is-made" : ""}" data-meal-id="${escAttr(m.id)}">
      <input type="checkbox" class="planned-made" ${m.made ? "checked" : ""} aria-label="Mark made" />
      <button class="planned-title" data-recipe-id="${escAttr(m.recipeId)}">${title}</button>
      <select class="planned-day" aria-label="Day">
        <option value=""${m.day == null ? " selected" : ""}>none</option>
        ${DAY_LABELS.map((d, i) => `<option value="${i}"${m.day === i ? " selected" : ""}>${d}</option>`).join("")}
      </select>
      <button class="planned-remove" aria-label="Remove">×</button>
    </div>`;
  }).join("");
  // wire rows
  $$(".planned-row", listEl).forEach((row) => {
    const id = row.dataset.mealId;
    row.querySelector(".planned-made").addEventListener("change", async (e) => { await updatePlannedMeal(id, { made: e.target.checked }); renderPlan(); });
    row.querySelector(".planned-title").addEventListener("click", (e) => showRecipe(e.target.dataset.recipeId));
    row.querySelector(".planned-day").addEventListener("change", async (e) => { await updatePlannedMeal(id, { day: e.target.value === "" ? null : Number(e.target.value) }); });
    row.querySelector(".planned-remove").addEventListener("click", async () => { await removePlannedMeal(id); renderPlan(); });
  });
}
```

- [ ] **Step 3: Wire the toggle, nav, and plan buttons.** Add to the event-wiring section (near ui.js:1339):
```javascript
$$("#plan-toggle .plan-toggle-btn").forEach((btn) => btn.addEventListener("click", () => {
  state.planPane = btn.dataset.pane;
  $$("#plan-toggle .plan-toggle-btn").forEach((b) => b.classList.toggle("is-active", b === btn));
  $("#plan-pane").hidden = state.planPane !== "plan";
  $("#grocery-pane").hidden = state.planPane !== "groceries";
}));
$("#clear-made-button")?.addEventListener("click", async () => { if (confirm("Clear all meals marked made?")) { await clearMadeMeals(); renderPlan(); } });
$("#start-new-week-button")?.addEventListener("click", async () => { if (confirm("Start a new week? This clears made meals and checked-off grocery items.")) { await startNewWeek(); renderPlan(); renderGroceries(); } });
```
The existing `.nav-item` handler at 1425 already sets `state.view = item.dataset.view` and calls `render()`, so `data-view="plan"` works with no change.

- [ ] **Step 4: Add a stub `renderGroceries`** so `render()` does not throw before Task 10 (replace fully in Task 10):
```javascript
function renderGroceries() { /* implemented in Task 10 */ }
```

- [ ] **Step 4b: Hide the "This week" nav for signed-out visitors** (spec §F: feature is household-only). In `updateReadOnlyChrome()` (existing function that toggles owner-only chrome), add a line to show the nav item only when connected:
```javascript
  const planNav = $(".nav-item[data-view='plan']");
  if (planNav) planNav.hidden = !cloud.connected;
```
If a signed-out user is somehow on `state.view === "plan"` (e.g. stale state), also guard in `render()`'s plan branch: `if (planView && !cloud.connected) { state.view = "library"; }` before the visibility toggles.

- [ ] **Step 5: Syntax check + browser.** Run: `node --check src/ui.js`; then serve and click "This week", confirm the empty-state note shows and the Plan | Groceries toggle switches panes without errors.

- [ ] **Step 6: Commit.**
```bash
git add src/ui.js
git commit -m "feat(ui): This week view, meal list rendering, pane toggle"
```

---

## Task 9: Add-meal modal (search + multi-select) and quick-add entry points

**Files:**
- Modify: `src/ui.js` (add modal logic; extend `renderDetail` actions; extend card rendering; import handler)

**Interfaces:**
- Consumes: `state.recipes`, `state.plannedMeals`, `addPlannedMeal`, `filteredRecipes`/search matching, `renderPlan`, `showToast`.
- Produces: `openAddMealModal()`, `closeAddMealModal()`; `#made-this-button` sibling `#add-to-plan-button` on detail; a `.card-plan` button per grid card.

- [ ] **Step 1: Implement the add-meal modal** in `src/ui.js`:
```javascript
let addMealSelection = new Set();

function openAddMealModal() {
  addMealSelection = new Set();
  $("#add-meal-search").value = "";
  renderAddMealResults("");
  $("#add-meal-modal").hidden = false;
  $("#add-meal-search").focus();
}
function closeAddMealModal() { $("#add-meal-modal").hidden = true; }

function renderAddMealResults(query) {
  const q = query.trim().toLowerCase();
  const results = state.recipes
    .filter((r) => !q || r.title.toLowerCase().includes(q))
    .slice(0, 50);
  const listEl = $("#add-meal-results");
  listEl.innerHTML = results.map((r) => `
    <button class="add-meal-item${addMealSelection.has(r.id) ? " is-selected" : ""}" data-recipe-id="${escAttr(r.id)}">
      ${addMealSelection.has(r.id) ? "▣" : "▢"} ${esc(r.title)}
      <span class="add-meal-time">${esc(formatTimeLabel(r.time))}</span>
    </button>`).join("") || `<p class="loading-note">No matches.</p>`;
  $$(".add-meal-item", listEl).forEach((btn) => btn.addEventListener("click", () => {
    const id = btn.dataset.recipeId;
    if (addMealSelection.has(id)) addMealSelection.delete(id); else addMealSelection.add(id);
    renderAddMealResults($("#add-meal-search").value);
    $("#add-meal-confirm").textContent = `Add ${addMealSelection.size} meal${addMealSelection.size === 1 ? "" : "s"}`;
  }));
}
```

- [ ] **Step 2: Wire the modal buttons** (event-wiring section):
```javascript
$("#add-meal-button")?.addEventListener("click", openAddMealModal);
$("#add-meal-close")?.addEventListener("click", closeAddMealModal);
$("#add-meal-modal")?.addEventListener("click", (e) => { if (e.target.id === "add-meal-modal") closeAddMealModal(); });
$("#add-meal-search")?.addEventListener("input", (e) => renderAddMealResults(e.target.value));
$("#add-meal-confirm")?.addEventListener("click", async () => {
  for (const id of addMealSelection) await addPlannedMeal(id);
  closeAddMealModal();
  renderPlan();
  showToast(`Added ${addMealSelection.size} to this week.`);
});
```

- [ ] **Step 3: Add "Add to this week" on the detail view.** In `renderDetail`'s actions markup (ui.js:822-836), inside the `.cook-tracker` or `.drawer-actions` block, add (only when `editable`):
```javascript
      <button type="button" class="ghost-button" id="add-to-plan-button">＋ Add to this week</button>
```
Then in the detail wiring (near ui.js:873 where `#made-this-button` is wired):
```javascript
  $("#add-to-plan-button")?.addEventListener("click", async () => {
    if (state.plannedMeals.some((m) => m.recipeId === recipe.id && !m.made)) { showToast("Already on this week's plan."); return; }
    await addPlannedMeal(recipe.id);
    showToast("Added to this week.");
  });
```

- [ ] **Step 4: Add "＋ Plan" on grid cards.** In `renderRecipes` card markup (the `.recipe-card` template around ui.js:191-210), add a small button and wire it. Add inside the card, after the title/meta:
```javascript
      <button class="card-plan" data-plan-id="${escAttr(recipe.id)}" aria-label="Add to this week" title="Add to this week">＋ Plan</button>
```
And where card click handlers are wired (near ui.js:210):
```javascript
  $$(".card-plan").forEach((btn) => btn.addEventListener("click", async (e) => {
    e.stopPropagation();
    const id = btn.dataset.planId;
    if (state.plannedMeals.some((m) => m.recipeId === id && !m.made)) { showToast("Already on this week's plan."); return; }
    await addPlannedMeal(id);
    showToast("Added to this week.");
  }));
```
(Guard: only render `.card-plan` when signed in / editable, matching how other owner-only chrome is gated. Reuse the existing read-only check used for the cook button.)

- [ ] **Step 5: Handle the import checkbox.** In the `#import-review-form` submit handler (ui.js:1479), after `persistNewRecipe(recipe);`, capture the checkbox and add to plan once saved. Change the tail:
```javascript
  closeImportModal();
  state.activeImportDraft = null;
  const addToPlan = data.get("addToPlan") === "on";
  persistNewRecipe(recipe).then(async () => {
    if (addToPlan && recipe.id) { await addPlannedMeal(recipe.id); showToast("Saved and added to this week."); }
  });
```
(If `persistNewRecipe` is not currently a Promise, confirm it returns one after the cloud insert; `saveRecipeToCloud` sets `recipe.id`. If it is not async, wrap the add in the existing post-save callback instead. Verify `persistNewRecipe`'s signature before wiring.)

- [ ] **Step 6: Syntax check + browser test.** Run `node --check src/ui.js`; serve; add two recipes via the modal (confirm the button count updates and both land on the plan); add one from a card and from a detail page; import a recipe with the checkbox ticked and confirm it appears on the plan.

- [ ] **Step 7: Commit.**
```bash
git add src/ui.js index.html
git commit -m "feat(ui): add-meal modal, quick-add on cards/detail, import-to-plan"
```

---

## Task 10: Grocery generation, rendering, status toggles, add-item, clears

**Files:**
- Modify: `src/ui.js` (real `renderGroceries`, generate handler, wiring)

**Interfaces:**
- Consumes: `aggregateGroceries`, `mergeGrocery`, `GROCERY_STATUS`, `normalizeIngredientName` (grocery.js globals); `state.plannedMeals`, `state.recipes`, `state.grocery`, `state.staples`; `replaceGrocery`, `addGroceryItem`, `setGroceryStatus`, `clearGrocery`.
- Produces: real `renderGroceries()`; `generateGrocery()`.

- [ ] **Step 1: Implement `generateGrocery`** in `src/ui.js` (replace the Task 8 stub area):
```javascript
async function generateGrocery() {
  const byId = new Map(state.recipes.map((r) => [r.id, r]));
  const recipes = state.plannedMeals
    .filter((m) => !m.made)
    .map((m) => byId.get(m.recipeId))
    .filter(Boolean);
  const aggregated = aggregateGroceries(recipes);
  const stapleKeys = new Set(state.staples.map((s) => normalizeIngredientName(s)));
  const existing = state.grocery.map((g) => ({ item_key: g.itemKey, display: g.display, status: g.status, manual: g.manual }));
  const merged = mergeGrocery(existing, aggregated, stapleKeys);
  await replaceGrocery(merged);
  renderGroceries();
  state.planPane = "groceries";
  $("#plan-pane").hidden = true; $("#grocery-pane").hidden = false;
  $$("#plan-toggle .plan-toggle-btn").forEach((b) => b.classList.toggle("is-active", b.dataset.pane === "groceries"));
}
```

- [ ] **Step 2: Implement `renderGroceries`** (replace the stub):
```javascript
function renderGroceries() {
  const listEl = $("#grocery-list");
  if (!listEl) return;
  const groups = { need: [], got: [], have: [] };
  state.grocery.forEach((g) => (groups[g.status] || groups.need).push(g));
  const section = (title, items, opts = {}) => items.length ? `
    <div class="grocery-group grocery-${opts.cls || title.toLowerCase()}">
      <div class="grocery-group-head">${esc(title)}${opts.count ? ` (${items.length})` : ""}</div>
      ${items.map((g) => `
        <div class="grocery-row status-${g.status}" data-grocery-id="${escAttr(g.id)}">
          <input type="checkbox" class="grocery-check" ${g.status === "got" ? "checked" : ""} aria-label="Got it" />
          <span class="grocery-label">${esc(g.display)}${g.manual ? ` <span class="grocery-manual">(added by you)</span>` : ""}</span>
          <button class="grocery-have" title="I have this">have</button>
          <button class="grocery-remove" aria-label="Remove">×</button>
        </div>`).join("")}
    </div>` : "";
  const html = section("Need", groups.need) + section("Got", groups.got) + section("Have / skipping", groups.have, { count: true, cls: "have" });
  listEl.innerHTML = html || `<p class="loading-note">Nothing to buy: generate from this week's meals, or all planned meals are made.</p>`;
  $$(".grocery-row", listEl).forEach((row) => {
    const id = row.dataset.groceryId;
    row.querySelector(".grocery-check").addEventListener("change", async (e) => { await setGroceryStatus(id, e.target.checked ? "got" : "need"); renderGroceries(); });
    row.querySelector(".grocery-have").addEventListener("click", async () => { await setGroceryStatus(id, "have"); renderGroceries(); });
    row.querySelector(".grocery-remove").addEventListener("click", async () => { await clearGrocery((g) => g.id === id); renderGroceries(); });
  });
}
```

- [ ] **Step 3: Wire generate / add-item / clears** (event-wiring section):
```javascript
$("#generate-grocery-button")?.addEventListener("click", generateGrocery);
$("#add-grocery-button")?.addEventListener("click", async () => {
  const label = prompt("Add an item to the grocery list:");
  if (label && label.trim()) { await addGroceryItem(label); renderGroceries(); }
});
$("#clear-got-button")?.addEventListener("click", async () => { await clearGrocery((g) => g.status === "got"); renderGroceries(); });
$("#clear-all-grocery-button")?.addEventListener("click", async () => { if (confirm("Clear the whole grocery list?")) { await clearGrocery(() => true); renderGroceries(); } });
```

- [ ] **Step 4: Syntax check + browser test.** Run `node --check src/ui.js`; serve; plan 2-3 recipes; Generate; confirm aggregation (a shared ingredient sums), staples appear under Have, checking items moves them to Got; add a manual item; add another recipe and Generate again, confirm your checked/have items are unchanged and only new items appear as Need.

- [ ] **Step 5: Commit.**
```bash
git add src/ui.js
git commit -m "feat(ui): grocery generation, list rendering, status + clears"
```

---

## Task 11: Pantry staples editor (mirror label manager)

**Files:**
- Modify: `src/ui.js` (open/render/close + wiring)

**Interfaces:**
- Consumes: `state.staples`, `addStaple`, `removeStaple`.
- Produces: `openStaples()`, `renderStaples()`, `closeStaples()`.

- [ ] **Step 1: Implement** in `src/ui.js` (mirror `openLabelManager`/`renderLabelManager`/`closeLabelManager` at 39-96):
```javascript
function openStaples() { renderStaples(); $("#staples-modal").hidden = false; }
function closeStaples() { $("#staples-modal").hidden = true; }
function renderStaples() {
  const listEl = $("#staples-list");
  if (!listEl) return;
  listEl.innerHTML = state.staples.length
    ? state.staples.map((name) => `
      <div class="staples-row" data-staple="${escAttr(name)}">
        <span>${esc(name)}</span>
        <button type="button" class="danger-button staples-remove" data-remove="${escAttr(name)}">Remove</button>
      </div>`).join("")
    : `<p class="loading-note">No staples yet.</p>`;
  $$(".staples-remove", listEl).forEach((btn) => btn.addEventListener("click", async () => { await removeStaple(btn.dataset.remove); renderStaples(); }));
}
```

- [ ] **Step 2: Wire** (event-wiring section):
```javascript
$("#staples-button")?.addEventListener("click", openStaples);
$("#staples-close")?.addEventListener("click", closeStaples);
$("#staples-done")?.addEventListener("click", closeStaples);
$("#staples-modal")?.addEventListener("click", (e) => { if (e.target.id === "staples-modal") closeStaples(); });
$("#staples-add")?.addEventListener("click", async () => { const v = $("#staples-input").value; if (v.trim()) { await addStaple(v); $("#staples-input").value = ""; renderStaples(); } });
$("#staples-input")?.addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); $("#staples-add").click(); } });
```

- [ ] **Step 3: Syntax check + browser.** Run `node --check src/ui.js`; open Groceries pane, click the staples gear, add "soy sauce", remove one, close; generate a list with a recipe containing a staple and confirm it lands under Have.

- [ ] **Step 4: Commit.**
```bash
git add src/ui.js
git commit -m "feat(ui): pantry staples editor"
```

---

## Task 12: Styles + final QA + deploy prep

**Files:**
- Modify: `styles.css`, `index.html` (`?v=` already bumped in Task 7; re-confirm)

- [ ] **Step 1: Add styles** in the "Editorial component styles" section of `styles.css` (flat, no rounding, reuse tokens). Add rules for: `.plan-toggle` / `.plan-toggle-btn` (segmented, `--tint` active), `.planned-list` / `.planned-row` (grid: checkbox, title button flush-left, day select, remove; `.is-made` strikethrough + muted), `.plan-footer` (flex, spaced), `.add-meal-results` / `.add-meal-item` (list, `.is-selected` with `--tint` tick), `.grocery-list` / `.grocery-group` / `.grocery-row` (checkbox + label + have/remove; `.status-got` strikethrough; `.grocery-have` muted), `.staples-row`, `.card-plan` (small flat button top-right of a card). Match the existing flat, ALL-CAPS-label aesthetic. Example baseline:
```css
.plan-toggle { display: flex; gap: 0; margin-bottom: 18px; }
.plan-toggle-btn { font-family: var(--mono); text-transform: uppercase; letter-spacing: .05em; border: 1px solid var(--rule); background: transparent; padding: 8px 16px; }
.plan-toggle-btn.is-active { background: var(--tint); color: var(--badge-ink); }
.planned-row { display: grid; grid-template-columns: auto 1fr auto auto; align-items: center; gap: 12px; padding: 10px 0; border-bottom: 1px solid var(--line); }
.planned-row.is-made .planned-title { text-decoration: line-through; color: var(--muted); }
.planned-title { border: 0; background: transparent; text-align: left; font: 500 18px var(--display); cursor: pointer; }
.grocery-row { display: grid; grid-template-columns: auto 1fr auto auto; align-items: center; gap: 10px; padding: 8px 0; border-bottom: 1px solid var(--line); }
.grocery-row.status-got .grocery-label { text-decoration: line-through; color: var(--muted); }
.grocery-group-head { font-family: var(--mono); text-transform: uppercase; letter-spacing: .08em; font-size: 11px; color: var(--muted); margin: 14px 0 6px; }
.card-plan { font-family: var(--mono); text-transform: uppercase; font-size: 10px; letter-spacing: .05em; border: 1px solid var(--line); background: var(--white); padding: 3px 6px; }
```

- [ ] **Step 2: Confirm cache-bust.** Ensure `styles.css`, `src/helpers.js`, `src/grocery.js`, `src/data.js`, `src/ui.js` tags in `index.html` all carry `?v=20260918-meal-planning`.

- [ ] **Step 3: Full browser QA pass** (local server, signed in as the household owner). Walk the spec's manual checklist:
  - Add meals (modal multi-select, card, detail, import checkbox); set days; reorder is optional (drag not implemented in v1 unless added); mark made -> sinks + strikethrough.
  - Generate grocery list; confirm aggregation sums a shared ingredient; staples under Have; check an item -> Got; add a manual item.
  - Add another recipe; Generate again; confirm checked/have/manual items are preserved and only new items appear as Need.
  - Edit staples; Clear got; Clear all; Start a new week clears made meals + got items.
  - Sign out (or anon): "This week" nav item hidden, no console errors.

- [ ] **Step 4: Run all unit tests + syntax checks.**
```bash
node --test test/
node --check src/helpers.js && node --check src/grocery.js && node --check src/data.js && node --check src/ui.js
```
Expected: all tests pass, no syntax errors.

- [ ] **Step 5: Commit.**
```bash
git add styles.css index.html
git commit -m "feat(ui): meal plan + grocery styles; cache bump"
```

- [ ] **Step 6: Snapshot note.** No `public_recipes`/`public-recipes.json` change is needed (plan/grocery data is private). Do NOT regenerate the snapshot for this feature.

---

## Notes for the executor

- `showToast`, `esc`, `escAttr`, `formatTimeLabel`, `$`, `$$` are existing globals in `helpers.js`/`ui.js`.
- Reorder-by-drag is out of scope for v1 (the spec shows a drag handle as a nicety); meals order by `sort_order` with made items sunk. If adding drag later, use `updatePlannedMeal(id, { sortOrder })`.
- Before wiring the import checkbox (Task 9 Step 5), open `persistNewRecipe` in `data.js` and confirm whether it returns a Promise; adapt the add-to-plan call to its actual shape (chain a `.then`, or add inside its existing post-save success path). Do not assume.
- Every DB write already updates `state` optimistically inside its data.js function, so UI handlers just `await` then re-render.
