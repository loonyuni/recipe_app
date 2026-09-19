// grocery.js: pure meal-plan/grocery logic (aggregation + merge). No DOM or
// cloud access so it is unit-testable. Loads as a classic script after
// helpers.js (its parsers are globals in the browser); under Node the parsers
// are pulled in explicitly below.
if (typeof module !== "undefined" && module.exports) {
  // eslint-disable-next-line no-var
  var { parseLeadingQuantity, isIngredientHeader, normalizeIngredientList, formatQuantity } = require("./helpers.js");
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
    if (last.endsWith("ies")) words[words.length - 1] = last.slice(0, -3) + "y";
    else if (/(?:o|s|x|z|ch|sh)es$/.test(last)) words[words.length - 1] = last.slice(0, -2);
    else words[words.length - 1] = last.slice(0, -1);
  }
  return words.join(" ").trim();
}

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
      parts.push(`${formatQuantity(amount)} ${amount > 1 ? pluralize(key) : key}`);
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

// Word-level staple match, used only to pre-uncheck items in the generate
// picker. An item matches when all of some staple's words appear as words in
// the item key: "salt" catches "kosher salt and freshly ground black pepper",
// "oil" catches "neutral-flavored oil", "water" catches "quarts water". This is
// looser than the exact-key match used elsewhere, on purpose.
function itemMatchesStaples(itemKey, stapleKeys) {
  const words = new Set(String(itemKey || "").split(/[\s-]+/).filter(Boolean));
  for (const s of (stapleKeys instanceof Set ? stapleKeys : (stapleKeys || []))) {
    const sWords = String(s).split(/[\s-]+/).filter(Boolean);
    if (sWords.length && sWords.every((w) => words.has(w))) return true;
  }
  return false;
}

// Build the grocery list from an explicit selection of aggregated item_keys
// (the pick-before-generate flow). Selected aggregated items become rows,
// preserving an existing row's status (so a checked-off "got" survives a
// regenerate); existing manual items are always kept. Unselected non-manual
// items drop off.
function selectGrocery(existing, aggregated, selectedKeys) {
  const sel = selectedKeys instanceof Set ? selectedKeys : new Set(selectedKeys || []);
  const existingByKey = new Map((existing || []).map((it) => [it.item_key, it]));
  const out = [];
  for (const agg of aggregated || []) {
    if (!sel.has(agg.item_key)) continue;
    const prev = existingByKey.get(agg.item_key);
    out.push({ item_key: agg.item_key, display: agg.display, status: prev ? prev.status : GROCERY_STATUS.NEED, manual: false });
  }
  for (const it of existing || []) {
    if (it.manual) out.push({ ...it });
  }
  return out;
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = { parseUnitAndName, normalizeIngredientName, UNIT_ALIASES, aggregateGroceries, mergeGrocery, GROCERY_STATUS, itemMatchesStaples, selectGrocery };
}
