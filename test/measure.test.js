const test = require("node:test");
const assert = require("node:assert");
const { ingredientMeasure, usToMetric } = require("../src/helpers.js");

test("ingredientMeasure: parses inline grams and cleans the name", () => {
  const m = ingredientMeasure("2 cups (284g) all-purpose flour");
  assert.deepStrictEqual(m.metric, { value: 284, unit: "g" });
  assert.strictEqual(m.name, "all-purpose flour");
});

test("ingredientMeasure: parses inline ml", () => {
  assert.deepStrictEqual(ingredientMeasure("½ cup (120ml) sunflower oil").metric, { value: 120, unit: "ml" });
});

test("ingredientMeasure: compound quantity keeps inline metric, strips 'plus N unit'", () => {
  const m = ingredientMeasure("½ cup plus 2 tbsp (125g) granulated sugar");
  assert.deepStrictEqual(m.metric, { value: 125, unit: "g" });
  assert.strictEqual(m.name, "granulated sugar");
});

test("ingredientMeasure: fills gaps from the density table", () => {
  assert.deepStrictEqual(ingredientMeasure("1 tsp baking powder").metric, { value: 4, unit: "g" });
  assert.deepStrictEqual(ingredientMeasure("½ tsp salt").metric, { value: 3, unit: "g" });
});

test("ingredientMeasure: eggs and unknowns stay count (no metric)", () => {
  assert.strictEqual(ingredientMeasure("2 large eggs").metric, null);
  assert.strictEqual(ingredientMeasure("Salt to taste").metric, null);
});

const { isBakingRecipe } = require("../src/helpers.js");
test("isBakingRecipe: baking titles/tags default metric, savory does not", () => {
  assert.strictEqual(isBakingRecipe({ title: "Pumpkin Cream Cheese Muffins", tags: [] }), true);
  assert.strictEqual(isBakingRecipe({ title: "Chocolate Chip Cookies", tags: [] }), true);
  assert.strictEqual(isBakingRecipe({ title: "Saucy Peanut-Coconut Tofu", tags: ["tofu"] }), false);
  assert.strictEqual(isBakingRecipe({ title: "Weeknight Chicken", tags: ["dessert"] }), true);
  assert.strictEqual(isBakingRecipe({ title: "Stew", tags: [], measurementMode: "metric" }), true);
});

test("usToMetric: cups of a known solid; oz to grams; unknown returns null", () => {
  assert.deepStrictEqual(usToMetric(2, "cups", "all-purpose flour"), { value: 250, unit: "g" });
  assert.deepStrictEqual(usToMetric(5, "oz", "cream cheese"), { value: 142, unit: "g" });
  assert.strictEqual(usToMetric(1, "cup", "chopped walnuts"), null);
});
