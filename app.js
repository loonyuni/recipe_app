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
const personalImageGallery = personalConfig.imagesBySourceUrl;
const personalImageGalleryByTitle = personalConfig.imagesByTitle;

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

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
  const ingredientRecords = (draft.ingredients || []).map(toIngredientRecord);
  const extractedImage = typeof draft.imageUrl === "string"
    ? draft.imageUrl
    : draft.image?.url || draft.image?.contentUrl || (Array.isArray(draft.image) ? draft.image[0]?.url || draft.image[0] : "");
  const combinedText = `${draft.title || ""} ${draft.description || ""} ${(draft.tags || []).join(" ")}`.toLowerCase();
  const measurementMode = draft.measurementMode || (/bake|cake|bread|pastry|cookie|muffin|dessert/.test(combinedText) ? "metric" : "both");
  return {
    ...draft,
    time: formatTime(draft.time) || "45 min",
    ingredients: ingredientRecords.map(formatIngredient).filter(Boolean),
    ingredientRecords,
    instructions: (draft.instructions || []).map(formatInstruction).filter(Boolean),
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

function saveRecipes() {
  localStorage.setItem("kitchen-archive-recipes", JSON.stringify(state.recipes));
}

function updateAuthButton() {
  const button = $("#auth-button");
  if (!button) return;
  button.textContent = cloud.session ? "Sign out" : "Sign in";
  button.classList.toggle("is-connected", Boolean(cloud.session));
}

function recipeFromRow(row) {
  const nutrition = row.nutrition || {};
  const personalImages = matchingPersonalImages(row.title, row.source_url);
  return {
    id: row.id,
    title: row.title,
    description: row.description || "",
    time: formatTime(row.time_minutes || 0),
    servings: row.servings || 4,
    tags: [],
    imageClass: "new",
    sourceUrl: row.source_url || "",
    imageUrl: row.image_url || personalImages[0] || "",
    imageUrls: row.image_urls?.length ? row.image_urls : (row.image_url ? [row.image_url] : personalImages),
    measurementMode: row.measurement_mode || "both",
    calories: nutrition.calories || 0,
    protein: nutrition.protein || 0,
    carbs: nutrition.carbs || 0,
    fat: nutrition.fat || 0,
    rating: 0,
    cooked: 0,
    added: new Date(row.created_at).getTime(),
    ingredients: Array.isArray(row.ingredients) ? row.ingredients.map(formatIngredient) : [],
    ingredientRecords: Array.isArray(row.ingredients) ? row.ingredients.map(toIngredientRecord) : [],
    instructions: Array.isArray(row.instructions) ? row.instructions.map(formatInstruction) : [],
    variants: [],
    ratings: [],
    source: row.source_label || row.source_url || "Supabase recipe"
  };
}

// Both onAuthStateChange (INITIAL_SESSION) and getSession() trigger a load on
// startup. Coalesce concurrent calls onto a single in-flight promise so the
// tables aren't double-fetched and createHousehold can't fire twice (which
// would create duplicate households for a brand-new user).
let cloudLoadInFlight = null;
function loadCloudRecipes() {
  if (cloudLoadInFlight) return cloudLoadInFlight;
  cloudLoadInFlight = loadCloudRecipesInner().finally(() => { cloudLoadInFlight = null; });
  return cloudLoadInFlight;
}

async function loadCloudRecipesInner() {
  if (!cloud.client || !cloud.session) return;
  const localCodexRecipes = state.recipes.filter((recipe) => recipe.localOnly);
  const { data: membership, error: memberError } = await cloud.client
    .from("household_members")
    .select("id, household_id")
    .eq("user_id", cloud.session.user.id)
    .limit(1)
    .maybeSingle();
  if (memberError) throw memberError;
  if (!membership) {
    const displayName = cloud.session.user.user_metadata?.display_name || cloud.session.user.email?.split("@")[0] || "Me";
    await createHousehold(displayName, "My kitchen");
    return;
  }
  cloud.householdId = membership.household_id;
  cloud.memberId = membership.id;
  const { data: members } = await cloud.client
    .from("household_members")
    .select("id, display_name")
    .eq("household_id", cloud.householdId)
    .order("display_name");
  cloud.members = members || [];
  const { data, error } = await cloud.client
    .from("recipes")
    .select("*")
    .eq("household_id", cloud.householdId)
    .order("updated_at", { ascending: false });
  if (error) throw error;
  const rowsById = new Map((data || []).map((row) => [row.id, row]));
  state.recipes = (data || []).map(recipeFromRow);
  cloud.connected = true;

  for (const localRecipe of localCodexRecipes) {
    const duplicate = state.recipes.find((recipe) => normalizeRecipeTitle(recipe.title) === normalizeRecipeTitle(localRecipe.title));
    if (duplicate) continue;
    const pendingRecipe = { ...localRecipe };
    try {
      await saveRecipeToCloud(pendingRecipe);
      pendingRecipe.localOnly = false;
    } catch (syncError) {
      console.warn("Codex recipe cloud sync skipped:", syncError.message);
    }
    state.recipes.unshift(pendingRecipe);
  }
  // Backfill image/measurement columns only for rows that are actually stale.
  // Previously this issued an UPDATE for every image-bearing recipe on every
  // page load; now we compare against the fetched row and skip no-op writes.
  await Promise.all(state.recipes
    .filter((recipe) => recipe.imageUrls?.length)
    .filter((recipe) => {
      const row = rowsById.get(recipe.id);
      if (!row) return false;
      const sameUrls = JSON.stringify(row.image_urls || []) === JSON.stringify(recipe.imageUrls);
      const sameImage = (row.image_url || null) === (recipe.imageUrl || null);
      const sameMode = (row.measurement_mode || "both") === (recipe.measurementMode || "both");
      return !(sameUrls && sameImage && sameMode);
    })
    .map(async (recipe) => {
      const { error: imageError } = await cloud.client.from("recipes").update({
        image_url: recipe.imageUrl || null,
        image_urls: recipe.imageUrls,
        measurement_mode: recipe.measurementMode || "both"
      }).eq("id", recipe.id).eq("household_id", cloud.householdId);
      if (imageError) console.warn("Image backfill skipped:", imageError.message);
    }));
  if (state.recipes.length) {
    const recipeIds = state.recipes.map((recipe) => recipe.id);
    const { data: ratings } = await cloud.client
      .from("ratings")
      .select("recipe_id, member_id, score, would_make_again, comment, cooked_at, household_members(display_name)")
      .in("recipe_id", recipeIds);
    const ratingsByRecipe = new Map(recipeIds.map((id) => [id, []]));
    (ratings || []).forEach((rating) => {
      ratingsByRecipe.get(rating.recipe_id)?.push({
        member: rating.household_members?.display_name || "Family member",
        score: Number(rating.score) || 0,
        wouldMakeAgain: rating.would_make_again,
        comment: rating.comment || "",
        cookedAt: rating.cooked_at
      });
    });
    const savedRatings = manualRatings();
    state.recipes.forEach((recipe) => {
      const cloudRatings = ratingsByRecipe.get(recipe.id) || [];
      const localRatings = savedRatings[normalizeRecipeTitle(recipe.title)] || [];
      const cloudMembers = new Set(cloudRatings.map((rating) => rating.member));
      recipe.ratings = [...cloudRatings, ...localRatings.filter((rating) => !cloudMembers.has(rating.member))];
    });
    const { data: recipeTags, error: tagsError } = await cloud.client
      .from("recipe_tags")
      .select("recipe_id, tags(name)")
      .in("recipe_id", recipeIds);
    if (tagsError) {
      console.warn("Tag load skipped:", tagsError.message);
    } else {
      const tagsByRecipe = new Map(recipeIds.map((id) => [id, []]));
      (recipeTags || []).forEach((row) => {
        const name = row.tags?.name;
        if (name) tagsByRecipe.get(row.recipe_id)?.push(name);
      });
      state.recipes.forEach((recipe) => { recipe.tags = tagsByRecipe.get(recipe.id) || []; });
    }
  }
  render();
}

// Persist a recipe's tags to the tags/recipe_tags tables: ensure a tag row
// exists per name for the household, then reconcile the recipe_tags links so
// they exactly match recipe.tags. No-op unless connected to the cloud.
async function syncRecipeTags(recipe) {
  if (!cloud.connected || !cloud.client || !cloud.householdId || !recipe.id) return;
  const names = [...new Set((recipe.tags || []).map((tag) => String(tag).trim()).filter(Boolean))];
  if (names.length) {
    const { error: upsertError } = await cloud.client
      .from("tags")
      .upsert(names.map((name) => ({ household_id: cloud.householdId, name })), { onConflict: "household_id,name" });
    if (upsertError) throw upsertError;
  }
  const { data: tagRows, error: tagRowsError } = await cloud.client
    .from("tags")
    .select("id, name")
    .eq("household_id", cloud.householdId)
    .in("name", names.length ? names : [""]);
  if (tagRowsError) throw tagRowsError;
  const wantedIds = new Set((tagRows || []).map((row) => row.id));
  const { data: existingLinks, error: linksError } = await cloud.client
    .from("recipe_tags")
    .select("tag_id")
    .eq("recipe_id", recipe.id);
  if (linksError) throw linksError;
  const existingIds = new Set((existingLinks || []).map((row) => row.tag_id));
  const toAdd = [...wantedIds].filter((id) => !existingIds.has(id));
  const toRemove = [...existingIds].filter((id) => !wantedIds.has(id));
  if (toAdd.length) {
    const { error } = await cloud.client
      .from("recipe_tags")
      .insert(toAdd.map((tagId) => ({ recipe_id: recipe.id, tag_id: tagId })));
    if (error) throw error;
  }
  if (toRemove.length) {
    const { error } = await cloud.client
      .from("recipe_tags")
      .delete()
      .eq("recipe_id", recipe.id)
      .in("tag_id", toRemove);
    if (error) throw error;
  }
}

async function createHousehold(displayName, householdName) {
  const { data, error } = await cloud.client.rpc("create_household", {
    household_name: householdName || "Our kitchen",
    member_name: displayName || "Me"
  });
  if (error) throw error;
  cloud.householdId = data;
  await loadCloudRecipes();
}

async function saveRecipeToCloud(recipe) {
  if (!cloud.connected || !cloud.client || !cloud.householdId) return;
  const { data, error } = await cloud.client.from("recipes").insert({
    household_id: cloud.householdId,
    title: recipe.title,
    description: recipe.description || "",
    servings: recipe.servings,
    time_minutes: timeMinutes(recipe.time),
    ingredients: recipe.ingredientRecords || recipe.ingredients,
    instructions: recipe.instructions,
    image_url: recipe.imageUrl || null,
    image_urls: recipe.imageUrls || [],
    measurement_mode: recipe.measurementMode || "both",
    nutrition: {
      calories: recipe.calories,
      protein: recipe.protein,
      carbs: recipe.carbs,
      fat: recipe.fat
    },
    source_label: recipe.source,
    source_url: recipe.sourceUrl || null,
    extraction_status: recipe.source?.startsWith("Distilled") ? "draft" : "manual",
    created_by: cloud.session?.user?.id || null
  }).select().single();
  if (error) throw error;
  recipe.id = data.id;
  await syncRecipeTags(recipe);
}

async function updateRecipeToCloud(recipe) {
  if (!cloud.connected || !cloud.client || !cloud.householdId) return;
  const { error } = await cloud.client.from("recipes").update({
    title: recipe.title,
    description: recipe.description || "",
    servings: recipe.servings,
    time_minutes: timeMinutes(recipe.time),
    ingredients: recipe.ingredientRecords || recipe.ingredients,
    instructions: recipe.instructions,
    image_url: recipe.imageUrl || null,
    image_urls: recipe.imageUrls || [],
    measurement_mode: recipe.measurementMode || "both",
    source_label: recipe.source || null,
    source_url: recipe.sourceUrl || null,
    nutrition: {
      calories: recipe.calories,
      protein: recipe.protein,
      carbs: recipe.carbs,
      fat: recipe.fat
    },
    updated_at: new Date().toISOString()
  }).eq("id", recipe.id).eq("household_id", cloud.householdId);
  if (error) throw error;
  await syncRecipeTags(recipe);
}

async function deleteRecipeFromCloud(recipe) {
  if (!cloud.connected || !cloud.client || !cloud.householdId) return;
  const { error } = await cloud.client.from("recipes")
    .delete()
    .eq("id", recipe.id)
    .eq("household_id", cloud.householdId);
  if (error) throw error;
}

async function saveRatingToCloud(recipe, rating) {
  if (!cloud.connected || !cloud.client || !cloud.memberId) return;
  // Reviewer names like "Uni"/"Alex" come from localReviewers and aren't
  // necessarily real household_members. When the name doesn't match a member,
  // attribute the rating to the signed-in member so it still persists to the
  // cloud instead of being silently dropped (the old `if (!member) return`).
  const member = cloud.members.find((item) => item.display_name === rating.member);
  const memberId = member?.id || cloud.memberId;
  // The ratings table has no unique (recipe_id, member_id) constraint, so clear
  // any prior rating from this member for this recipe before inserting to keep
  // one row per member instead of accumulating duplicates on every re-rate.
  const { error: deleteError } = await cloud.client.from("ratings")
    .delete()
    .eq("recipe_id", recipe.id)
    .eq("member_id", memberId);
  if (deleteError) throw deleteError;
  const { error } = await cloud.client.from("ratings").insert({
    recipe_id: recipe.id,
    member_id: memberId,
    score: rating.score,
    would_make_again: rating.wouldMakeAgain,
    comment: rating.comment || "",
    cooked_at: new Date().toISOString().slice(0, 10)
  });
  if (error) throw error;
}

function showAuthError(message) {
  const error = $("#auth-error");
  error.textContent = message;
  error.hidden = false;
}

function setAuthMode(mode) {
  cloud.authMode = mode;
  const signup = mode === "signup";
  $("#auth-title").textContent = signup ? "Create your archive" : "Sign in";
  $("#auth-intro").textContent = signup
    ? "Create the household account that will own your shared recipe library."
    : "Sign in to save recipes to your shared collection.";
  $("#signup-fields").hidden = !signup;
  $("#signup-fields").querySelectorAll("input").forEach((input) => { input.required = signup; });
  $("#auth-submit").innerHTML = signup ? "Create account <span>↗</span>" : "Sign in <span>↗</span>";
  $("#auth-mode-toggle").textContent = signup ? "I already have an account" : "Create account";
}

function openAuthModal() {
  $("#auth-modal").hidden = false;
  $("#auth-error").hidden = true;
  setAuthMode("signin");
  setTimeout(() => $("#auth-form [name=email]").focus(), 0);
}

function closeAuthModal() {
  $("#auth-modal").hidden = true;
  $("#auth-form").reset();
}

async function persistNewRecipe(recipe) {
  const duplicate = findDuplicateRecipe(recipe);
  if (duplicate) {
    const ratings = duplicate.ratings || [];
    const variants = duplicate.variants || [];
    Object.assign(duplicate, recipe, {
      id: duplicate.id,
      ratings,
      variants,
      added: duplicate.added
    });
    saveRecipes();
    try {
      await updateRecipeToCloud(duplicate);
      showToast("Existing recipe updated — no duplicate created.");
    } catch (error) {
      console.error(error);
      showToast("Existing recipe updated locally; cloud update failed.");
    }
    render();
    openDrawer(duplicate.id);
    return;
  }
  // Mark as local-only until a cloud insert confirms; loadCloudRecipes re-uploads
  // anything still flagged so recipes added offline (or when the cloud write
  // fails) aren't dropped when state.recipes is rebuilt from the cloud on reload.
  recipe.localOnly = true;
  state.recipes.unshift(recipe);
  saveRecipes();
  if (cloud.connected) {
    try {
      await saveRecipeToCloud(recipe);
      recipe.localOnly = false;
      saveRecipes();
    } catch (error) {
      console.error(error);
      showToast("Saved locally, but cloud save failed.");
    }
  }
  render();
  openDrawer(recipe.id);
}

async function initSupabase() {
  updateAuthButton();
  if (!window.supabase || !window.KITCHEN_ARCHIVE_SUPABASE?.url || !window.KITCHEN_ARCHIVE_SUPABASE?.anonKey) return;
  cloud.client = window.supabase.createClient(
    window.KITCHEN_ARCHIVE_SUPABASE.url,
    window.KITCHEN_ARCHIVE_SUPABASE.anonKey,
    {
      auth: {
        // Keep the user signed in across visits: store the session in
        // localStorage and silently refresh the access token in the
        // background so a single login per device sticks indefinitely
        // (until the refresh token itself expires — configured in Supabase).
        persistSession: true,
        autoRefreshToken: true,
        storage: window.localStorage,
        storageKey: "kitchen-archive-auth"
      }
    }
  );
  cloud.client.auth.onAuthStateChange(async (_event, session) => {
    cloud.session = session;
    updateAuthButton();
    if (session) {
      try {
        await loadCloudRecipes();
      } catch (error) {
        console.error(error);
        showToast(`Recipes couldn't be loaded: ${error.message || "unknown error"}`);
      }
    } else {
      // On sign-out, drop the household's private data so it isn't left on
      // screen or in localStorage for the next person on this device. Reset to
      // the seeded starter recipes a signed-out visitor would normally see.
      cloud.connected = false;
      cloud.householdId = null;
      cloud.memberId = null;
      cloud.members = [];
      state.recipes = starterRecipes.map((recipe) => ({ ...recipe }));
      saveRecipes();
      render();
    }
  });
  const { data, error } = await cloud.client.auth.getSession();
  if (error) {
    console.error(error);
    return;
  }
  cloud.session = data.session;
  updateAuthButton();
  if (cloud.session) {
    try { await loadCloudRecipes(); } catch (loadError) { console.error(loadError); }
  }
}

function allTags() {
  return [...new Set(state.recipes.flatMap((recipe) => recipe.tags))].sort();
}

function hasNutrition(recipe) {
  return [recipe.calories, recipe.protein, recipe.carbs, recipe.fat]
    .some((value) => (Number(value) || 0) > 0);
}

function averageRating(recipe) {
  return recipe.ratings?.length
    ? recipe.ratings.reduce((sum, rating) => sum + rating.score, 0) / recipe.ratings.length
    : recipe.rating || 0;
}

function ratingStars(score) {
  const value = Math.max(0, Math.min(5, Number(score) || 0));
  const full = Math.floor(value);
  const half = value - full >= 0.5 ? 1 : 0;
  return `${"★".repeat(full)}${half ? "½" : ""}${"☆".repeat(5 - full - half)}`;
}

function renderLabels() {
  // Show every label, most-used first (ties broken alphabetically), so a large
  // tag set (e.g. after a big import) stays discoverable. The list scrolls via
  // CSS rather than being truncated to the first 12 alphabetically.
  const count = (tag) => state.recipes.filter((recipe) => recipe.tags.includes(tag)).length;
  const tags = allTags().sort((a, b) => count(b) - count(a) || a.localeCompare(b));
  $("#label-list").innerHTML = tags.map((tag) => `
    <div class="label-item${state.selectedTags.includes(tag) ? " is-active" : ""}" data-tag="${escAttr(tag)}">
      <span class="label-dot"></span><span>${esc(tag)}</span>
      <span class="label-count">${count(tag)}</span>
    </div>`).join("");
  $$(".label-item").forEach((item) => item.addEventListener("click", () => toggleTag(item.dataset.tag)));
}

function renderLabelManager() {
  const list = $("#label-manager-list");
  if (!list) return;
  const tags = allTags();
  list.innerHTML = tags.length
    ? tags.map((tag) => `
      <div class="label-manager-row" data-tag="${escAttr(tag)}">
        <input class="label-manager-name" value="${escAttr(tag)}" aria-label="Rename ${escAttr(tag)}" />
        <span class="label-manager-count">${labelUsageCount(tag)}</span>
        <button type="button" class="ghost-button label-manager-rename" data-rename="${escAttr(tag)}">Rename</button>
        <button type="button" class="danger-button label-manager-delete" data-delete="${escAttr(tag)}">Delete</button>
      </div>`).join("")
    : `<p class="label-manager-empty">No labels yet. Add labels to recipes to manage them here.</p>`;

  const suggestions = auditLabels();
  const audit = $("#label-manager-audit");
  audit.innerHTML = suggestions.length
    ? `<p class="eyebrow">Possibly overlapping</p>${suggestions.map((pair) => `
        <div class="label-audit-row">
          <span><strong>${esc(pair.a)}</strong> &amp; <strong>${esc(pair.b)}</strong> · <span class="label-audit-reason">${esc(pair.reason)}</span></span>
          <span class="label-audit-actions">
            <button type="button" class="ghost-button" data-merge-into="${escAttr(pair.a)}" data-merge-from="${escAttr(pair.b)}">Merge into “${esc(pair.a)}”</button>
            <button type="button" class="ghost-button" data-merge-into="${escAttr(pair.b)}" data-merge-from="${escAttr(pair.a)}">Merge into “${esc(pair.b)}”</button>
          </span>
        </div>`).join("")}`
    : `<p class="label-manager-empty">No overlapping labels detected.</p>`;

  list.querySelectorAll(".label-manager-rename").forEach((button) => button.addEventListener("click", async () => {
    const row = button.closest(".label-manager-row");
    const input = row.querySelector(".label-manager-name");
    await renameLabel(button.dataset.rename, input.value);
    renderLabelManager();
  }));
  list.querySelectorAll(".label-manager-name").forEach((input) => input.addEventListener("keydown", async (event) => {
    if (event.key !== "Enter") return;
    event.preventDefault();
    await renameLabel(input.closest(".label-manager-row").dataset.tag, input.value);
    renderLabelManager();
  }));
  list.querySelectorAll(".label-manager-delete").forEach((button) => button.addEventListener("click", async () => {
    await deleteLabel(button.dataset.delete);
    renderLabelManager();
  }));
  audit.querySelectorAll("[data-merge-from]").forEach((button) => button.addEventListener("click", async () => {
    // Merging is a rename of the "from" label onto the "into" label.
    await renameLabel(button.dataset.mergeFrom, button.dataset.mergeInto);
    renderLabelManager();
  }));
}

function openLabelManager() {
  renderLabelManager();
  $("#label-manager-modal").hidden = false;
}

function closeLabelManager() {
  $("#label-manager-modal").hidden = true;
}

const SEARCH_SYNONYMS = {
  cozy: ["comfort food", "chili", "pot pie", "warm"],
  dinner: ["weeknight", "weekday dinner", "hosting"],
  easy: ["weeknight", "quick", "family favorite"],
  family: ["family favorite", "mom", "crowd"],
  hosting: ["hosting", "potluck", "make ahead"],
  healthy: ["salad", "lentil", "fish"],
  vegetarian: ["vegetarian", "lentil"],
  fish: ["fish", "salmon", "pescatarian"],
  sweet: ["dessert", "cake"],
  snack: ["snack", "potluck"]
};

// Cuisine / food-ethnicity labels, keyed to signal words that appear in a
// recipe's title, ingredients, or description. Used to auto-suggest a cuisine
// label on import so the archive can be browsed by tradition, not just by dish.
const CUISINE_KEYWORDS = {
  chinese: ["soy sauce", "hoisin", "five spice", "bok choy", "szechuan", "sichuan", "wok", "shaoxing", "char siu", "lo mein", "dumpling", "wonton"],
  japanese: ["miso", "dashi", "mirin", "sake", "nori", "sushi", "ramen", "teriyaki", "udon", "panko", "matcha"],
  korean: ["gochujang", "gochugaru", "kimchi", "bulgogi", "bibimbap", "doenjang", "korean"],
  thai: ["fish sauce", "lemongrass", "coconut milk", "thai", "curry paste", "galangal", "pad thai", "kaffir"],
  vietnamese: ["nuoc cham", "pho", "banh mi", "vietnamese", "rice paper"],
  indian: ["garam masala", "turmeric", "cumin", "curry", "paneer", "tikka", "masala", "naan", "dal", "tandoori", "ghee"],
  mediterranean: ["olive oil", "feta", "chickpea", "tahini", "hummus", "za'atar", "pita", "tzatziki", "halloumi"],
  italian: ["parmesan", "pasta", "basil", "mozzarella", "risotto", "pesto", "prosciutto", "marinara", "gnocchi", "ricotta"],
  mexican: ["tortilla", "cumin", "cilantro", "jalapeno", "salsa", "taco", "enchilada", "chipotle", "queso", "masa"],
  french: ["butter", "shallot", "dijon", "creme fraiche", "baguette", "gruyere", "béchamel", "bechamel", "confit"],
  soul: ["collard", "black-eyed pea", "grits", "cornbread", "okra", "smothered", "fried chicken", "gumbo", "hush puppy"],
  asian: ["soy sauce", "sesame oil", "ginger", "rice vinegar", "sriracha"]
};

function detectCuisines(text) {
  return Object.entries(CUISINE_KEYWORDS)
    .filter(([, keywords]) => keywords.some((keyword) => text.includes(keyword)))
    .map(([cuisine]) => cuisine);
}

function semanticTerms(query) {
  return query.toLowerCase().split(/\s+/).flatMap((word) => [word, ...(SEARCH_SYNONYMS[word] || [])]);
}

// Groups of related terms drawn from the search synonym map, used by the label
// audit to spot labels that mean roughly the same thing. Each key is included
// alongside its synonyms so e.g. "easy" and "weeknight" land in one group.
function semanticGroups() {
  return Object.entries(SEARCH_SYNONYMS).map(([key, values]) => [key, ...values]);
}

const PASTRY_SCHOOL_TAG = "pastry school";
function isPastrySchool(recipe) {
  return (recipe.tags || []).includes(PASTRY_SCHOOL_TAG);
}

function filteredRecipes() {
  let recipes = [...state.recipes];
  const searching = state.search.trim().length > 0;
  const tagFiltering = state.selectedTags.length > 0;
  if (state.view === "pastry") {
    recipes = recipes.filter(isPastrySchool);
  } else if (state.view === "favorites") {
    recipes = recipes.filter((recipe) => averageRating(recipe) >= 4.5);
  } else if (state.view === "recent") {
    recipes = recipes.filter((recipe) => recipe.cooked > 0).sort((a, b) => b.cooked - a.cooked);
  } else if (!searching && !tagFiltering) {
    // Default library view: keep the pastry-school archive out so it doesn't
    // bury personal recipes. Searching or filtering by a tag still surfaces
    // everything, so the archive stays discoverable.
    recipes = recipes.filter((recipe) => !isPastrySchool(recipe));
  }
  if (state.selectedTags.length) recipes = recipes.filter((recipe) => state.selectedTags.every((tag) => recipe.tags.includes(tag)));
  if (state.search.trim()) {
    const terms = semanticTerms(state.search);
    recipes = recipes.map((recipe) => {
      const haystack = `${recipe.title} ${recipe.description} ${recipe.tags.join(" ")} ${recipe.ingredients.join(" ")} ${recipe.instructions.join(" ")}`.toLowerCase();
      const score = terms.reduce((sum, term) => sum + (haystack.includes(term) ? (term.length > 5 ? 3 : 1) : 0), 0);
      return { recipe, score };
    }).filter((result) => result.score > 0).sort((a, b) => b.score - a.score).map((result) => result.recipe);
  }
  if (state.sort === "rating") recipes.sort((a, b) => averageRating(b) - averageRating(a));
  if (state.sort === "title") recipes.sort((a, b) => a.title.localeCompare(b.title));
  if (state.sort === "time") recipes.sort((a, b) => timeMinutes(a.time) - timeMinutes(b.time));
  if (state.sort === "recent") recipes.sort((a, b) => b.added - a.added);
  return recipes;
}

function renderRecipes() {
  const recipes = filteredRecipes();
  $("#recipe-count").textContent = recipes.length;
  $("#result-count").textContent = state.search || state.selectedTags.length ? `${recipes.length} matches` : "";
  $("#recipe-grid").innerHTML = recipes.map((recipe) => `
    <article class="recipe-card" data-id="${escAttr(recipe.id)}" tabindex="0">
      <div class="recipe-card__image recipe-card__image--${escAttr(recipe.imageClass)}" aria-label="${escAttr(recipe.title)}">
        ${recipeImageUrls(recipe).length
          ? `<img src="${escAttr(recipeImageUrls(recipe).at(-1))}" alt="${escAttr(recipe.title)}" />`
          : `<span>${esc(recipe.title.split(" ").slice(0, 2).join(" "))}</span>`}
      </div>
      <div class="recipe-card__body">
        <h3>${esc(recipe.title)}</h3>
        <p>${esc(recipe.description)}</p>
        <div class="card-meta"><span>◷ ${esc(formatTimeLabel(recipe.time))}</span><span>♧ ${esc(recipe.servings)} servings</span></div>
        <div class="card-footer">
          <div class="card-tags">${recipe.tags.slice(0, 2).map((tag) => `<span class="card-tag">${esc(tag)}</span>`).join("")}</div>
          <span class="card-rating">★ ${averageRating(recipe).toFixed(1)}</span>
        </div>
      </div>
    </article>`).join("");
  $("#empty-state").hidden = recipes.length !== 0;
  $$(".recipe-card").forEach((card) => {
    card.addEventListener("click", () => openDrawer(card.dataset.id));
    card.addEventListener("keydown", (event) => { if (event.key === "Enter") openDrawer(card.dataset.id); });
  });
}

function renderFilters() {
  $("#active-filters").innerHTML = state.selectedTags.map((tag) => `
    <span class="filter-chip">${esc(tag)}<button aria-label="Remove ${escAttr(tag)}" data-remove-tag="${escAttr(tag)}">×</button></span>`).join("");
  $$("[data-remove-tag]").forEach((button) => button.addEventListener("click", () => toggleTag(button.dataset.removeTag)));
  const clearButton = $("#clear-filters-button");
  if (clearButton) clearButton.hidden = state.selectedTags.length === 0;
}

function render() {
  renderLabels();
  renderFilters();
  renderRecipes();
  const titles = { library: "All recipes", favorites: "Family favorites", recent: "Recently cooked", pastry: "Pastry school" };
  $("#view-title").firstChild.textContent = titles[state.view] + " ";
  $$(".nav-item").forEach((item) => item.classList.toggle("is-active", item.dataset.view === state.view));
}

function toggleTag(tag) {
  state.selectedTags = state.selectedTags.includes(tag)
    ? state.selectedTags.filter((selected) => selected !== tag)
    : [...state.selectedTags, tag];
  render();
}

function clearFilters() {
  if (!state.selectedTags.length) return;
  state.selectedTags = [];
  render();
}

function labelUsageCount(tag) {
  return state.recipes.filter((recipe) => recipe.tags.includes(tag)).length;
}

// Recipes whose tag list changed while renaming/deleting a label, so the caller
// can persist just those to the cloud instead of every recipe.
function recipesWithTag(tag) {
  return state.recipes.filter((recipe) => recipe.tags.includes(tag));
}

async function persistTagChanges(changedRecipes) {
  saveRecipes();
  if (state.selectedTags.length) {
    state.selectedTags = state.selectedTags.filter((tag) => allTags().includes(tag));
  }
  render();
  if (!cloud.connected) return;
  let failed = 0;
  for (const recipe of changedRecipes) {
    try {
      await updateRecipeToCloud(recipe);
    } catch (error) {
      failed += 1;
      console.warn("Label sync skipped:", error.message);
    }
  }
  // Surface a failed cloud sync instead of swallowing it: tags are rebuilt from
  // the cloud on reload, so a silent failure would quietly revert the change.
  if (failed) showToast(`Label saved locally; cloud sync failed for ${failed} recipe${failed === 1 ? "" : "s"}.`);
}

// Rename a label everywhere. If the new name already exists on some recipes the
// two labels merge: every recipe with either name ends up with just the new
// name, deduped and order-preserved.
async function renameLabel(oldTag, rawNewTag) {
  const newTag = String(rawNewTag || "").trim();
  if (!newTag || newTag === oldTag) return;
  const changed = recipesWithTag(oldTag);
  changed.forEach((recipe) => {
    const next = recipe.tags.map((tag) => (tag === oldTag ? newTag : tag));
    recipe.tags = [...new Set(next)];
  });
  await persistTagChanges(changed);
  showToast(`Renamed “${oldTag}” to “${newTag}”.`);
}

async function deleteLabel(tag) {
  const changed = recipesWithTag(tag);
  if (!changed.length) return;
  if (!window.confirm(`Remove the “${tag}” label from ${changed.length} recipe${changed.length === 1 ? "" : "s"}?`)) return;
  changed.forEach((recipe) => { recipe.tags = recipe.tags.filter((item) => item !== tag); });
  state.selectedTags = state.selectedTags.filter((item) => item !== tag);
  await persistTagChanges(changed);
  showToast(`Removed the “${tag}” label.`);
}

// Suggest labels that could be collapsed, combining two signals:
//  1. co-occurrence — two labels that tag a high fraction of the same recipes
//  2. synonyms — labels the search synonym map already treats as related
function auditLabels() {
  const tags = allTags();
  const suggestions = [];
  const seen = new Set();
  const addPair = (a, b, reason) => {
    const key = [a, b].sort().join("::");
    if (a === b || seen.has(key)) return;
    seen.add(key);
    suggestions.push({ a, b, reason });
  };

  // Synonym-based: reuse the same map the search uses.
  const synonymGroups = semanticGroups();
  synonymGroups.forEach((group) => {
    const present = group.filter((tag) => tags.includes(tag));
    for (let i = 0; i < present.length; i += 1) {
      for (let j = i + 1; j < present.length; j += 1) {
        addPair(present[i], present[j], "similar meaning");
      }
    }
  });

  // Co-occurrence-based: labels sharing most of their recipes.
  for (let i = 0; i < tags.length; i += 1) {
    for (let j = i + 1; j < tags.length; j += 1) {
      const a = tags[i];
      const b = tags[j];
      const aSet = new Set(recipesWithTag(a));
      const bRecipes = recipesWithTag(b);
      const shared = bRecipes.filter((recipe) => aSet.has(recipe)).length;
      const union = aSet.size + bRecipes.length - shared;
      if (union > 0 && shared > 0) {
        const overlap = shared / union;
        if (overlap >= 0.6) addPair(a, b, `overlap ${Math.round(overlap * 100)}% of recipes`);
      }
    }
  }
  return suggestions;
}

// The active drawer's scale factor. View-only: never persisted or synced. Reset
// to 1x whenever a drawer is (re)opened so scaling doesn't leak between recipes.
let drawerScale = 1;

// Re-render every scale-dependent piece of the open drawer: the editable
// ingredient quantities, the servings/factor summary, and the per-batch
// nutrition total. Called on open and after every scale change.
function applyDrawerScaling() {
  const recipe = state.activeRecipe;
  if (!recipe) return;
  const factor = drawerScale;

  const list = $("#ingredient-list");
  if (list) {
    list.innerHTML = normalizeIngredientList(recipe.ingredients || []).map((ingredient, index) => {
      if (isIngredientHeader(ingredient)) return `<li class="ingredient-header">${esc(ingredient)}</li>`;
      const scaled = scaleIngredient(ingredient, factor);
      if (!scaled.scaled) return `<li class="ingredient-static">${esc(ingredient)}</li>`;
      const rest = scaled.rest.replace(/^\s+/, "");
      return `<li class="ingredient-scalable">
        <input class="ingredient-qty" type="text" inputmode="decimal" value="${escAttr(formatQuantity(scaled.scaledValue))}" data-index="${index}" data-original="${escAttr(scaled.originalValue)}" aria-label="Quantity for ${escAttr(rest || "ingredient")}" />
        <span class="ingredient-rest">${esc(rest)}</span>
      </li>`;
    }).join("");
    $$(".ingredient-qty", list).forEach((input) => input.addEventListener("change", onIngredientQtyChange));
  }

  const summary = $("#scale-summary");
  if (summary) {
    summary.textContent = `${formatQuantity(factor)}× · makes ${formatScaledServings(recipe.servings, factor)} servings`;
  }
  $$("#scale-controls .scale-button").forEach((button) => {
    button.classList.toggle("is-active", Number(button.dataset.scale) === factor);
  });

  const batchTotal = $("#batch-total");
  if (batchTotal && hasNutrition(recipe)) {
    const servings = (Number(recipe.servings) || 0) * factor;
    const total = (perServing) => Math.round((Number(perServing) || 0) * servings);
    batchTotal.innerHTML = `Total this batch (${formatScaledServings(recipe.servings, factor)} servings): <strong>${total(recipe.calories)} kcal</strong> · ${total(recipe.protein)} g protein · ${total(recipe.carbs)} g carbs · ${total(recipe.fat)} g fat`;
  }
}

// User typed a new quantity into one ingredient. Derive the scale factor from
// that ingredient's original quantity, then rescale everything else to match.
function onIngredientQtyChange(event) {
  const input = event.target;
  const original = Number(input.dataset.original);
  const parsed = parseLeadingQuantity(input.value);
  const newValue = parsed ? parsed.value : Number(input.value);
  if (!Number.isFinite(newValue) || newValue <= 0 || !Number.isFinite(original) || original <= 0) {
    applyDrawerScaling(); // reject bad input and restore the last valid display
    return;
  }
  drawerScale = newValue / original;
  applyDrawerScaling();
}

function openDrawer(id) {
  const recipe = state.recipes.find((item) => item.id === id);
  if (!recipe) return;
  state.activeRecipe = recipe;
  drawerScale = 1;
  const ratings = recipe.ratings || [];
  const reviewers = [...new Set([
    ...localReviewers,
    ...cloud.members.map((member) => member.display_name),
    ...ratings.map((rating) => rating.member)
  ])].filter((member) => !hiddenReviewers.has(String(member).trim().toLowerCase()));
  $("#drawer-content").innerHTML = `
    <p class="eyebrow">Recipe archive · ${esc(recipe.source || "Personal recipe")}</p>
    <h2 class="drawer-title" id="drawer-title">${esc(recipe.title)}</h2>
    <p class="drawer-description">${esc(recipe.description)}</p>
    <div class="drawer-actions">
      <button class="ghost-button" id="edit-recipe-button">Edit recipe</button>
      <button class="danger-button" id="delete-recipe-button">Delete</button>
    </div>
    ${recipeImageUrls(recipe).length ? `
      <div class="drawer-image-gallery">
        ${recipeImageUrls(recipe).map((imageUrl, index) => `<img src="${escAttr(imageUrl)}" alt="${escAttr(recipe.title)} photo ${index + 1}" />`).join("")}
      </div>
    ` : ""}
    <div class="drawer-tags">${recipe.tags.map((tag) => `<span class="drawer-tag">${esc(tag)}</span>`).join("")}</div>
    <div class="card-meta"><span>◷ ${esc(formatTimeLabel(recipe.time))}</span><span>♧ ${esc(recipe.servings)} servings</span><span>★ ${averageRating(recipe).toFixed(1)} household</span></div>
    <hr class="drawer-rule" />
    <h3 class="drawer-section-title">Nutrition per serving</h3>
    ${hasNutrition(recipe) ? `
    <div class="nutrition-strip">
      <div class="nutrition-cell"><span class="nutrition-value">${esc(recipe.calories)}</span><span class="nutrition-label">kcal</span></div>
      <div class="nutrition-cell"><span class="nutrition-value">${esc(recipe.protein)} g</span><span class="nutrition-label">protein</span></div>
      <div class="nutrition-cell"><span class="nutrition-value">${esc(recipe.carbs)} g</span><span class="nutrition-label">carbs</span></div>
      <div class="nutrition-cell"><span class="nutrition-value">${esc(recipe.fat)} g</span><span class="nutrition-label">fat</span></div>
    </div>
    <p class="batch-total" id="batch-total"></p>
    <p class="source-line">Nutrition is an estimate · <strong>medium confidence</strong></p>
    ` : `
    <p class="nutrition-empty">Nutrition hasn't been calculated for this recipe yet.</p>
    <button type="button" class="ghost-button" id="estimate-nutrition-button">Estimate nutrition</button>
    `}
    <hr class="drawer-rule" />
    <h3 class="drawer-section-title">Ingredients</h3>
    <div class="scale-panel">
      <div class="scale-controls" id="scale-controls">
        <span class="scale-eyebrow">Scale recipe</span>
        <div class="scale-buttons">
          <button type="button" class="scale-button" data-scale="1">1×</button>
          <button type="button" class="scale-button" data-scale="2">2×</button>
          <button type="button" class="scale-button" data-scale="3">3×</button>
        </div>
        <button type="button" class="ghost-button scale-reset" id="scale-reset">Reset to 1×</button>
      </div>
      <p class="scale-summary" id="scale-summary"></p>
      <p class="scale-hint">Tip: type any ingredient's quantity (e.g. what you actually have) and the rest scale to match.</p>
    </div>
    <ul class="ingredient-list scaled-ingredient-list" id="ingredient-list"></ul>
    <h3 class="drawer-section-title">Method</h3>
    <ol class="instruction-list">${recipe.instructions.map((step) => `<li>${esc(step)}</li>`).join("")}</ol>
    <hr class="drawer-rule" />
    <h3 class="drawer-section-title">Family ratings · ★ ${averageRating(recipe).toFixed(1)} overall</h3>
    <div class="family-rating">${ratings.map((rating) => `
      <div class="member-rating"><span class="member-name">${esc(rating.member)}</span><span class="stars">${ratingStars(rating.score)}</span><span class="member-score">${(Number(rating.score) || 0).toFixed(1)}</span></div>`).join("")}</div>
    <form id="rating-form" class="rating-form">
      <select name="member" aria-label="Reviewer">${reviewers.map((member) => `<option>${esc(member)}</option>`).join("")}</select>
      <div class="star-rating" id="rating-stars" role="radiogroup" aria-label="Rating">
        ${[1, 2, 3, 4, 5].map((star) => `
          <span class="star-pair" data-star="${star}">
            <span class="star-glyph" aria-hidden="true">★</span>
            <button type="button" class="star-half star-half-left" data-score="${star - 0.5}" aria-label="${star - 0.5} stars"></button>
            <button type="button" class="star-half star-half-right" data-score="${star}" aria-label="${star} stars"></button>
          </span>`).join("")}
      </div>
      <input type="hidden" name="score" value="5" />
      <input name="comment" placeholder="Optional note" aria-label="Rating note" />
      <button class="ghost-button" type="submit">Save rating</button>
    </form>
    <hr class="drawer-rule" />
    <h3 class="drawer-section-title">Your versions</h3>
    ${recipe.variants.map((variant) => `<div class="variant-card"><strong>${esc(variant.name)}</strong><p>${esc(variant.note)}</p></div>`).join("")}
    <button class="ghost-button" style="margin-top:14px" id="add-variant-button">＋ Add a variant</button>`;
  $("#recipe-drawer").hidden = false;
  $$("#scale-controls .scale-button").forEach((button) => {
    button.addEventListener("click", () => { drawerScale = Number(button.dataset.scale); applyDrawerScaling(); });
  });
  $("#scale-reset").addEventListener("click", () => { drawerScale = 1; applyDrawerScaling(); });
  applyDrawerScaling();
  $("#edit-recipe-button").addEventListener("click", () => openEditModal(recipe));
  $("#delete-recipe-button").addEventListener("click", () => deleteRecipe(recipe));
  $("#estimate-nutrition-button")?.addEventListener("click", () => estimateNutrition(recipe));
  const ratingStarsControl = $("#rating-stars");
  const scoreInput = $("#rating-form [name=score]");
  let selectedScore = 5;
  const paintRating = (score) => {
    $$(".star-pair", ratingStarsControl).forEach((pair) => {
      const star = Number(pair.dataset.star);
      pair.classList.toggle("is-full", score >= star);
      pair.classList.toggle("is-half", score >= star - 0.5 && score < star);
    });
  };
  paintRating(selectedScore);
  $$(".star-half", ratingStarsControl).forEach((button) => {
    button.addEventListener("mouseenter", () => paintRating(Number(button.dataset.score)));
    button.addEventListener("focus", () => paintRating(Number(button.dataset.score)));
    button.addEventListener("click", () => {
      selectedScore = Number(button.dataset.score);
      scoreInput.value = selectedScore;
      paintRating(selectedScore);
    });
  });
  ratingStarsControl.addEventListener("mouseleave", () => paintRating(selectedScore));
  ratingStarsControl.addEventListener("focusout", (event) => {
    if (!ratingStarsControl.contains(event.relatedTarget)) paintRating(selectedScore);
  });
  $("#rating-form").addEventListener("submit", async (event) => {
    event.preventDefault();
    const data = new FormData(event.target);
    const rating = {
      member: data.get("member"),
      score: Number(data.get("score")),
      comment: data.get("comment") || "",
      wouldMakeAgain: true
    };
    const existing = recipe.ratings.find((item) => item.member === rating.member);
    if (existing) Object.assign(existing, rating);
    else recipe.ratings.push(rating);
    // Save locally first so the rating survives even if the cloud write fails.
    saveManualRating(recipe, rating);
    saveRecipes();
    try {
      await saveRatingToCloud(recipe, rating);
      // Cloud is now the source of truth for this rating; drop the local copy
      // so the next reload doesn't render it twice (cloud + local alias).
      if (cloud.connected) removeManualRating(recipe, rating.member);
      showToast("Rating saved.");
    } catch (error) {
      console.error(error);
      showToast(`Rating saved locally: ${error.message || "cloud save failed"}`);
    }
    render();
    openDrawer(recipe.id);
  });
  $("#add-variant-button").addEventListener("click", () => showToast("Variant editing is next on the build list."));
}

function closeDrawer() { $("#recipe-drawer").hidden = true; state.activeRecipe = null; }

function openModal() {
  state.editingRecipeId = null;
  $("#modal-eyebrow").textContent = "Add to the archive";
  $("#modal-title").textContent = "New recipe";
  $("#recipe-modal").hidden = false;
  setTimeout(() => document.querySelector('[name="title"]').focus(), 0);
}

function openEditModal(recipe) {
  state.editingRecipeId = recipe.id;
  const form = $("#recipe-form");
  $("#modal-eyebrow").textContent = "Update the archive";
  $("#modal-title").textContent = "Edit recipe";
  form.title.value = recipe.title || "";
  form.time.value = recipe.time || "";
  form.servings.value = recipe.servings || "";
  form.tags.value = (recipe.tags || []).join(", ");
  form.description.value = recipe.description || "";
  form.ingredients.value = (recipe.ingredients || []).join("\n");
  form.instructions.value = (recipe.instructions || []).join("\n");
  $("#recipe-modal").hidden = false;
  closeDrawer();
  setTimeout(() => form.title.focus(), 0);
}

function closeModal() {
  $("#recipe-modal").hidden = true;
  $("#recipe-form").reset();
  state.editingRecipeId = null;
  $("#modal-eyebrow").textContent = "Add to the archive";
  $("#modal-title").textContent = "New recipe";
}

async function deleteRecipe(recipe) {
  if (!window.confirm(`Delete “${recipe.title}”? This cannot be undone.`)) return;
  try {
    await deleteRecipeFromCloud(recipe);
    state.recipes = state.recipes.filter((item) => item.id !== recipe.id);
    saveRecipes();
    closeDrawer();
    render();
    showToast("Recipe deleted.");
  } catch (error) {
    console.error(error);
    showToast(`Delete failed: ${error.message || "try again"}`);
  }
}

function openImportModal() {
  $("#import-modal").hidden = false;
  $("#import-entry-view").hidden = false;
  $("#import-review-view").hidden = true;
  $$(".import-tab").forEach((tab) => tab.classList.toggle("is-active", tab.dataset.importTab === "link"));
  $$(".import-panel").forEach((panel) => {
    panel.hidden = panel.dataset.importPanel !== "link";
    panel.classList.toggle("is-active", !panel.hidden);
  });
  setTimeout(() => $("#import-url").focus(), 0);
}

function closeImportModal() {
  $("#import-modal").hidden = true;
  $("#import-text").value = "";
  $("#import-url").value = "";
  $("#import-file").value = "";
  $("#file-name").textContent = "No file selected";
}

function extractDraft(sourceText, sourceUrl = "") {
  const fallback = {
    title: sourceUrl ? "Imported recipe draft" : "Cleaned recipe draft",
    description: "A cleaned recipe draft ready for your review.",
    servings: 4,
    time: "45 min",
    ingredients: ["400 g pasta", "800 g canned tomatoes", "2 cloves garlic", "30 ml olive oil"],
    instructions: ["Cook the ingredients according to the source recipe.", "Taste, adjust seasoning, and serve."]
  };
  const text = sourceText.replace(/\r/g, "").trim();
  if (!text) return fallback;
  const lines = text.split("\n").map((line) => line.trim()).filter(Boolean);
  const ingredientStart = lines.findIndex((line) => /^(ingredients?|what you need)\b/i.test(line));
  const instructionStart = lines.findIndex((line) => /^(preparation|instructions?|directions?|method|steps?)\b/i.test(line));
  const noise = /looking for|ask ai|need to make|subscribe|newsletter|advertisement|jump to recipe/i;
  const titleCandidates = lines
    .slice(0, ingredientStart >= 0 ? ingredientStart : 5)
    .filter((line) => line && line.length < 100
      && !/^(recipe information|total time|yield|serves?)\b/i.test(line)
      && !/^\d+\s*(minutes?|mins?|hours?|hrs?|servings?)?$/i.test(line));
  const title = titleCandidates[0] || (sourceUrl ? fallback.title : "Imported recipe");
  const ingredientSection = ingredientStart >= 0
    ? lines.slice(ingredientStart + 1, instructionStart > ingredientStart ? instructionStart : lines.length)
    : [];
  const ingredientLines = [];
  for (let index = 0; index < ingredientSection.length; index += 1) {
    const line = ingredientSection[index];
    if (noise.test(line) || /^(preparation|instructions?|directions?|method|steps?)\b/i.test(line)) continue;
    const next = ingredientSection[index + 1];
    const isQuantity = /^[\d¼½¾⅓⅔⅛⅜⅝⅞]+(?:\s*[-–]\s*[\d¼½¾⅓⅔⅛⅜⅝⅞]+)?$/.test(line);
    if (isQuantity && next && !noise.test(next)) {
      ingredientLines.push(`${line} ${next}`);
      index += 1;
    } else {
      ingredientLines.push(line.replace(/^[-•*]\s*/, ""));
    }
  }
  const instructionLines = instructionStart >= 0
    ? lines.slice(instructionStart + 1)
      .filter((line) => !noise.test(line) && !/^step\s+\d+$/i.test(line))
      .map((line) => line.replace(/^\d+[.)]\s*/, ""))
      .slice(0, 12)
    : fallback.instructions;
  const servingMatch = text.match(/(?:serves?|yield)\s*:?\s*(\d+)/i);
  const timeMatch = text.match(/(?:total|cook(?:ing)?|prep(?:aration)?)\s*time\s*:?\s*(\d+\s*(?:minutes?|mins?|hours?|hrs?))/i);
  return {
    title,
    description: "The recipe text has been distilled from its surrounding story and page clutter.",
    servings: servingMatch ? Number(servingMatch[1]) : fallback.servings,
    time: timeMatch ? timeMatch[1] : fallback.time,
    ingredients: ingredientLines.length ? ingredientLines : fallback.ingredients,
    instructions: instructionLines.length ? instructionLines.map((line) => line.replace(/^\d+[.)]\s*/, "")) : fallback.instructions
  };
}

