const test = require("node:test");
const assert = require("node:assert");
const { parseUnitAndName, normalizeIngredientName } = require("../src/grocery.js");

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
