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