function renderSuggestedTags(draft) {
  const combined = `${draft.title} ${draft.description} ${draft.ingredients.join(" ")}`.toLowerCase();
  const suggestions = [
    combined.includes("tomato") || combined.includes("pasta") ? "weeknight" : null,
    combined.includes("vegetable") || combined.includes("lentil") || combined.includes("pasta") ? "vegetarian" : null,
    combined.includes("salmon") || combined.includes("fish") ? "fish" : null,
    draft.servings >= 6 ? "hosting" : null,
    /make ahead|advance|chill overnight/.test(combined) ? "make ahead" : null
  ].filter(Boolean);
  // Fold in any detected cuisine/ethnicity labels. "asian" is broad, so only
  // keep it when no more specific Asian cuisine already matched.
  const cuisines = detectCuisines(combined);
  const specificAsian = ["chinese", "japanese", "korean", "thai", "vietnamese"];
  const cuisineSuggestions = cuisines.filter((cuisine) => cuisine !== "asian" || !cuisines.some((other) => specificAsian.includes(other)));
  const uniqueSuggestions = [...new Set([...suggestions, ...cuisineSuggestions])];
  $("#suggested-tags").innerHTML = (uniqueSuggestions.length ? uniqueSuggestions : ["new recipe"]).map((tag) => `
    <button type="button" class="suggested-tag is-selected" data-suggested-tag="${escAttr(tag)}">${esc(tag)} ✓</button>`).join("");
  $$("[data-suggested-tag]").forEach((button) => button.addEventListener("click", () => {
    button.classList.toggle("is-selected");
    button.textContent = button.classList.contains("is-selected") ? `${button.dataset.suggestedTag} ✓` : button.dataset.suggestedTag;
  }));
}

