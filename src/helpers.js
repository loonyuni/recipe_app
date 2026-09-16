// helpers.js — config, DOM helpers, formatting, scaling, sections, pure utils.
// Part of the app split into ordered classic scripts (shared global scope);
// concatenation of src/*.js in load order is identical to the old app.js.
const starterRecipes = [
  {
    id: "tomato-pasta",
    title: "Tomato pasta with crispy breadcrumbs",
    description: "A weeknight bowl with enough character to serve to friends.",
    time: 35,
    servings: 4,
    tags: ["weeknight", "vegetarian", "comfort food"],
    imageClass: "pasta",
    calories: 540,
    protein: 18,
    carbs: 78,
    fat: 17,
    rating: 4.8,
    cooked: 9,
    added: 7,
    ingredients: ["400 g spaghetti", "800 g canned whole tomatoes", "4 cloves garlic, sliced", "60 g breadcrumbs", "40 g parmesan", "60 ml olive oil"],
    instructions: ["Toast the breadcrumbs in olive oil until golden. Season and set aside.", "Simmer the tomatoes with garlic and olive oil for 20 minutes.", "Cook the pasta until just shy of al dente, then finish in the sauce.", "Top with parmesan and the crispy breadcrumbs."],
    variants: [{ name: "More garlic, less cheese", note: "My current favorite: six cloves garlic and parmesan only at the table." }],
    ratings: [{ member: "Alex", score: 5 }, { member: "Jamie", score: 4.5 }, { member: "Sam", score: 5 }],
    source: "Typed from an old notebook"
  },
  {
    id: "salmon-rice",
    title: "Miso salmon rice bowls",
    description: "Glossy, savory salmon with cucumber, rice, and a bright sesame dressing.",
    time: 40,
    servings: 4,
    tags: ["fish", "weeknight", "make ahead"],
    imageClass: "fish",
    calories: 610,
    protein: 35,
    carbs: 65,
    fat: 23,
    rating: 4.5,
    cooked: 5,
    added: 6,
    ingredients: ["600 g salmon fillets", "300 g jasmine rice", "2 tbsp white miso", "1 tbsp maple syrup", "1 cucumber", "2 tsp sesame oil"],
    instructions: ["Whisk miso, maple syrup, and sesame oil. Brush over the salmon.", "Roast at 220°C for 10–12 minutes.", "Serve over rice with cucumber and the remaining glaze."],
    variants: [{ name: "Hosting version", note: "Swap individual fillets for one large side of salmon; serve family-style." }],
    ratings: [{ member: "Alex", score: 4 }, { member: "Jamie", score: 5 }, { member: "Sam", score: 4.5 }],
    source: "Saved PDF · Bon Appétit"
  },
  {
    id: "chicken-pot-pie",
    title: "Chicken pot pie for a crowd",
    description: "A deeply savory, make-ahead dinner with a flaky golden lid.",
    time: 95,
    servings: 8,
    tags: ["hosting", "comfort food", "make ahead"],
    imageClass: "pot-pie",
    calories: 720,
    protein: 32,
    carbs: 48,
    fat: 42,
    rating: 4.9,
    cooked: 12,
    added: 5,
    ingredients: ["900 g chicken thighs", "2 carrots, diced", "2 celery stalks, diced", "750 ml chicken stock", "150 ml cream", "1 sheet puff pastry"],
    instructions: ["Brown the chicken and set aside.", "Soften the vegetables, then make a roux and whisk in stock and cream.", "Return the chicken to the filling and cool slightly.", "Top with pastry and bake at 200°C until deeply golden."],
    variants: [{ name: "Mom’s version", note: "Add frozen peas, use rotisserie chicken, and bake in a 9 × 13 inch dish." }],
    ratings: [{ member: "Alex", score: 5 }, { member: "Jamie", score: 5 }, { member: "Sam", score: 4.5 }],
    source: "Saved PDF · family folder"
  },
  {
    id: "lentil-salad",
    title: "Warm lentil salad with herbs",
    description: "Earthy lentils, sharp mustard dressing, and a lot of fresh herbs.",
    time: 30,
    servings: 4,
    tags: ["vegetarian", "potluck", "weekday lunch"],
    imageClass: "salad",
    calories: 390,
    protein: 18,
    carbs: 49,
    fat: 14,
    rating: 4.2,
    cooked: 3,
    added: 4,
    ingredients: ["300 g green lentils", "1 red onion, thinly sliced", "60 g parsley", "2 tbsp Dijon mustard", "80 ml olive oil", "1 lemon"],
    instructions: ["Simmer lentils until tender but still holding their shape.", "Whisk mustard, lemon, and olive oil into a dressing.", "Toss warm lentils with onion, herbs, and dressing."],
    variants: [{ name: "Pescatarian add-on", note: "Serve with a tin of olive-oil packed tuna or roasted salmon." }],
    ratings: [{ member: "Alex", score: 4 }, { member: "Jamie", score: 4 }, { member: "Sam", score: 4.5 }],
    source: "Typed from a magazine clipping"
  },
  {
    id: "olive-oil-cake",
    title: "Olive oil citrus cake",
    description: "Tender, fragrant, and even better the next day with coffee.",
    time: 65,
    servings: 10,
    tags: ["dessert", "hosting", "make ahead"],
    imageClass: "sweet",
    calories: 410,
    protein: 6,
    carbs: 52,
    fat: 21,
    rating: 4.7,
    cooked: 7,
    added: 3,
    ingredients: ["240 g flour", "200 g sugar", "180 ml olive oil", "3 eggs", "2 oranges, zested and juiced", "1 tsp baking powder"],
    instructions: ["Whisk eggs, sugar, olive oil, and citrus until glossy.", "Fold in flour and baking powder.", "Bake in a lined 23 cm cake tin at 175°C for 45 minutes."],
    variants: [{ name: "Less sweet", note: "Use 160 g sugar and add a pinch of flaky salt to the batter." }],
    ratings: [{ member: "Alex", score: 5 }, { member: "Jamie", score: 4 }, { member: "Sam", score: 5 }],
    source: "Saved PDF · New York Times Cooking"
  },
  {
    id: "turkey-chili",
    title: "The “make it again” turkey chili",
    description: "Smoky, flexible, and built for doubling.",
    time: 55,
    servings: 6,
    tags: ["weekday dinner", "freezer friendly", "family favorite"],
    imageClass: "chili",
    calories: 470,
    protein: 38,
    carbs: 42,
    fat: 16,
    rating: 4.6,
    cooked: 15,
    added: 2,
    ingredients: ["700 g ground turkey", "2 cans beans, drained", "800 g canned tomatoes", "1 onion, diced", "2 tbsp smoked paprika", "500 ml stock"],
    instructions: ["Brown the turkey with onion and spices.", "Add tomatoes, beans, and stock.", "Simmer uncovered until thick and deeply flavored."],
    variants: [{ name: "Current favorite", note: "Double the beans, add a square of dark chocolate, and serve with lime." }],
    ratings: [{ member: "Alex", score: 4.5 }, { member: "Jamie", score: 5 }, { member: "Sam", score: 4.5 }],
    source: "Personal recipe"
  }
];

