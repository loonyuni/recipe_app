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

const state = {
  recipes: JSON.parse(localStorage.getItem("kitchen-archive-recipes") || "null") || starterRecipes,
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
const localReviewers = ["Uni", "Alex"];
const hiddenReviewers = new Set(["loonyuni"]);

const queryParams = new URLSearchParams(window.location.search);
const devMode = queryParams.has("dev");
const mockMode = queryParams.has("mock");
const personalImageGallery = {
  "https://www.taste.com.au/recipes/one-pan-salmon-broccoli-bake/m8i624wf": [
    "assets/recipes/one-pan-salmon-broccoli-bake/IMG_7622.JPG",
    "assets/recipes/one-pan-salmon-broccoli-bake/IMG_7627.JPG",
    "assets/recipes/one-pan-salmon-broccoli-bake/IMG_7628.JPG"
  ]
};
const personalImageGalleryByTitle = {
  "one-pan salmon and broccoli bake": personalImageGallery["https://www.taste.com.au/recipes/one-pan-salmon-broccoli-bake/m8i624wf"]
};

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

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
    imageUrls: [...sourceImages, ...(draft.imageUrls || []), ...(extractedImage ? [extractedImage] : [])].filter(Boolean)
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

async function loadCloudRecipes() {
  if (!cloud.client || !cloud.session) return;
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
  state.recipes = (data || []).map(recipeFromRow);
  await Promise.all(state.recipes
    .filter((recipe) => recipe.imageUrls?.length)
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
  }
  cloud.connected = true;
  render();
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
    time_minutes: recipe.time,
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
}

async function updateRecipeToCloud(recipe) {
  if (!cloud.connected || !cloud.client || !cloud.householdId) return;
  const { error } = await cloud.client.from("recipes").update({
    title: recipe.title,
    description: recipe.description || "",
    servings: recipe.servings,
    time_minutes: Number.parseInt(recipe.time, 10) || 0,
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
  const member = cloud.members.find((item) => item.display_name === rating.member);
  if (!member) return;
  const { error } = await cloud.client.from("ratings").insert({
    recipe_id: recipe.id,
    member_id: member?.id || cloud.memberId,
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
    : "Sign in to save recipes to your shared Kitchen Archive.";
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
  state.recipes.unshift(recipe);
  saveRecipes();
  if (cloud.connected) {
    try {
      await saveRecipeToCloud(recipe);
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
    window.KITCHEN_ARCHIVE_SUPABASE.anonKey
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
      cloud.connected = false;
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
  $("#label-list").innerHTML = allTags().slice(0, 12).map((tag) => `
    <div class="label-item" data-tag="${tag}">
      <span class="label-dot"></span><span>${tag}</span>
      <span class="label-count">${state.recipes.filter((recipe) => recipe.tags.includes(tag)).length}</span>
    </div>`).join("");
  $$(".label-item").forEach((item) => item.addEventListener("click", () => toggleTag(item.dataset.tag)));
}

function semanticTerms(query) {
  const synonyms = {
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
  return query.toLowerCase().split(/\s+/).flatMap((word) => [word, ...(synonyms[word] || [])]);
}

function filteredRecipes() {
  let recipes = [...state.recipes];
  if (state.view === "favorites") recipes = recipes.filter((recipe) => averageRating(recipe) >= 4.5);
  if (state.view === "recent") recipes = recipes.filter((recipe) => recipe.cooked > 0).sort((a, b) => b.cooked - a.cooked);
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
  if (state.sort === "time") recipes.sort((a, b) => a.time - b.time);
  if (state.sort === "recent") recipes.sort((a, b) => b.added - a.added);
  return recipes;
}

function renderRecipes() {
  const recipes = filteredRecipes();
  $("#recipe-count").textContent = recipes.length;
  $("#result-count").textContent = state.search || state.selectedTags.length ? `${recipes.length} matches` : "";
  $("#recipe-grid").innerHTML = recipes.map((recipe) => `
    <article class="recipe-card" data-id="${recipe.id}" tabindex="0">
      <div class="recipe-card__image recipe-card__image--${recipe.imageClass}" aria-label="${recipe.title}">
        ${recipeImageUrls(recipe).length
          ? `<img src="${recipeImageUrls(recipe).at(-1)}" alt="${recipe.title}" />`
          : `<span>${recipe.title.split(" ").slice(0, 2).join(" ")}</span>`}
      </div>
      <div class="recipe-card__body">
        <h3>${recipe.title}</h3>
        <p>${recipe.description}</p>
        <div class="card-meta"><span>◷ ${recipe.time} min</span><span>♧ ${recipe.servings} servings</span></div>
        <div class="card-footer">
          <div class="card-tags">${recipe.tags.slice(0, 2).map((tag) => `<span class="card-tag">${tag}</span>`).join("")}</div>
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
    <span class="filter-chip">${tag}<button aria-label="Remove ${tag}" data-remove-tag="${tag}">×</button></span>`).join("");
  $$("[data-remove-tag]").forEach((button) => button.addEventListener("click", () => toggleTag(button.dataset.removeTag)));
}

function render() {
  renderLabels();
  renderFilters();
  renderRecipes();
  const titles = { library: "All recipes", favorites: "Family favorites", recent: "Recently cooked" };
  $("#view-title").firstChild.textContent = titles[state.view] + " ";
  $$(".nav-item").forEach((item) => item.classList.toggle("is-active", item.dataset.view === state.view));
}

function toggleTag(tag) {
  state.selectedTags = state.selectedTags.includes(tag)
    ? state.selectedTags.filter((selected) => selected !== tag)
    : [...state.selectedTags, tag];
  render();
}

function openDrawer(id) {
  const recipe = state.recipes.find((item) => item.id === id);
  if (!recipe) return;
  state.activeRecipe = recipe;
  const ratings = recipe.ratings || [];
  const reviewers = [...new Set([
    ...localReviewers,
    ...cloud.members.map((member) => member.display_name),
    ...ratings.map((rating) => rating.member)
  ])].filter((member) => !hiddenReviewers.has(String(member).trim().toLowerCase()));
  $("#drawer-content").innerHTML = `
    <p class="eyebrow">Recipe archive · ${recipe.source || "Personal recipe"}</p>
    <h2 class="drawer-title" id="drawer-title">${recipe.title}</h2>
    <p class="drawer-description">${recipe.description}</p>
    <div class="drawer-actions">
      <button class="ghost-button" id="edit-recipe-button">Edit recipe</button>
      <button class="danger-button" id="delete-recipe-button">Delete</button>
    </div>
    ${recipeImageUrls(recipe).length ? `
      <div class="drawer-image-gallery">
        ${recipeImageUrls(recipe).map((imageUrl, index) => `<img src="${imageUrl}" alt="${recipe.title} photo ${index + 1}" />`).join("")}
      </div>
    ` : ""}
    <div class="drawer-tags">${recipe.tags.map((tag) => `<span class="drawer-tag">${tag}</span>`).join("")}</div>
    <div class="card-meta"><span>◷ ${recipe.time} min</span><span>♧ ${recipe.servings} servings</span><span>★ ${averageRating(recipe).toFixed(1)} household</span></div>
    <hr class="drawer-rule" />
    <h3 class="drawer-section-title">Nutrition per serving</h3>
    <div class="nutrition-strip">
      <div class="nutrition-cell"><span class="nutrition-value">${recipe.calories}</span><span class="nutrition-label">kcal</span></div>
      <div class="nutrition-cell"><span class="nutrition-value">${recipe.protein} g</span><span class="nutrition-label">protein</span></div>
      <div class="nutrition-cell"><span class="nutrition-value">${recipe.carbs} g</span><span class="nutrition-label">carbs</span></div>
      <div class="nutrition-cell"><span class="nutrition-value">${recipe.fat} g</span><span class="nutrition-label">fat</span></div>
    </div>
    <p class="source-line">Nutrition is an estimate · <strong>medium confidence</strong></p>
    <hr class="drawer-rule" />
    <h3 class="drawer-section-title">Ingredients</h3>
    <ul class="ingredient-list">${recipe.ingredients.map((ingredient) => `<li>${ingredient}</li>`).join("")}</ul>
    <h3 class="drawer-section-title">Method</h3>
    <ol class="instruction-list">${recipe.instructions.map((step) => `<li>${step}</li>`).join("")}</ol>
    <hr class="drawer-rule" />
    <h3 class="drawer-section-title">Family ratings · ★ ${averageRating(recipe).toFixed(1)} overall</h3>
    <div class="family-rating">${ratings.map((rating) => `
      <div class="member-rating"><span class="member-name">${rating.member}</span><span class="stars">${ratingStars(rating.score)}</span><span class="member-score">${rating.score.toFixed(1)}</span></div>`).join("")}</div>
    <form id="rating-form" class="rating-form">
      <select name="member" aria-label="Reviewer">${reviewers.map((member) => `<option>${member}</option>`).join("")}</select>
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
    ${recipe.variants.map((variant) => `<div class="variant-card"><strong>${variant.name}</strong><p>${variant.note}</p></div>`).join("")}
    <button class="ghost-button" style="margin-top:14px" id="add-variant-button">＋ Add a variant</button>`;
  $("#recipe-drawer").hidden = false;
  $("#edit-recipe-button").addEventListener("click", () => openEditModal(recipe));
  $("#delete-recipe-button").addEventListener("click", () => deleteRecipe(recipe));
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
    saveManualRating(recipe, rating);
    saveRecipes();
    try {
      await saveRatingToCloud(recipe, rating);
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
  const uniqueSuggestions = [...new Set(suggestions)];
  $("#suggested-tags").innerHTML = (uniqueSuggestions.length ? uniqueSuggestions : ["new recipe"]).map((tag) => `
    <button type="button" class="suggested-tag is-selected" data-suggested-tag="${tag}">${tag} ✓</button>`).join("");
  $$("[data-suggested-tag]").forEach((button) => button.addEventListener("click", () => {
    button.classList.toggle("is-selected");
    button.textContent = button.classList.contains("is-selected") ? `${button.dataset.suggestedTag} ✓` : button.dataset.suggestedTag;
  }));
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
    $("#import-image-preview").hidden = !draft.imageUrl;
    if (draft.imageUrl) $("#import-image").src = draft.imageUrl;
    const gallery = $("#import-image-gallery");
    gallery.innerHTML = (draft.imageUrls || []).map((imageUrl) => `<img src="${imageUrl}" alt="Imported recipe photo" />`).join("");
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
  $("#filter-options").innerHTML = allTags().map((tag) => `<button data-filter-tag="${tag}">${state.selectedTags.includes(tag) ? "✓ " : ""}${tag}</button>`).join("");
  $$("[data-filter-tag]").forEach((item) => item.addEventListener("click", () => { toggleTag(item.dataset.filterTag); openFilterPopover(); }));
  popover.hidden = false;
}

$("#search-input").addEventListener("input", (event) => { state.search = event.target.value; renderRecipes(); });
$("#sort-select").addEventListener("change", (event) => { state.sort = event.target.value; renderRecipes(); });
$("#filter-button").addEventListener("click", openFilterPopover);
$("#new-recipe-button").addEventListener("click", openImportModal);
$("#empty-new-button").addEventListener("click", openImportModal);
$("#import-button").addEventListener("click", openImportModal);
$("#auth-button").addEventListener("click", async () => {
  if (!cloud.session) {
    openAuthModal();
    return;
  }
  await cloud.client.auth.signOut();
});
$("#add-label-button").addEventListener("click", () => {
  const tag = window.prompt("New label name");
  if (tag?.trim()) {
    state.recipes[0].tags.push(tag.trim());
    saveRecipes();
    render();
    showToast(`Added “${tag.trim()}” to the label list.`);
  }
});
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
  if (event.key === "Escape") { closeDrawer(); closeModal(); closeImportModal(); closeAuthModal(); $("#filter-popover").hidden = true; }
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
    updateRecipeToCloud(recipe)
      .then(() => { saveRecipes(); render(); openDrawer(recipe.id); showToast("Recipe updated."); })
      .catch((error) => showToast(`Update failed: ${error.message || "try again"}`));
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
  const title = data.get("title").trim();
  const recipe = {
    id: `${Date.now()}-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
    title,
    description: data.get("description"),
    time: Number.parseInt(data.get("time"), 10) || 45,
    servings: Number.parseInt(data.get("servings"), 10) || 4,
    tags: selectedTags.length ? selectedTags : ["new recipe"],
    imageClass: "new",
    imageUrl: data.get("imageUrl") || state.activeImportDraft?.imageUrl || "",
    imageUrls: state.activeImportDraft?.imageUrls || [],
    measurementMode: data.get("measurementMode") || state.activeImportDraft?.measurementMode || "both",
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
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