// Backfill nutrition for a recipe that was saved with zeros (e.g. imported
// before nutrition estimation existed). Reuses the distill function, feeding
// it the recipe's own text so the model estimates per-serving macros.
async function estimateNutrition(recipe) {
  const button = $("#estimate-nutrition-button");
  if (button) { button.disabled = true; button.textContent = "Estimating…"; }
  const recipeText = [
    recipe.title,
    `Serves ${recipe.servings}`,
    "Ingredients:",
    ...recipe.ingredients,
    "Instructions:",
    ...recipe.instructions
  ].join("\n");
  try {
    const draft = await requestDistilledRecipe(recipeText, "");
    const nutrition = normalizeNutrition(draft.nutrition);
    if (!hasNutrition(nutrition)) throw new Error("no values returned");
    Object.assign(recipe, nutrition);
    saveRecipes();
    try {
      await updateRecipeToCloud(recipe);
    } catch (cloudError) {
      console.warn("Nutrition estimate saved locally only:", cloudError.message);
    }
    render();
    openDrawer(recipe.id);
    showToast("Nutrition estimated.");
  } catch (error) {
    console.error(error);
    if (button) { button.disabled = false; button.textContent = "Estimate nutrition"; }
    showToast(`Couldn't estimate nutrition: ${error.message || "try again"}`);
  }
}