const storedRecipes = JSON.parse(localStorage.getItem("kitchen-archive-recipes") || "null");
// An empty array is truthy, so `stored || starter` would leave a signed-out
// visitor staring at zero recipes once the cache is ever persisted as []
// (which happens transiently mid cloud-load and on some sign-out paths).
// Fall back to the seed recipes unless the cache actually holds something.
const seededRecipes = storedRecipes?.length ? storedRecipes : starterRecipes;

const state = {
  recipes: seededRecipes,
  selectedTags: [],
  search: "",
  sort: "recent",
  view: "library",
  mode: "list", // "list" (grid) or "detail" (single recipe takes over the main column)
  booting: false, // true until the first cloud/public load resolves (avoids a seed-recipe flash)
  minRating: 0, // minimum-rating filter (0 = off)
  activeRecipe: null,
  editingRecipeId: null,
  activeImportDraft: null
};

const cloud = {
  client: null,
  session: null,
  householdId: null,
  memberId: null,
  members: [],
  connected: false,
  authMode: "signin"
};
// Deployment-specific personalization. These are the only spots that carry
// household-specific data (reviewer names, photo mappings), kept together so a
// fork can point them at their own values without touching app logic.
const personalConfig = {
  // Reviewer names offered in the rating dropdown before any cloud members load.
  localReviewers: ["Uni", "Alex"],
  // Reviewer identifiers to hide from the rating UI (case-insensitive).
  hiddenReviewers: ["loonyuni"],
  // Personal photos attached by source URL and by normalized recipe title.
  imagesBySourceUrl: {
    "https://www.taste.com.au/recipes/one-pan-salmon-broccoli-bake/m8i624wf": [
      "assets/recipes/one-pan-salmon-broccoli-bake/IMG_7622.JPG",
      "assets/recipes/one-pan-salmon-broccoli-bake/IMG_7627.JPG",
      "assets/recipes/one-pan-salmon-broccoli-bake/IMG_7628.JPG"
    ]
  },
  imagesByTitle: {
    "one-pan salmon and broccoli bake": [
      "assets/recipes/one-pan-salmon-broccoli-bake/IMG_7622.JPG",
      "assets/recipes/one-pan-salmon-broccoli-bake/IMG_7627.JPG",
      "assets/recipes/one-pan-salmon-broccoli-bake/IMG_7628.JPG"
    ],
    "spicy basil chicken stir-fry": ["assets/recipes/basil-chicken-stir-fry/basil-chicken-stir-fry.png"]
  }
};
const localReviewers = personalConfig.localReviewers;
const hiddenReviewers = new Set(personalConfig.hiddenReviewers);

