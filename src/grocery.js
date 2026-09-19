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

if (typeof module !== "undefined" && module.exports) {
  module.exports = { parseUnitAndName, normalizeIngredientName, UNIT_ALIASES };
}