async function requestDistilledRecipe(text, url) {
  if (mockMode) {
    let draft = normalizeDraft(extractDraft(text, url));
    let mode = "mock";
    if (cloud.client && cloud.session && url.trim()) {
      const { data, error } = await cloud.client.functions.invoke("distill-recipe", {
        body: { text, url, skipModel: true }
      });
      if (!error && data) {
        draft = normalizeDraft(data);
        mode = "extract-only";
      }
    }
    state.lastImportDebug = {
      timestamp: new Date().toISOString(),
      mode,
      request: { text, url },
      response: draft,
      claudeCalled: false
    };
    localStorage.setItem("kitchen-archive-last-import-debug", JSON.stringify(state.lastImportDebug, null, 2));
    return draft;
  }
  if (!cloud.client) return extractDraft(text, url);
  const { data, error } = await cloud.client.functions.invoke("distill-recipe", {
    body: { text, url }
  });
  if (error) throw error;
  state.lastImportDebug = {
    timestamp: new Date().toISOString(),
    mode: "live",
    request: { text, url },
    response: data
  };
  localStorage.setItem("kitchen-archive-last-import-debug", JSON.stringify(state.lastImportDebug, null, 2));
  return data;
}

function renderImportDebug() {
  const panel = $("#dev-debug-panel");
  if (!panel) return;
  panel.hidden = !devMode;
  if (devMode) $("#import-debug-output").textContent = JSON.stringify(state.lastImportDebug || {}, null, 2);
}