const queryParams = new URLSearchParams(window.location.search);
const devMode = queryParams.has("dev");
const mockMode = queryParams.has("mock");
// Permalink target parsed from ?recipe=<slug>. Opened on load (deep link) and
// kept in sync as the drawer opens/closes so a shared recipe has a stable URL.
const initialRecipeSlug = queryParams.get("recipe");
const personalImageGallery = personalConfig.imagesBySourceUrl;
const personalImageGalleryByTitle = personalConfig.imagesByTitle;

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

// Escape untrusted values before interpolating into innerHTML. Recipes are
// imported from arbitrary URLs and shared across household members, so titles,
// descriptions, ingredients, reviewer names, image URLs, etc. must never be
// treated as trusted HTML.
function esc(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);
}

// Escape a value for use inside an HTML attribute that is itself wrapped in
// double quotes (e.g. src="..."), so it can't break out of the attribute.
function escAttr(value) {
  return esc(value);
}

function formatPart(value) {
  if (typeof value === "string" || typeof value === "number") return String(value);
  if (!value || typeof value !== "object") return "";
  if (value.value !== undefined) return [value.value, value.unit].filter(Boolean).join(" ");
  if (value.name !== undefined && Object.keys(value).length <= 3) return [value.name, value.unit].filter(Boolean).join(" ");
  return Object.entries(value)
    .filter(([key]) => !["confidence", "normalized"].includes(key))
    .map(([key, item]) => formatPart(item))
    .filter(Boolean)
    .join(" ");
}

function toIngredientRecord(value) {
  if (typeof value === "string") return { original: value, metric: "", name: "" };
  if (!value || typeof value !== "object") return { original: String(value ?? ""), metric: "", name: "" };
  const original = value.original || value.original_text || value.source || value.text || "";
  const metric = value.metric || value.normalized || value.metric_text || value.grams || "";
  const name = value.name || value.ingredient || value.item || value.food || "";
  const quantity = formatPart(value.quantity ?? value.amount ?? value.qty ?? "");
  const unit = formatPart(value.unit ?? value.measurement ?? "");
  const preparation = formatPart(value.preparation ?? value.prep ?? value.notes ?? "");
  return {
    original: original || [quantity, unit, name, preparation].filter(Boolean).join(" ").trim(),
    metric: formatPart(metric),
    name,
    preparation
  };
}

function formatIngredient(value) {
  const record = toIngredientRecord(value);
  return [record.original, record.metric && record.metric !== record.original ? `(${record.metric})` : ""]
    .filter(Boolean).join(" ").trim() || JSON.stringify(value);
}

