const test = require("node:test");
const assert = require("node:assert");
const { parseUnitAndName, normalizeIngredientName, aggregateGroceries, mergeGrocery, GROCERY_STATUS } = require("../src/grocery.js");

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
test("aggregateGroceries: empty input returns empty", () => {
  assert.deepStrictEqual(aggregateGroceries([]), []);
});

test("GROCERY_STATUS: has the three expected statuses", () => {
  assert.deepStrictEqual(GROCERY_STATUS, { NEED: "need", HAVE: "have", GOT: "got" });
});
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

const { itemMatchesStaples, selectGrocery } = require("../src/grocery.js");

test("itemMatchesStaples: word-level match on compound names", () => {
  const staples = new Set(["salt", "oil", "water", "black pepper"]);
  assert.strictEqual(itemMatchesStaples("kosher salt and freshly ground black pepper", staples), true);
  assert.strictEqual(itemMatchesStaples("neutral-flavored oil", staples), true);
  assert.strictEqual(itemMatchesStaples("quarts water", staples), true);
  assert.strictEqual(itemMatchesStaples("cherry tomato", staples), false);
  assert.strictEqual(itemMatchesStaples("boiling", staples), false);
});

const { ingredientKeyOf } = require("../src/grocery.js");

test("ingredientKeyOf: strips quantity + unit, normalizes", () => {
  assert.strictEqual(ingredientKeyOf("3 tablespoons cornstarch"), "cornstarch");
  assert.strictEqual(ingredientKeyOf("2 onions"), "onion");
  assert.strictEqual(ingredientKeyOf("Kosher salt (such as Diamond Crystal) and freshly ground black pepper"), "kosher salt and freshly ground black pepper");
});

test("selectGrocery: keeps selected + manual, preserves got, drops unselected", () => {
  const existing = [
    { item_key: "onion", display: "2 onions", status: "got", manual: false },
    { item_key: "manual:milk", display: "milk", status: "need", manual: true }
  ];
  const aggregated = [
    { item_key: "onion", display: "3 onions", recipeIds: [] },
    { item_key: "flour", display: "200 g flour", recipeIds: [] },
    { item_key: "salt", display: "salt", recipeIds: [] }
  ];
  const out = selectGrocery(existing, aggregated, new Set(["onion", "flour"]));
  const onion = out.find(i => i.item_key === "onion");
  assert.strictEqual(onion.display, "3 onions");
  assert.strictEqual(onion.status, "got");
  assert.ok(out.find(i => i.item_key === "flour" && i.status === "need"));
  assert.ok(!out.some(i => i.item_key === "salt"));
  assert.ok(out.some(i => i.item_key === "manual:milk"));
});