async function showImportReview() {
  const activePanel = document.querySelector(".import-panel:not([hidden])");
  const text = activePanel?.dataset.importPanel === "paste" ? $("#import-text").value : "";
  const url = activePanel?.dataset.importPanel === "link" ? $("#import-url").value : "";
  if (!text.trim() && !url.trim()) {
    showToast("Paste a recipe or add a recipe link first.");
    return;
  }
  const button = $("#distill-button");
  button.disabled = true;
  button.innerHTML = "Cleaning recipe <span class=\"loading-dots\">···</span>";
  try {
    const draft = normalizeDraft(await requestDistilledRecipe(text, url));
    state.activeImportDraft = draft;
    const form = $("#import-review-form");
    form.title.value = draft.title || "Imported recipe";
    form.servings.value = draft.servings || 4;
    form.time.value = draft.time || "45 min";
    form.description.value = draft.description || "";
    form.imageUrl.value = draft.imageUrl || "";
    form.measurementMode.value = draft.measurementMode || "both";
    form.ingredients.value = (draft.ingredients || []).join("\n");
    form.instructions.value = (draft.instructions || []).join("\n");
    form.customTags.value = "";
    $("#import-image-preview").hidden = !draft.imageUrl;
    if (draft.imageUrl) $("#import-image").src = draft.imageUrl;
    const gallery = $("#import-image-gallery");
    gallery.innerHTML = (draft.imageUrls || []).map((imageUrl) => `<img src="${escAttr(imageUrl)}" alt="Imported recipe photo" />`).join("");
    gallery.hidden = !(draft.imageUrls || []).length;
    renderSuggestedTags(draft);
    renderImportDebug();
    $("#import-entry-view").hidden = true;
    $("#import-review-view").hidden = false;
    setTimeout(() => form.title.focus(), 0);
  } catch (error) {
    console.error(error);
    showToast(`Recipe cleanup failed: ${error.message || "check the link and try again"}`);
  } finally {
    button.disabled = false;
    button.innerHTML = "Clean up recipe <span>✦</span>";
  }
}