// --- Recipe scaling (view-only cooking helper) ------------------------------
// These are pure functions so they can be unit-tested in isolation. They power
// the drawer's 1x/2x/3x buttons and the fine-grained "edit any ingredient
// quantity and everything else follows" flow. None of them mutate a recipe or
// touch the cloud; scaling is a display transform only.

// Unicode vulgar fractions we might see in imported ingredient strings.
const UNICODE_FRACTIONS = {
  "¼": 0.25, "½": 0.5, "¾": 0.75,
  "⅓": 1 / 3, "⅔": 2 / 3,
  "⅕": 0.2, "⅖": 0.4, "⅗": 0.6, "⅘": 0.8,
  "⅙": 1 / 6, "⅚": 5 / 6,
  "⅛": 0.125, "⅜": 0.375, "⅝": 0.625, "⅞": 0.875,
  "⅐": 1 / 7, "⅑": 1 / 9, "⅒": 0.1
};
const UNICODE_FRACTION_CHARS = Object.keys(UNICODE_FRACTIONS).join("");

// Convert a matched quantity token ("2 1/2", "1/4", "¼", "1¼", "57.20", "500")
// into a number. Returns null when it can't be interpreted.
function quantityTokenToNumber(raw) {
  const token = String(raw).trim();
  // Mixed number: "2 1/2"
  let match = token.match(/^(\d+)\s+(\d+)\s*\/\s*(\d+)$/);
  if (match) return Number(match[1]) + Number(match[2]) / Number(match[3]);
  // Integer followed by a unicode fraction: "1¼" or "1 ½"
  match = token.match(new RegExp(`^(\\d+)\\s*([${UNICODE_FRACTION_CHARS}])$`));
  if (match) return Number(match[1]) + UNICODE_FRACTIONS[match[2]];
  // Simple fraction: "1/4"
  match = token.match(/^(\d+)\s*\/\s*(\d+)$/);
  if (match) return Number(match[1]) / Number(match[2]);
  // Lone unicode fraction: "¼"
  if (token.length === 1 && UNICODE_FRACTIONS[token] !== undefined) return UNICODE_FRACTIONS[token];
  // Decimal or integer: "57.20", "500", ".5"
  const number = Number(token);
  return Number.isFinite(number) ? number : null;
}

// Pull the LEADING quantity off an ingredient string, leaving the rest intact.
// Returns { value, token, rest } or null when there's no parseable quantity
// (e.g. "Salt to taste"). The rest keeps its original spacing so we can
// reassemble "60ml (1/4 cup) soy sauce" without inventing a space after "ml".
function parseLeadingQuantity(text) {
  const str = String(text ?? "");
  const pattern = new RegExp(
    "^(\\s*)(" +
      "\\d+\\s+\\d+\\s*/\\s*\\d+" +               // mixed number: 2 1/2
      `|\\d+\\s*[${UNICODE_FRACTION_CHARS}]` +      // integer + unicode: 1¼
      "|\\d+\\s*/\\s*\\d+" +                        // fraction: 1/4
      `|[${UNICODE_FRACTION_CHARS}]` +              // lone unicode: ¼
      "|\\d*\\.\\d+" +                              // decimal: 57.20 / .5
      "|\\d+" +                                     // integer: 500
    ")"
  );
  const match = str.match(pattern);
  if (!match) return null;
  const value = quantityTokenToNumber(match[2]);
  if (value === null || !Number.isFinite(value) || value <= 0) return null;
  return { value, token: match[2], rest: str.slice(match[0].length) };
}

// Render a scaled quantity for display: at most 2 decimals, trailing zeros
// dropped (500 -> "500", 90.4 -> "90.4", 0.25 -> "0.25").
function formatQuantity(value) {
  if (!Number.isFinite(value)) return "";
  return String(Math.round(value * 100) / 100);
}

// Scale one ingredient string by `factor`. Ingredients with no parseable
// leading quantity pass through unchanged (scaled: false).
function scaleIngredient(text, factor) {
  const parsed = parseLeadingQuantity(text);
  if (!parsed) return { text: String(text ?? ""), scaled: false, rest: String(text ?? "") };
  const scaledValue = parsed.value * factor;
  return {
    text: formatQuantity(scaledValue) + parsed.rest,
    scaled: true,
    originalValue: parsed.value,
    scaledValue,
    rest: parsed.rest
  };
}

// Imported recipes often pack several ingredients into one line, sometimes
// under a section label, e.g.
//   "Leavened dough: 150 g flour, 6 g salt, 45 g sugar"
// The scaling UI needs one quantity per line, so split that into
//   ["Leavened dough:", "150 g flour", "6 g salt", "45 g sugar"]
// A leading label (text before a colon that isn't itself a quantity) becomes
// its own static header line. The remainder is split on commas only where the
// next piece starts with its own quantity, so trailing notes stay attached:
// "4 cloves garlic, sliced" and "2 oranges, zested" are left as single lines.
function splitCompoundIngredient(line) {
  const text = String(line ?? "").trim();
  if (!text) return [];
  const out = [];
  let body = text;
  const colon = text.indexOf(":");
  if (colon > 0) {
    const label = text.slice(0, colon).trim();
    if (label && !parseLeadingQuantity(label)) {
      out.push(`${label}:`);
      body = text.slice(colon + 1).trim();
    }
  }
  if (!body) return out;
  let current = "";
  body.split(/,\s*/).forEach((segment, index) => {
    const seg = segment.trim();
    if (!seg) return;
    // The first segment opens an ingredient; a later one that starts with its
    // own quantity opens a new ingredient, otherwise it's a note ("sliced",
    // "at room temperature") that belongs to the previous line.
    if (index === 0 || parseLeadingQuantity(seg)) {
      if (current) out.push(current);
      current = seg;
    } else {
      current += `, ${seg}`;
    }
  });
  if (current) out.push(current);
  return out;
}

// Expand every line of an ingredient list through splitCompoundIngredient.
// Idempotent: already-atomic lines pass through unchanged.
function normalizeIngredientList(list) {
  return (Array.isArray(list) ? list : []).flatMap(splitCompoundIngredient);
}

// A split-off section label like "Leavened dough:" — rendered as a sub-header,
// not a scalable ingredient.
function isIngredientHeader(line) {
  const text = String(line ?? "").trim();
  return text.endsWith(":") && !parseLeadingQuantity(text);
}

// Servings scale with the recipe; round to the nearest 0.5 and show "4" or
// "4.5" (never "4.0").
function formatScaledServings(servings, factor) {
  const raw = (Number(servings) || 0) * (Number(factor) || 1);
  const rounded = Math.round(raw * 2) / 2;
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
}

// --- Recipe sections (multi-component recipes) ------------------------------
// A recipe like a flan is several component recipes (pie pastry, flan custard,
// finishing) that each carry their own ingredients and instructions but belong
// to one dish. We model that as `recipe.sections`; a plain recipe is a single
// untitled section. Sections are the source of truth for display and editing.
// The flat `recipe.ingredients`/`recipe.instructions` are derived projections
// kept in sync for search, nutrition, and the flat DB columns.

// Clean one raw section into { title, ingredients: [string], instructions:
// [string] }, coercing whatever shapes import/DB produced into display strings.
function normalizeSection(section) {
  const source = section && typeof section === "object" ? section : {};
  return {
    title: String(source.title || "").trim(),
    ingredients: (Array.isArray(source.ingredients) ? source.ingredients : []).map(formatIngredient).filter(Boolean),
    instructions: (Array.isArray(source.instructions) ? source.instructions : []).map(formatInstruction).filter(Boolean)
  };
}

// Drop empty sections; return null when nothing usable remains so callers can
// fall back to the flat single-section projection.
function normalizeSections(sections) {
  if (!Array.isArray(sections)) return null;
  const cleaned = sections
    .map(normalizeSection)
    .filter((section) => section.title || section.ingredients.length || section.instructions.length);
  return cleaned.length ? cleaned : null;
}

// The sections to render/edit for a recipe. Prefers explicit sections; a recipe
// without them (legacy rows, starter recipes) becomes one untitled section from
// its flat arrays, so single-part recipes keep working unchanged.
function getSections(recipe) {
  const explicit = normalizeSections(recipe.sections);
  if (explicit) return explicit;
  return [{
    title: "",
    ingredients: (recipe.ingredients || []).slice(),
    instructions: (recipe.instructions || []).slice()
  }];
}