function showToast(message) {
  const toast = $("#toast");
  toast.textContent = message;
  toast.classList.add("is-visible");
  setTimeout(() => toast.classList.remove("is-visible"), 2500);
}

function openFilterPopover() {
  const button = $("#filter-button");
  const rect = button.getBoundingClientRect();
  const popover = $("#filter-popover");
  popover.style.top = `${rect.bottom + 8}px`;
  popover.style.left = `${Math.min(rect.left, window.innerWidth - 240)}px`;
  $("#filter-options").innerHTML = allTags().map((tag) => `<button data-filter-tag="${escAttr(tag)}">${state.selectedTags.includes(tag) ? "✓ " : ""}${esc(tag)}</button>`).join("");
  $$("[data-filter-tag]").forEach((item) => item.addEventListener("click", () => { toggleTag(item.dataset.filterTag); openFilterPopover(); }));
  popover.hidden = false;
}

$("#search-input").addEventListener("input", (event) => { state.search = event.target.value; renderRecipes(); });
$("#sort-select").addEventListener("change", (event) => { state.sort = event.target.value; renderRecipes(); });
$("#filter-button").addEventListener("click", openFilterPopover);
$("#new-recipe-button").addEventListener("click", openImportModal);
$("#empty-new-button").addEventListener("click", openImportModal);
$("#auth-button").addEventListener("click", async () => {
  if (!cloud.session) {
    openAuthModal();
    return;
  }
  await cloud.client.auth.signOut();
});
$("#add-label-button").addEventListener("click", async () => {
  // Labels live as tags on recipes, so a new label has to attach to one.
  // Use the recipe currently open in the drawer; otherwise there's no target.
  const recipe = state.activeRecipe;
  if (!recipe) {
    showToast("Open a recipe first, then add a label to it.");
    return;
  }
  const tag = window.prompt("New label name")?.trim();
  if (!tag) return;
  if (recipe.tags.includes(tag)) {
    showToast(`“${tag}” is already on this recipe.`);
    return;
  }
  recipe.tags.push(tag);
  saveRecipes();
  render();
  // Re-open the drawer so the newly added tag shows immediately (render()
  // refreshes the grid/sidebar but not the already-open drawer contents).
  if (state.activeRecipe?.id === recipe.id) openDrawer(recipe.id);
  try {
    await updateRecipeToCloud(recipe);
    showToast(`Added “${tag}” to ${recipe.title}.`);
  } catch (error) {
    // Don't claim success on a failed cloud write — tags are rebuilt from the
    // cloud on reload, so the label would silently disappear.
    console.warn("Label cloud sync skipped:", error.message);
    showToast(`Added “${tag}” locally; cloud sync failed.`);
  }
});
$("#clear-filters-button").addEventListener("click", clearFilters);
$("#manage-labels-button").addEventListener("click", openLabelManager);
$("#label-manager-close").addEventListener("click", closeLabelManager);
$("#label-manager-done").addEventListener("click", closeLabelManager);
$("#label-manager-modal").addEventListener("click", (event) => { if (event.target.id === "label-manager-modal") closeLabelManager(); });
$("#drawer-close").addEventListener("click", closeDrawer);
$("#modal-close").addEventListener("click", closeModal);
$("#cancel-form").addEventListener("click", closeModal);
$("#import-close").addEventListener("click", closeImportModal);
$("#import-cancel").addEventListener("click", closeImportModal);
$("#manual-from-import").addEventListener("click", () => { closeImportModal(); openModal(); });
$("#back-to-import").addEventListener("click", () => { $("#import-review-view").hidden = true; $("#import-entry-view").hidden = false; });
$("#distill-button").addEventListener("click", showImportReview);
$("#import-file").addEventListener("change", (event) => {
  const file = event.target.files[0];
  if (file) $("#file-name").textContent = file.name;
  if (file?.type === "text/plain") {
    const reader = new FileReader();
    reader.addEventListener("load", () => { $("#import-text").value = reader.result; });
    reader.readAsText(file);
  }
});
$$(".import-tab").forEach((tab) => tab.addEventListener("click", () => {
  $$(".import-tab").forEach((item) => item.classList.toggle("is-active", item === tab));
  $$(".import-panel").forEach((panel) => {
    panel.hidden = panel.dataset.importPanel !== tab.dataset.importTab;
    panel.classList.toggle("is-active", !panel.hidden);
  });
}));
$("#recipe-drawer").addEventListener("click", (event) => { if (event.target.id === "recipe-drawer") closeDrawer(); });
$("#recipe-modal").addEventListener("click", (event) => { if (event.target.id === "recipe-modal") closeModal(); });
$("#import-modal").addEventListener("click", (event) => { if (event.target.id === "import-modal") closeImportModal(); });
$("#auth-close").addEventListener("click", closeAuthModal);
$("#auth-modal").addEventListener("click", (event) => { if (event.target.id === "auth-modal") closeAuthModal(); });
$("#auth-mode-toggle").addEventListener("click", () => setAuthMode(cloud.authMode === "signin" ? "signup" : "signin"));
document.addEventListener("click", (event) => {
  if (!event.target.closest("#filter-popover") && !event.target.closest("#filter-button")) $("#filter-popover").hidden = true;
});
document.addEventListener("keydown", (event) => {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") { event.preventDefault(); $("#search-input").focus(); }
  if (event.key === "Escape") { closeDrawer(); closeModal(); closeImportModal(); closeAuthModal(); closeLabelManager(); $("#filter-popover").hidden = true; }
});
$$(".nav-item").forEach((item) => item.addEventListener("click", () => { state.view = item.dataset.view; render(); }));
$("#recipe-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(event.target);
  const title = data.get("title").trim();
  const tags = (data.get("tags") || "").split(",").map((tag) => tag.trim()).filter(Boolean);
  const ingredients = (data.get("ingredients") || "").split("\n").map((item) => item.trim()).filter(Boolean);
  const instructions = (data.get("instructions") || "").split("\n").map((item) => item.trim()).filter(Boolean);
  if (state.editingRecipeId) {
    const recipe = state.recipes.find((item) => item.id === state.editingRecipeId);
    if (!recipe) return;
    Object.assign(recipe, {
      title,
      description: data.get("description") || "",
      time: Number.parseInt(data.get("time"), 10) || 30,
      servings: Number.parseInt(data.get("servings"), 10) || 4,
      tags: tags.length ? tags : ["new"],
      ingredients,
      ingredientRecords: ingredients.map((item) => ({ original: item, metric: "" })),
      instructions: instructions.length ? instructions : ["Add cooking instructions when you are ready."]
    });
    closeModal();
    // Persist locally and refresh the UI first so the edit survives even if the
    // cloud write fails (otherwise it lived only in memory and reverted on
    // reload). Then attempt the cloud sync and report only its outcome.
    saveRecipes();
    render();
    openDrawer(recipe.id);
    updateRecipeToCloud(recipe)
      .then(() => showToast("Recipe updated."))
      .catch((error) => showToast(`Updated locally; cloud sync failed: ${error.message || "try again"}`));
    return;
  }
  const recipe = {
    id: `${Date.now()}-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
    title,
    description: data.get("description") || "A new recipe in the archive.",
    time: Number.parseInt(data.get("time"), 10) || 30,
    servings: Number.parseInt(data.get("servings"), 10) || 4,
    tags: tags.length ? tags : ["new"],
    imageClass: "new",
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    rating: 0,
    cooked: 0,
    added: Date.now(),
    ingredients,
    ingredientRecords: ingredients.map((item) => ({ original: item, metric: "" })),
    instructions: instructions.length ? instructions : ["Add cooking instructions when you are ready."],
    variants: [],
    ratings: [],
    source: "Added manually"
  };
  closeModal();
  persistNewRecipe(recipe);
});
$("#import-review-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(event.target);
  const selectedTags = $$("[data-suggested-tag].is-selected").map((button) => button.dataset.suggestedTag);
  // Fold in any labels the user typed themselves, then de-dupe against the
  // selected suggestion chips so an added-and-suggested label isn't doubled.
  const customTags = (data.get("customTags") || "").split(",").map((item) => item.trim()).filter(Boolean);
  const tags = [...new Set([...selectedTags, ...customTags])];
  const title = data.get("title").trim();
  const recipe = {
    id: `${Date.now()}-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
    title,
    description: data.get("description"),
    time: Number.parseInt(data.get("time"), 10) || 45,
    servings: Number.parseInt(data.get("servings"), 10) || 4,
    tags: tags.length ? tags : ["new recipe"],
    imageClass: "new",
    imageUrl: data.get("imageUrl") || state.activeImportDraft?.imageUrl || "",
    imageUrls: state.activeImportDraft?.imageUrls || [],
    measurementMode: data.get("measurementMode") || state.activeImportDraft?.measurementMode || "both",
    ...normalizeNutrition(state.activeImportDraft?.nutrition),
    rating: 0,
    cooked: 0,
    added: Date.now(),
    ingredients: data.get("ingredients").split("\n").map((item) => item.trim()).filter(Boolean),
    ingredientRecords: state.activeImportDraft?.ingredientRecords || data.get("ingredients").split("\n").map((item) => ({ original: item.trim(), metric: "" })).filter((item) => item.original),
    instructions: data.get("instructions").split("\n").map((item) => item.trim()).filter(Boolean),
    variants: [],
    ratings: [],
    source: "Distilled import · review required",
    sourceUrl: state.activeImportDraft?.sourceUrl || ""
  };
  closeImportModal();
  state.activeImportDraft = null;
  persistNewRecipe(recipe);
});
$("#copy-import-debug").addEventListener("click", async () => {
  const packet = JSON.stringify(state.lastImportDebug || {}, null, 2);
  await navigator.clipboard.writeText(packet);
  showToast("Debug packet copied.");
});

$("#auth-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!cloud.client) {
    showAuthError("Supabase is not configured in this browser.");
    return;
  }
  const data = new FormData(event.target);
  const email = data.get("email").trim();
  const password = data.get("password");
  const isSignup = cloud.authMode === "signup";
  $("#auth-submit").disabled = true;
  $("#auth-error").hidden = true;
  try {
    if (isSignup) {
      const displayName = data.get("displayName").trim() || email.split("@")[0];
      const householdName = data.get("householdName").trim() || "My kitchen";
      const { data: signup, error } = await cloud.client.auth.signUp({
        email,
        password,
        options: { data: { display_name: displayName } }
      });
      if (error) throw error;
      if (signup.session) {
        await createHousehold(displayName, householdName);
        closeAuthModal();
        showToast("Your household archive is ready.");
      } else {
        closeAuthModal();
        showToast("Check your email to confirm your account, then sign in.");
      }
    } else {
      const { error } = await cloud.client.auth.signInWithPassword({ email, password });
      if (error) throw error;
      closeAuthModal();
    }
  } catch (error) {
    showAuthError(error.message || "Authentication failed.");
  } finally {
    $("#auth-submit").disabled = false;
  }
});

render();
initSupabase();