// Project sections back into the flat ingredient/instruction arrays. Titled
// sections contribute a "<title>:" header line, reusing the existing header
// convention that isIngredientHeader/splitCompoundIngredient already render as
// sub-headers. Instructions are concatenated in section order.
function flatIngredientsFromSections(sections) {
  return sections.flatMap((section) => (section.title ? [`${section.title}:`] : []).concat(section.ingredients));
}
function flatInstructionsFromSections(sections) {
  return sections.flatMap((section) => section.instructions);
}

// A recipe is "sectioned" (gets the stacked, per-section layout) when it has
// more than one section or any titled section; otherwise it renders as a single
// classic Ingredients/Method block.
function isSectionedRecipe(sections) {
  return sections.length > 1 || sections.some((section) => section.title);
}

// Set recipe.sections and keep the derived flat arrays in sync. Idempotent.
// Called wherever a recipe is created or edited from a section editor.
function applyRecipeSections(recipe, rawSections) {
  const sections = normalizeSections(rawSections) || getSections(recipe);
  recipe.sections = sections;
  recipe.ingredients = flatIngredientsFromSections(sections);
  recipe.instructions = flatInstructionsFromSections(sections);
  recipe.ingredientRecords = recipe.ingredients.map(toIngredientRecord);
  return recipe;
}

// Preserve the old default of a placeholder method when a recipe is saved with
// no instructions anywhere. Drops the placeholder into the first section and
// re-derives the flat array.
function ensureInstructions(recipe) {
  if (recipe.instructions.length) return recipe;
  recipe.sections[0].instructions = ["Add cooking instructions when you are ready."];
  recipe.instructions = flatInstructionsFromSections(recipe.sections);
  return recipe;
}

function recipeImageUrls(recipe) {
  return [...new Set([recipe.imageUrl, ...(recipe.imageUrls || [])].filter(Boolean))];
}

function normalizeSourceUrl(value) {
  return String(value || "").trim().replace(/[?#].*$/, "").replace(/\/+$/, "").toLowerCase();
}

function normalizeRecipeTitle(value) {
  return String(value || "").toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim();
}

function findDuplicateRecipe(recipe) {
  const sourceUrl = normalizeSourceUrl(recipe.sourceUrl);
  if (sourceUrl) {
    const byUrl = state.recipes.find((item) => normalizeSourceUrl(item.sourceUrl) === sourceUrl);
    if (byUrl) return byUrl;
  }
  const title = normalizeRecipeTitle(recipe.title);
  return title
    ? state.recipes.find((item) => normalizeRecipeTitle(item.title) === title && (recipe.sourceUrl || item.sourceUrl || item.source?.startsWith("Distilled")))
    : null;
}

function manualRatings() {
  try {
    return JSON.parse(localStorage.getItem("kitchen-archive-manual-ratings") || "{}");
  } catch {
    return {};
  }
}

function saveManualRating(recipe, rating) {
  const saved = manualRatings();
  const key = normalizeRecipeTitle(recipe.title);
  saved[key] = [...(saved[key] || []).filter((item) => item.member !== rating.member), rating];
  localStorage.setItem("kitchen-archive-manual-ratings", JSON.stringify(saved));
}

// Drop a member's locally-cached rating for a recipe. Called once the rating
// has been persisted to the cloud so the cloud copy is the single source of
// truth; otherwise the reload merge would show the same rating twice (once
// from the cloud under the real member name, once from local under the
// reviewer alias).
function removeManualRating(recipe, member) {
  const saved = manualRatings();
  const key = normalizeRecipeTitle(recipe.title);
  const remaining = (saved[key] || []).filter((item) => item.member !== member);
  if (remaining.length) saved[key] = remaining;
  else delete saved[key];
  localStorage.setItem("kitchen-archive-manual-ratings", JSON.stringify(saved));
}

function matchingPersonalImages(title, sourceUrl = "") {
  return personalImageGallery[sourceUrl]
    || personalImageGalleryByTitle[String(title || "").trim().toLowerCase()]
    || [];
}

function formatInstruction(value) {
  if (typeof value === "string") return value;
  if (!value || typeof value !== "object") return String(value ?? "");
  return value.text ?? value.instruction ?? value.step ?? value.description ?? JSON.stringify(value);
}

function formatTime(value) {
  if (typeof value === "string" || typeof value === "number") return String(value);
  if (!value || typeof value !== "object") return "";
  if (Array.isArray(value)) return value.map(formatTime).filter(Boolean).join(" · ");
  const total = value.total ?? value.total_time ?? value.duration ?? value.minutes;
  if (total !== undefined) return formatPart(total);
  const prep = value.prep ?? value.prep_time ?? value.preparation_time;
  const cook = value.cook ?? value.cook_time ?? value.cooking_time;
  if (prep || cook) return [prep && `Prep ${formatPart(prep)}`, cook && `Cook ${formatPart(cook)}`].filter(Boolean).join(" · ");
  return Object.entries(value).map(([key, item]) => `${key}: ${formatTime(item)}`).join(" · ");
}

// Recipe `time` can be a number of minutes (starter/manual recipes) or a
// human string like "45 min" (cloud/imported recipes). These helpers give a
// single display string and a single numeric value for sorting.
function timeMinutes(value) {
  if (typeof value === "number") return value;
  const match = String(value ?? "").match(/\d+/);
  return match ? Number(match[0]) : 0;
}

function formatTimeLabel(value) {
  if (typeof value === "number") return `${value} min`;
  const text = String(value ?? "").trim();
  if (!text) return "";
  return /[a-z]/i.test(text) ? text : `${text} min`;
}

function normalizeDraft(draft) {
  const sourceImages = personalImageGallery[draft.sourceUrl] || [];
  // Multi-component imports (flan = pastry + custard + finishing) arrive as
  // `sections`. When present they drive the flat ingredient/instruction arrays
  // so search/nutrition/preview stay in sync; otherwise fall back to the flat
  // draft fields (single untitled section).
  const sections = normalizeSections(draft.sections);
  const ingredientRecords = (sections ? flatIngredientsFromSections(sections) : (draft.ingredients || [])).map(toIngredientRecord);
  const instructions = sections
    ? flatInstructionsFromSections(sections)
    : (draft.instructions || []).map(formatInstruction).filter(Boolean);
  const extractedImage = typeof draft.imageUrl === "string"
    ? draft.imageUrl
    : draft.image?.url || draft.image?.contentUrl || (Array.isArray(draft.image) ? draft.image[0]?.url || draft.image[0] : "");
  const combinedText = `${draft.title || ""} ${draft.description || ""} ${(draft.tags || []).join(" ")}`.toLowerCase();
  const measurementMode = draft.measurementMode || (/bake|cake|bread|pastry|cookie|muffin|dessert/.test(combinedText) ? "metric" : "both");
  return {
    ...draft,
    sections: sections || undefined,
    time: formatTime(draft.time) || "45 min",
    ingredients: ingredientRecords.map(formatIngredient).filter(Boolean),
    ingredientRecords,
    instructions,
    tags: (draft.tags || []).flatMap((tag) => typeof tag === "string" ? tag.split(",").map((item) => item.trim()) : tag.name || tag.label || "").filter(Boolean),
    measurementMode,
    imageUrl: extractedImage || sourceImages[0] || "",
    imageUrls: [...sourceImages, ...(draft.imageUrls || []), ...(extractedImage ? [extractedImage] : [])].filter(Boolean),
    nutrition: normalizeNutrition(draft.nutrition)
  };
}

// Coerce whatever the distill function returned into a clean numeric shape so
// the rest of the app can rely on calories/protein/carbs/fat always existing.
function normalizeNutrition(nutrition) {
  const value = nutrition || {};
  const toNumber = (input) => {
    const parsed = Number(input);
    return Number.isFinite(parsed) && parsed > 0 ? Math.round(parsed) : 0;
  };
  return {
    calories: toNumber(value.calories),
    protein: toNumber(value.protein),
    carbs: toNumber(value.carbs),
    fat: toNumber(value.fat)
  };
}

