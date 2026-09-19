// ui.js — rendering (grid + detail), import flow, auth UI, event wiring + boot.
// (loads last)
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
  } else if (state.view === "recent") {
    // Recently cooked: only recipes with a logged cook (see cookCount).
    recipes = recipes.filter((recipe) => (recipe.cookCount || 0) > 0);
  } else if (!searching && !tagFiltering) {
    // Default library view: keep the pastry-school archive out so it doesn't
    // bury personal recipes. Searching or filtering by a tag still surfaces
    // everything, so the archive stays discoverable.
    recipes = recipes.filter((recipe) => !isPastrySchool(recipe));
  }
  if (state.selectedTags.length) recipes = recipes.filter((recipe) => state.selectedTags.every((tag) => recipe.tags.includes(tag)));
  if (state.minRating > 0) recipes = recipes.filter((recipe) => averageRating(recipe) >= state.minRating);
  if (state.search.trim()) {
    const terms = semanticTerms(state.search);
    recipes = recipes.map((recipe) => {
      const haystack = `${recipe.title} ${recipe.description} ${recipe.tags.join(" ")} ${recipe.ingredients.join(" ")} ${recipe.instructions.join(" ")}`.toLowerCase();
      const score = terms.reduce((sum, term) => sum + (haystack.includes(term) ? (term.length > 5 ? 3 : 1) : 0), 0);
      return { recipe, score };
    }).filter((result) => result.score > 0).sort((a, b) => b.score - a.score).map((result) => result.recipe);
  }
  if (state.sort === "rating") recipes.sort((a, b) => averageRating(b) - averageRating(a));
  if (state.sort === "mostcooked") recipes.sort((a, b) => (b.cookCount || 0) - (a.cookCount || 0));
  if (state.sort === "title") recipes.sort((a, b) => a.title.localeCompare(b.title));
  if (state.sort === "time") recipes.sort((a, b) => timeMinutes(a.time) - timeMinutes(b.time));
  if (state.sort === "recent") recipes.sort((a, b) => b.added - a.added);
  if (state.sort === "viewed") {
    // Recipes you've opened float to the top by last-viewed time; ones you
    // haven't opened fall back to date-added order (same as "Recently added").
    const viewedAt = new Map(recentViews().map((entry) => [entry.id, entry.ts]));
    recipes.sort((a, b) => (viewedAt.get(b.id) || 0) - (viewedAt.get(a.id) || 0) || b.added - a.added);
  }
  // The Recently cooked tab is intrinsically ordered by last cooked, regardless
  // of the sort dropdown.
  if (state.view === "recent") recipes.sort((a, b) => new Date(b.lastCookedAt || 0) - new Date(a.lastCookedAt || 0));
  return recipes;
}

function renderRecipes() {
  const recipes = filteredRecipes();
  $("#recipe-count").textContent = recipes.length;
  $("#result-count").textContent = state.search || state.selectedTags.length ? `${recipes.length} matches` : "";
  $("#recipe-grid").innerHTML = recipes.map((recipe) => `
    <article class="recipe-card" data-id="${escAttr(recipe.id)}" tabindex="0">
      <div class="recipe-card__image recipe-card__image--${escAttr(recipe.imageClass)}${recipeImageUrls(recipe).length ? "" : " recipe-card__image--empty"}">
        ${recipeImageUrls(recipe).length
          ? `<img src="${escAttr(recipeImageUrls(recipe).at(-1))}" alt="${escAttr(recipe.title)}" loading="lazy" decoding="async" />`
          : ""}
        <h3 class="card-title">${esc(recipe.title)}</h3>
      </div>
      <div class="recipe-card__body">
        <p>${esc(recipe.description)}</p>
        <div class="card-meta"><span><svg class="icon"><use href="#i-clock"/></svg> ${esc(formatTimeLabel(recipe.time))}</span><span>${esc(recipe.servings)} servings</span>${recipe.cookCount ? `<span class="card-cook-badge">Made ${esc(recipe.cookCount)}×</span>` : ""}</div>
        ${canEditRecipe(recipe) ? `<button class="card-plan" data-plan-id="${escAttr(recipe.id)}" aria-label="Add to this week" title="Add to this week">＋ Plan</button>` : ""}
        <div class="card-footer">
          <div class="card-tags">${recipe.tags.slice(0, 2).map((tag) => `<span class="card-tag">${esc(tag)}</span>`).join("")}</div>
          <span class="card-rating">★ ${averageRating(recipe).toFixed(1)}</span>
        </div>
      </div>
    </article>`).join("");
  $("#empty-state").hidden = recipes.length !== 0;
  $$(".recipe-card").forEach((card) => {
    card.addEventListener("click", () => showRecipe(card.dataset.id));
    card.addEventListener("keydown", (event) => { if (event.key === "Enter") showRecipe(card.dataset.id); });
  });
  $$(".card-plan").forEach((btn) => btn.addEventListener("click", (e) => {
    e.stopPropagation();
    const id = btn.dataset.planId;
    if (state.plannedMeals.some((m) => m.recipeId === id && !m.made)) { showToast("Already on this week's plan."); return; }
    runPlanAction(async () => {
      await addPlannedMeal(id);
      showToast("Added to this week.");
    });
  }));
}

function renderFilters() {
  $("#active-filters").innerHTML = state.selectedTags.map((tag) => `
    <span class="filter-chip">${esc(tag)}<button aria-label="Remove ${escAttr(tag)}" data-remove-tag="${escAttr(tag)}">×</button></span>`).join("");
  $$("[data-remove-tag]").forEach((button) => button.addEventListener("click", () => toggleTag(button.dataset.removeTag)));
  const clearButton = $("#clear-filters-button");
  if (clearButton) clearButton.hidden = state.selectedTags.length === 0;
}

// Hide authoring controls and show the shared-view banner when no one is signed
// in on this device (public browse mode).
function updateReadOnlyChrome() {
  const readOnly = isReadOnly();
  const newButton = $("#new-recipe-button");
  if (newButton) newButton.hidden = readOnly;
  const emptyButton = $("#empty-new-button");
  if (emptyButton) emptyButton.hidden = readOnly;
  // Meal planning is a household feature (spec §F): hide the nav entry
  // entirely for signed-out visitors rather than showing an empty plan.
  const planNav = $(".nav-item[data-view='plan']");
  if (planNav) planNav.hidden = !cloud.connected;
}

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// Run a plan/grocery mutation (add/update/remove against Supabase) and surface
// any failure as a toast instead of letting it become a silent unhandled
// rejection. The caller's re-render, if any, belongs inside `fn` so it only
// runs after a successful await.
async function runPlanAction(fn) {
  try { await fn(); }
  catch (e) { console.error(e); showToast("Something went wrong. Please try again."); }
}

// Render the "This week" meal list: unmade meals first (by sort order), made
// meals sink to the bottom. Each row lets you jump to the recipe, set a day,
// mark it made, or remove it from the plan.
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
  $$(".planned-row", listEl).forEach((row) => {
    const id = row.dataset.mealId;
    row.querySelector(".planned-made").addEventListener("change", (e) => runPlanAction(async () => { await updatePlannedMeal(id, { made: e.target.checked }); renderPlan(); }));
    row.querySelector(".planned-title").addEventListener("click", (e) => showRecipe(e.target.dataset.recipeId));
    row.querySelector(".planned-day").addEventListener("change", (e) => runPlanAction(async () => { await updatePlannedMeal(id, { day: e.target.value === "" ? null : Number(e.target.value) }); }));
    row.querySelector(".planned-remove").addEventListener("click", () => runPlanAction(async () => { await removePlannedMeal(id); renderPlan(); }));
  });
}

// --- Add-meal modal: search + multi-select onto this week's plan -----------
let addMealSelection = new Set();

function openAddMealModal() {
  addMealSelection = new Set();
  $("#add-meal-search").value = "";
  $("#add-meal-confirm").textContent = "Add 0 meals";
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
  listEl.innerHTML = results.map((r) => {
    const thumb = recipeImageUrls(r).at(-1);
    return `
    <button class="add-meal-item${addMealSelection.has(r.id) ? " is-selected" : ""}" data-recipe-id="${escAttr(r.id)}">
      <span class="add-meal-check">${addMealSelection.has(r.id) ? "▣" : "▢"}</span>
      <span class="add-meal-thumb${thumb ? "" : " add-meal-thumb--empty"}">${thumb ? `<img src="${escAttr(thumb)}" alt="" loading="lazy" decoding="async" />` : ""}</span>
      <span class="add-meal-title">${esc(r.title)}</span>
      <span class="add-meal-time">${esc(formatTimeLabel(r.time))}</span>
    </button>`;
  }).join("") || `<p class="loading-note">No matches.</p>`;
  $$(".add-meal-item", listEl).forEach((btn) => btn.addEventListener("click", () => {
    const id = btn.dataset.recipeId;
    if (addMealSelection.has(id)) addMealSelection.delete(id); else addMealSelection.add(id);
    renderAddMealResults($("#add-meal-search").value);
    $("#add-meal-confirm").textContent = `Add ${addMealSelection.size} meal${addMealSelection.size === 1 ? "" : "s"}`;
  }));
}

// --- Grocery list: generate from this week's unmade meals + pantry staples --

// Aggregate ingredients across every unmade planned meal, fold in pantry
// staples (marked "have" rather than dropped), and merge onto the living
// grocery list so existing got/have statuses and manual items survive.
// Pick-before-generate: pressing Generate opens a picker of the aggregated
// ingredients from this week's un-made meals. You tick what you need, and only
// the picked items become the grocery list. Pantry staples start unchecked
// (word-level match), and items already on the list stay checked.
let generateAggregated = [];
let generateSelection = new Set();

function openGenerateModal() {
  const byId = new Map(state.recipes.map((r) => [r.id, r]));
  const recipes = state.plannedMeals
    .filter((m) => !m.made)
    .map((m) => byId.get(m.recipeId))
    .filter(Boolean);
  generateAggregated = aggregateGroceries(recipes);
  if (!generateAggregated.length) { showToast("Add some meals to this week first."); return; }
  // Start with nothing selected: you tick the items you actually need to buy.
  generateSelection = new Set();
  renderGenerateResults();
  $("#generate-grocery-modal").hidden = false;
}
function closeGenerateModal() { $("#generate-grocery-modal").hidden = true; }

function renderGenerateResults() {
  const listEl = $("#generate-grocery-list");
  if (!listEl) return;
  listEl.innerHTML = generateAggregated.map((a) => `
    <button class="gen-item${generateSelection.has(a.item_key) ? " is-selected" : ""}" data-key="${escAttr(a.item_key)}">
      <span class="gen-check">${generateSelection.has(a.item_key) ? "▣" : "▢"}</span>
      <span class="gen-label">${esc(a.display)}</span>
    </button>`).join("") || `<p class="loading-note">Nothing to add.</p>`;
  $$(".gen-item", listEl).forEach((btn) => btn.addEventListener("click", () => {
    const k = btn.dataset.key;
    if (generateSelection.has(k)) generateSelection.delete(k); else generateSelection.add(k);
    renderGenerateResults();
  }));
  $("#generate-grocery-confirm").textContent = `Generate list (${generateSelection.size})`;
}

async function confirmGenerateGrocery() {
  const existing = state.grocery.map((g) => ({ item_key: g.itemKey, display: g.display, status: g.status, manual: g.manual }));
  const next = selectGrocery(existing, generateAggregated, generateSelection);
  await replaceGrocery(next);
  closeGenerateModal();
  renderGroceries();
  state.planPane = "groceries";
  $("#plan-pane").hidden = true; $("#grocery-pane").hidden = false;
  $$("#plan-toggle .plan-toggle-btn").forEach((b) => b.classList.toggle("is-active", b.dataset.pane === "groceries"));
}

// Render the grocery list as a plain checklist: To buy (tap to check off) and
// Got (checked off this trip). No "have" bucket; filtering happens at generate.
function renderGroceries() {
  const listEl = $("#grocery-list");
  if (!listEl) return;
  const toBuy = state.grocery.filter((g) => g.status !== "got");
  const got = state.grocery.filter((g) => g.status === "got");
  const section = (title, items) => items.length ? `
    <div class="grocery-group">
      <div class="grocery-group-head">${esc(title)}</div>
      ${items.map((g) => `
        <div class="grocery-row status-${g.status}" data-grocery-id="${escAttr(g.id)}">
          <input type="checkbox" class="grocery-check" ${g.status === "got" ? "checked" : ""} aria-label="Got it" />
          <span class="grocery-label">${esc(g.display)}${g.manual ? ` <span class="grocery-manual">(added by you)</span>` : ""}</span>
          <button class="grocery-remove" aria-label="Remove">×</button>
        </div>`).join("")}
    </div>` : "";
  const html = section("To buy", toBuy) + section("Got", got);
  listEl.innerHTML = html || `<p class="loading-note">No grocery list yet. Plan meals, then press Generate to pick what you need.</p>`;
  $$(".grocery-row", listEl).forEach((row) => {
    const id = row.dataset.groceryId;
    row.querySelector(".grocery-check").addEventListener("change", (e) => runPlanAction(async () => { await setGroceryStatus(id, e.target.checked ? "got" : "need"); renderGroceries(); }));
    row.querySelector(".grocery-remove").addEventListener("click", () => runPlanAction(async () => { await clearGrocery((g) => g.id === id); renderGroceries(); }));
  });
}

// --- Pantry staples editor (mirrors the label manager) ----------------------
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
  $$(".staples-remove", listEl).forEach((btn) => btn.addEventListener("click", () => runPlanAction(async () => { await removeStaple(btn.dataset.remove); renderStaples(); })));
}

function render() {
  renderLabels();
  renderFilters();
  updateReadOnlyChrome();
  renderRecentlyViewed();
  const detail = state.mode === "detail" && state.activeRecipe;
  // The "This week" plan is household-only (spec §F): a signed-out visitor
  // never has a household, so stale/shared state pointing at it falls back to
  // the library view instead of showing an empty plan pane.
  if (state.view === "plan" && !cloud.connected) state.view = "library";
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
  const titles = { library: "All recipes", recent: "Recently cooked", pastry: "Pastry school" };
  $("#view-title").firstChild.textContent = (titles[state.view] || "All recipes") + " ";
  // First paint while the cloud/public library loads: show a loading note instead
  // of the seed recipes, so returning visitors don't see a flash-then-reload.
  if (state.booting) {
    $("#recipe-grid").innerHTML = `<p class="loading-note">Loading recipes…</p>`;
    $("#empty-state").hidden = true;
    $("#recipe-count").textContent = "";
    return;
  }
  renderRecipes();
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
  const sections = getSections(recipe);

  // Fill every section's ingredient list (there may be several). The one global
  // factor applies to all of them, so each list scales together.
  $$(".scaled-ingredient-list").forEach((list) => {
    const ingredients = sections[Number(list.dataset.section) || 0]?.ingredients || [];
    list.innerHTML = normalizeIngredientList(ingredients).map((ingredient, index) => {
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
  });

  // Servings input reflects the current factor. Don't overwrite it while the
  // user is mid-edit (focused); the change handler commits and re-renders.
  const servingsInput = $("#scale-servings");
  if (servingsInput && document.activeElement !== servingsInput) {
    servingsInput.value = formatScaledServings(recipe.servings, factor);
  }
  const factorEl = $("#scale-factor");
  if (factorEl) factorEl.textContent = ` · ${formatQuantity(factor)}×`;
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

// User typed a target serving count. Derive the scale factor from the recipe's
// base servings, then rescale every ingredient (and nutrition) to match.
function onServingsChange(event) {
  const recipe = state.activeRecipe;
  if (!recipe) return;
  const base = Number(recipe.servings) || 0;
  const parsed = parseLeadingQuantity(event.target.value);
  const target = parsed ? parsed.value : Number(event.target.value);
  if (base <= 0 || !Number.isFinite(target) || target <= 0) {
    applyDrawerScaling(); // reject bad input and restore the last valid display
    return;
  }
  drawerScale = target / base;
  applyDrawerScaling();
}

// Build the absolute permalink for a shared recipe: current origin + path with
// only ?recipe=<slug> (drops dev/mock flags and any hash).
function shareLinkFor(recipe) {
  const url = new URL(window.location.href);
  url.search = "";
  url.hash = "";
  url.searchParams.set("recipe", recipe.slug);
  return url.toString();
}

async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    let ok = false;
    try { ok = document.execCommand("copy"); } catch { ok = false; }
    textarea.remove();
    return ok;
  }
}

// Make a recipe public (minting/reusing its slug server-side) and copy the link.
async function shareRecipe(recipe) {
  if (!cloud.connected || !cloud.client) {
    showToast("Sign in to share recipes.");
    return;
  }
  try {
    const { data, error } = await cloud.client.rpc("publish_recipe", {
      target_recipe: recipe.id,
      make_public: true
    });
    if (error) throw error;
    recipe.slug = data;
    recipe.isPublic = true;
    const copied = await copyToClipboard(shareLinkFor(recipe));
    showToast(copied ? "Share link copied to clipboard." : "Recipe shared. Copy the link from the page.");
    render();
  } catch (error) {
    console.error(error);
    showToast(`Couldn't share: ${error.message || "unknown error"}`);
  }
}

async function unshareRecipe(recipe) {
  if (!cloud.connected || !cloud.client) return;
  try {
    const { error } = await cloud.client.rpc("publish_recipe", {
      target_recipe: recipe.id,
      make_public: false
    });
    if (error) throw error;
    recipe.isPublic = false;
    showToast("Recipe is private again. Its link now stops working.");
    render();
  } catch (error) {
    console.error(error);
    showToast(`Couldn't stop sharing: ${error.message || "unknown error"}`);
  }
}

// Upload a photo to Supabase Storage (recipe-photos bucket) and append it to
// the recipe's gallery. Lets you add a new shot every time you make it.
async function uploadRecipePhoto(recipe, file) {
  if (!file) return;
  if (!cloud.connected || !cloud.client || !cloud.householdId) { showToast("Sign in to add photos."); return; }
  showToast("Uploading photo…");
  try {
    const ext = ((file.name || "").split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
    const path = `${recipe.id}/${Date.now()}.${ext}`;
    const { error: uploadError } = await cloud.client.storage
      .from("recipe-photos")
      .upload(path, file, { contentType: file.type || "image/jpeg", upsert: false });
    if (uploadError) throw uploadError;
    const { data } = cloud.client.storage.from("recipe-photos").getPublicUrl(path);
    const url = data.publicUrl;
    recipe.imageUrls = [...(recipe.imageUrls || []), url];
    if (!recipe.imageUrl) recipe.imageUrl = url;
    saveRecipes();
    const { error: dbError } = await cloud.client.from("recipes")
      .update({ image_urls: recipe.imageUrls, image_url: recipe.imageUrl })
      .eq("id", recipe.id).eq("household_id", cloud.householdId);
    if (dbError) throw dbError;
    showToast("Photo added.");
    render();
  } catch (error) {
    console.error(error);
    showToast(`Couldn't add photo: ${error.message || "upload failed"}`);
  }
}

// Remove a photo from the recipe's gallery: drop it from the DB image arrays
// and, when the URL points at our own storage bucket, delete the underlying
// object too. Imported recipes reference external URLs (not our bucket) — those
// are just unlinked. The control is editable-gated, so visitors never see it.
async function deleteRecipePhoto(recipe, url) {
  if (!url) return;
  if (!cloud.connected || !cloud.client || !cloud.householdId) { showToast("Sign in to manage photos."); return; }
  if (!window.confirm("Delete this photo? This cannot be undone.")) return;
  showToast("Deleting photo…");
  try {
    recipe.imageUrls = (recipe.imageUrls || []).filter((item) => item !== url);
    if (recipe.imageUrl === url) recipe.imageUrl = recipe.imageUrls[0] || "";
    saveRecipes();
    const { error: dbError } = await cloud.client.from("recipes")
      .update({ image_urls: recipe.imageUrls, image_url: recipe.imageUrl || null })
      .eq("id", recipe.id).eq("household_id", cloud.householdId);
    if (dbError) throw dbError;
    // Best-effort: remove the stored file for URLs that live in our bucket.
    const marker = "/recipe-photos/";
    const at = url.indexOf(marker);
    if (at !== -1) {
      const path = decodeURIComponent(url.slice(at + marker.length).split("?")[0]);
      const { error: rmError } = await cloud.client.storage.from("recipe-photos").remove([path]);
      if (rmError) console.warn("Storage delete skipped:", rmError.message);
    }
    showToast("Photo deleted.");
    render();
  } catch (error) {
    console.error(error);
    showToast(`Couldn't delete photo: ${error.message || "delete failed"}`);
  }
}

// Share a recipe's permalink: native share sheet on mobile (AirDrop, Messages,
// etc.), copy-to-clipboard fallback on desktop / where Web Share is missing.
async function shareRecipeNative(recipe) {
  if (!recipe.slug) { showToast("This recipe doesn't have a link yet."); return; }
  const url = shareLinkFor(recipe);
  if (navigator.share) {
    try {
      await navigator.share({ title: recipe.title, text: recipe.title, url });
      return;
    } catch (error) {
      if (error && error.name === "AbortError") return; // user dismissed the sheet
      // otherwise fall through to copy
    }
  }
  const copied = await copyToClipboard(url);
  showToast(copied ? "Link copied to clipboard." : url);
}

// Toggle a recipe's visibility on the public homepage (owner only). is_hidden
// is a plain column update under the existing recipes RLS (household members).
async function setRecipeHidden(recipe, hidden) {
  if (!cloud.connected || !cloud.client || !cloud.householdId) { showToast("Sign in to change visibility."); return; }
  try {
    const { error } = await cloud.client.from("recipes")
      .update({ is_hidden: hidden })
      .eq("id", recipe.id)
      .eq("household_id", cloud.householdId);
    if (error) throw error;
    recipe.isHidden = hidden;
    showToast(hidden ? "Hidden from the public homepage." : "Now public.");
    render();
  } catch (error) {
    console.error(error);
    showToast(`Couldn't update visibility: ${error.message || "unknown error"}`);
  }
}

// --- Recently viewed + cook tracking ---------------------------------------
const RECENT_VIEWS_KEY = "kitchen-archive-recent-views";
function recentViews() {
  try { return JSON.parse(localStorage.getItem(RECENT_VIEWS_KEY) || "[]"); } catch { return []; }
}
function recordRecentView(recipe) {
  const entry = { id: recipe.id, slug: recipe.slug || null, title: recipe.title, ts: Date.now() };
  // Keep a deeper history than we show as chips so the "Recently viewed" sort
  // stays useful past the first few; renderRecentlyViewed trims to 5 for display.
  const list = [entry, ...recentViews().filter((item) => item.id !== recipe.id)].slice(0, 30);
  localStorage.setItem(RECENT_VIEWS_KEY, JSON.stringify(list));
}
function renderRecentlyViewed() {
  const section = $("#recently-viewed-section");
  const listEl = $("#recently-viewed-list");
  if (!section || !listEl) return;
  const items = recentViews().filter((entry) => state.recipes.some((recipe) => recipe.id === entry.id)).slice(0, 5);
  section.hidden = items.length === 0;
  listEl.innerHTML = items.map((entry) => `<button class="label-item recent-item" data-recent-id="${escAttr(entry.id)}">${esc(entry.title)}</button>`).join("");
  $$("[data-recent-id]", listEl).forEach((button) => button.addEventListener("click", () => showRecipe(button.dataset.recentId)));
}

function relativeDate(iso) {
  if (!iso) return "";
  const then = new Date(iso).getTime();
  if (!Number.isFinite(then)) return "";
  const days = Math.floor((Date.now() - then) / 86400000);
  if (days <= 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} wk ago`;
  if (days < 365) return `${Math.floor(days / 30)} mo ago`;
  return `${Math.floor(days / 365)} yr ago`;
}
function cookCountLabel(recipe) {
  const count = recipe.cookCount || 0;
  if (!count) return "Not cooked yet";
  const last = recipe.lastCookedAt ? ` · last ${relativeDate(recipe.lastCookedAt)}` : "";
  return `Made ${count}×${last}`;
}

// Log one cook via the log_cook RPC (owner only), bump the local count, re-render.
async function logCook(recipe) {
  if (!cloud.connected || !cloud.client) { showToast("Sign in to log a cook."); return; }
  try {
    const { data, error } = await cloud.client.rpc("log_cook", { target_recipe: recipe.id });
    if (error) throw error;
    recipe.cookCount = Number(data) || (recipe.cookCount || 0) + 1;
    recipe.lastCookedAt = new Date().toISOString();
    showToast(`Logged. Made ${recipe.cookCount}×.`);
    render();
  } catch (error) {
    console.error(error);
    showToast(`Couldn't log cook: ${error.message || "unknown error"}`);
  }
}

// Opening a recipe takes over the main column (no overlay); the sidebar stays.
// showRecipe sets the route and records a recent view; renderDetail builds the
// markup and wires it; render() decides list vs detail.
function showRecipe(id, { updateUrl = true } = {}) {
  const recipe = state.recipes.find((item) => item.id === id);
  if (!recipe) return;
  state.activeRecipe = recipe;
  state.mode = "detail";
  drawerScale = 1;
  recordRecentView(recipe);
  if (updateUrl && recipe.slug) syncDrawerUrl(recipe.slug);
  closeMenu();
  render();
  window.scrollTo({ top: 0 });
}

function showList() {
  state.mode = "list";
  state.activeRecipe = null;
  clearDrawerUrl();
  render();
}

// Other recipes sharing at least one tag, most-overlapping first.
function relatedRecipes(recipe, limit = 6) {
  const tags = new Set((recipe.tags || []).map((tag) => String(tag).toLowerCase()));
  if (!tags.size) return [];
  return state.recipes
    .filter((other) => other.id !== recipe.id)
    .map((other) => ({ recipe: other, shared: (other.tags || []).filter((tag) => tags.has(String(tag).toLowerCase())).length }))
    .filter((entry) => entry.shared > 0)
    .sort((a, b) => b.shared - a.shared)
    .slice(0, limit)
    .map((entry) => entry.recipe);
}

function renderDetail(recipe) {
  const editable = canEditRecipe(recipe);
  const ratings = recipe.ratings || [];
  const reviewers = [...new Set([
    ...localReviewers,
    ...cloud.members.map((member) => member.display_name),
    ...ratings.map((rating) => rating.member)
  ])].filter((member) => !hiddenReviewers.has(String(member).trim().toLowerCase()));

  // Ingredients + method region. A single untitled section renders as the
  // classic Ingredients/Method layout; titled or multiple sections stack as
  // per-component blocks. The scale panel appears once and drives every
  // section's ingredient list through the same global factor. The ingredient
  // <ul>s are filled by applyDrawerScaling (keyed by data-section); the method
  // lists are static (instructions don't scale).
  const sections = getSections(recipe);
  const scalePanelHtml = `
    <div class="scale-panel">
      <div class="scale-controls" id="scale-controls">
        <span class="scale-eyebrow">Scale recipe</span>
        <div class="scale-buttons">
          <button type="button" class="scale-button" data-scale="0.5">0.5×</button>
          <button type="button" class="scale-button" data-scale="1">1×</button>
          <button type="button" class="scale-button" data-scale="2">2×</button>
        </div>
        <button type="button" class="ghost-button scale-reset" id="scale-reset">Reset</button>
      </div>
      <p class="scale-summary">Makes <input class="scale-servings" id="scale-servings" type="text" inputmode="decimal" aria-label="Target servings" /> servings<span class="scale-factor" id="scale-factor"></span></p>
      <p class="scale-hint">Tip: set the servings, or type any ingredient's quantity — the rest scale to match.</p>
    </div>`;
  const methodListHtml = (section) => `<ol class="instruction-list">${section.instructions.map((step) => `<li>${esc(step)}</li>`).join("")}</ol>`;
  const ingredientsMethodHtml = isSectionedRecipe(sections)
    ? `
    <hr class="drawer-rule" />
    <h3 class="drawer-section-title">Ingredients &amp; method</h3>
    ${scalePanelHtml}
    ${sections.map((section, index) => `
    <div class="recipe-section">
      ${section.title ? `<h4 class="recipe-section-title">${esc(section.title)}</h4>` : ""}
      ${section.ingredients.length ? `<p class="recipe-section-label">Ingredients</p>
      <ul class="ingredient-list scaled-ingredient-list" data-section="${index}"></ul>` : ""}
      ${section.instructions.length ? `<p class="recipe-section-label">Method</p>
      ${methodListHtml(section)}` : ""}
    </div>`).join("")}`
    : `
    <hr class="drawer-rule" />
    <h3 class="drawer-section-title">Ingredients</h3>
    ${scalePanelHtml}
    <ul class="ingredient-list scaled-ingredient-list" id="ingredient-list" data-section="0"></ul>
    <h3 class="drawer-section-title">Method</h3>
    ${methodListHtml(sections[0])}`;

  // Family ratings and variants are household-private: the public_recipes view
  // never exposes them, so foreign (shared-link) recipes hide the whole block.
  // The rating form and add-variant button additionally require edit rights.
  const ratingFormHtml = editable ? `
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
    </form>` : "";
  const variantAddHtml = editable
    ? `<button class="ghost-button" style="margin-top:14px" id="add-variant-button">＋ Add a variant</button>`
    : "";
  const householdExtrasHtml = recipe.foreign ? "" : `
    <hr class="drawer-rule" />
    <h3 class="drawer-section-title">Family ratings · ★ ${averageRating(recipe).toFixed(1)} overall</h3>
    <div class="family-rating">${ratings.map((rating) => `
      <div class="member-rating"><span class="member-name">${esc(rating.member)}</span><span class="stars">${ratingStars(rating.score)}</span><span class="member-score">${(Number(rating.score) || 0).toFixed(1)}</span></div>`).join("")}</div>
    ${ratingFormHtml}
    <hr class="drawer-rule" />
    <h3 class="drawer-section-title">Your versions</h3>
    ${recipe.variants.map((variant) => `<div class="variant-card"><strong>${esc(variant.name)}</strong><p>${esc(variant.note)}</p></div>`).join("")}
    ${variantAddHtml}`;

  const relatedList = relatedRecipes(recipe);
  const relatedHtml = relatedList.length ? `
    <section class="related-strip">
      <h3 class="drawer-section-title">More like this</h3>
      <div class="related-grid">
        ${relatedList.map((other) => `
          <button type="button" class="related-card" data-related-id="${escAttr(other.id)}">
            ${recipeImageUrls(other).length ? `<img src="${escAttr(recipeImageUrls(other).at(-1))}" alt="${escAttr(other.title)}" loading="lazy" decoding="async" />` : `<span class="related-card__ph">${esc(other.title.split(" ").slice(0, 2).join(" "))}</span>`}
            <span class="related-card__title">${esc(other.title)}</span>
          </button>`).join("")}
      </div>
    </section>` : "";

  $("#detail-view").innerHTML = `
    <nav class="breadcrumb"><button type="button" class="breadcrumb-link" id="breadcrumb-home">All recipes</button> <span class="breadcrumb-sep">›</span> <span class="breadcrumb-current">${esc(recipe.title)}</span></nav>
    <article class="recipe-detail">
    <p class="eyebrow">Recipe archive · ${esc(recipe.source || "Personal recipe")}</p>
    <h2 class="drawer-title" id="drawer-title">${esc(recipe.title)}</h2>
    <p class="drawer-description">${esc(recipe.description)}</p>
    <div class="drawer-actions">
      ${recipe.slug ? `<button class="primary-button" id="share-recipe-button"><svg class="icon"><use href="#i-share"/></svg> Share</button>` : ""}
      ${editable ? `
      <button class="ghost-button" id="edit-recipe-button">Edit recipe</button>
      <button class="danger-button" id="delete-recipe-button">Delete</button>
      <button class="ghost-button" id="hide-toggle-button">${recipe.isHidden ? "Make public" : "Hide from public"}</button>
      ` : ""}
    </div>
    ${editable
      ? `<p class="share-hint">${recipe.isHidden ? "Hidden · only you can see this" : "Public · anyone with the link can view"}</p>`
      : `<p class="share-hint">Viewing a shared recipe (read-only).</p>`}
    <div class="cook-tracker">
      ${editable ? `<button type="button" class="primary-button cook-button" id="made-this-button">✓ Made this</button>` : ""}
      ${editable ? `<button type="button" class="ghost-button" id="add-to-plan-button">＋ Add to this week</button>` : ""}
      <span class="cook-count" id="cook-count-label">${cookCountLabel(recipe)}</span>
    </div>
    ${recipeImageUrls(recipe).length ? `
      <div class="drawer-image-gallery">
        ${recipeImageUrls(recipe).map((imageUrl, index) => `<figure class="gallery-item">
          <img src="${escAttr(imageUrl)}" alt="${escAttr(recipe.title)} photo ${index + 1}" loading="lazy" decoding="async" />
          ${editable ? `<button type="button" class="photo-delete" data-photo-url="${escAttr(imageUrl)}" aria-label="Delete photo ${index + 1}" title="Delete photo">×</button>` : ""}
        </figure>`).join("")}
      </div>
    ` : ""}
    ${editable ? `
    <div class="add-photo">
      <button type="button" class="ghost-button" id="add-photo-button"><svg class="icon"><use href="#i-camera"/></svg> Add photo</button>
      <input type="file" id="photo-input" accept="image/*" hidden />
    </div>` : ""}
    <div class="drawer-tags">${recipe.tags.map((tag) => `<span class="drawer-tag">${esc(tag)}</span>`).join("")}</div>
    <div class="card-meta"><span><svg class="icon"><use href="#i-clock"/></svg> ${esc(formatTimeLabel(recipe.time))}</span><span>${esc(recipe.servings)} servings</span>${recipe.foreign ? "" : `<span>★ ${averageRating(recipe).toFixed(1)} household</span>`}</div>
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
    ${ingredientsMethodHtml}
    ${householdExtrasHtml}
    </article>
    ${relatedHtml}`;
  $("#breadcrumb-home").addEventListener("click", showList);
  $$("#detail-view [data-related-id]").forEach((el) => el.addEventListener("click", () => showRecipe(el.dataset.relatedId)));
  $("#made-this-button")?.addEventListener("click", () => logCook(recipe));
  $("#add-to-plan-button")?.addEventListener("click", () => {
    if (state.plannedMeals.some((m) => m.recipeId === recipe.id && !m.made)) { showToast("Already on this week's plan."); return; }
    runPlanAction(async () => {
      await addPlannedMeal(recipe.id);
      showToast("Added to this week.");
    });
  });
  $("#add-photo-button")?.addEventListener("click", () => $("#photo-input")?.click());
  $("#photo-input")?.addEventListener("change", (event) => {
    const file = event.target.files && event.target.files[0];
    if (file) uploadRecipePhoto(recipe, file);
  });
  $$("#detail-view .photo-delete").forEach((button) => {
    button.addEventListener("click", () => deleteRecipePhoto(recipe, button.dataset.photoUrl));
  });
  $$("#scale-controls .scale-button").forEach((button) => {
    button.addEventListener("click", () => { drawerScale = Number(button.dataset.scale); applyDrawerScaling(); });
  });
  $("#scale-reset").addEventListener("click", () => { drawerScale = 1; applyDrawerScaling(); });
  const servingsInput = $("#scale-servings");
  if (servingsInput) servingsInput.addEventListener("change", onServingsChange);
  applyDrawerScaling();
  // Edit/delete/share controls only render for recipes the viewer owns.
  $("#edit-recipe-button")?.addEventListener("click", () => openEditModal(recipe));
  $("#delete-recipe-button")?.addEventListener("click", () => deleteRecipe(recipe));
  $("#share-recipe-button")?.addEventListener("click", () => shareRecipeNative(recipe));
  $("#hide-toggle-button")?.addEventListener("click", () => setRecipeHidden(recipe, !recipe.isHidden));
  $("#estimate-nutrition-button")?.addEventListener("click", () => estimateNutrition(recipe));

  // Rating stars + form exist only when editable; skip wiring otherwise.
  const ratingStarsControl = $("#rating-stars");
  if (ratingStarsControl) {
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
    });
  }
  $("#add-variant-button")?.addEventListener("click", () => showToast("Variant editing is next on the build list."));
}

// Reflect the open recipe in the URL as ?recipe=<slug> (public recipes only).
// pushState on open lets browser Back close the drawer; replaceState on close
// drops the param without stacking an extra history entry.
function syncDrawerUrl(slug) {
  const url = new URL(window.location.href);
  if (url.searchParams.get("recipe") === slug) return;
  url.searchParams.set("recipe", slug);
  window.history.pushState({ recipe: slug }, "", url);
}

function clearDrawerUrl() {
  const url = new URL(window.location.href);
  if (!url.searchParams.has("recipe")) return;
  url.searchParams.delete("recipe");
  window.history.replaceState({}, "", url);
}

// Browser back/forward: reconcile the drawer with the ?recipe=<slug> in the URL.
window.addEventListener("popstate", async () => {
  const slug = new URLSearchParams(window.location.search).get("recipe");
  if (!slug) {
    state.mode = "list";
    state.activeRecipe = null;
    render();
    return;
  }
  let recipe = state.recipes.find((item) => item.slug === slug);
  if (!recipe) {
    recipe = await fetchPublicRecipeBySlug(slug);
    if (recipe) state.recipes = [recipe, ...state.recipes.filter((item) => item.id !== recipe.id)];
  }
  if (recipe) showRecipe(recipe.id, { updateUrl: false });
});

// --- Section editor (manual form + import review) ---------------------------
// Both forms edit ingredients/method through a [data-section-editor] container
// holding one card per section (title + ingredients textarea + method
// textarea), plus add/remove controls. One untitled card is the simple recipe;
// extra cards are the pastry-school components. Read back into a sections array
// on submit.

function sectionEditorCardHtml(section) {
  const lines = (list) => (Array.isArray(list) ? list : []).join("\n");
  return `
    <div class="section-editor-card" data-section-card>
      <div class="section-editor-head">
        <input class="section-editor-title" data-section-title placeholder="Section name (optional, e.g. Pie pastry)" value="${escAttr(section?.title || "")}" />
        <button type="button" class="ghost-button section-editor-remove" data-section-remove aria-label="Remove section">Remove</button>
      </div>
      <label>Ingredients
        <textarea class="section-editor-ingredients" data-section-ingredients rows="4" placeholder="150 g flour&#10;6 g salt">${esc(lines(section?.ingredients))}</textarea>
      </label>
      <label>Method
        <textarea class="section-editor-instructions" data-section-instructions rows="4" placeholder="Rub the butter into the flour...&#10;Chill for 30 minutes...">${esc(lines(section?.instructions))}</textarea>
      </label>
    </div>`;
}

// Read the editor's current DOM state into a raw sections array (empty sections
// are dropped later by normalizeSections).
function readSectionEditor(container) {
  const splitLines = (value) => String(value || "").split("\n").map((line) => line.trim()).filter(Boolean);
  return $$("[data-section-card]", container).map((card) => ({
    title: $("[data-section-title]", card).value.trim(),
    ingredients: splitLines($("[data-section-ingredients]", card).value),
    instructions: splitLines($("[data-section-instructions]", card).value)
  }));
}

// Render the section cards (always at least one). Remove buttons are hidden when
// a single section remains, since every recipe needs one.
function renderSectionEditor(container, sections) {
  const cards = $(".section-editor-cards", container);
  const list = (Array.isArray(sections) && sections.length) ? sections : [{ title: "", ingredients: [], instructions: [] }];
  cards.innerHTML = list.map(sectionEditorCardHtml).join("");
  const removeButtons = $$("[data-section-remove]", container);
  removeButtons.forEach((button) => {
    button.hidden = removeButtons.length <= 1;
    button.addEventListener("click", () => {
      const current = readSectionEditor(container);
      current.splice([...cards.children].indexOf(button.closest("[data-section-card]")), 1);
      renderSectionEditor(container, current);
    });
  });
}

// Render the editor and wire the "Add section" button once (guarded so repeated
// opens don't stack listeners).
function setupSectionEditor(container, sections) {
  renderSectionEditor(container, sections);
  const addButton = $(".section-editor-add", container);
  if (addButton && !addButton.dataset.wired) {
    addButton.dataset.wired = "1";
    addButton.addEventListener("click", () => {
      renderSectionEditor(container, [...readSectionEditor(container), { title: "", ingredients: [], instructions: [] }]);
    });
  }
}

function openModal() {
  state.editingRecipeId = null;
  $("#modal-eyebrow").textContent = "Add to the archive";
  $("#modal-title").textContent = "New recipe";
  setupSectionEditor($("#recipe-section-editor"), null);
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
  setupSectionEditor($("#recipe-section-editor"), getSections(recipe));
  const photoRow = $("#modal-photo-row");
  if (photoRow) photoRow.hidden = false;
  $("#recipe-modal").hidden = false;
  setTimeout(() => form.title.focus(), 0);
}

function closeModal() {
  $("#recipe-modal").hidden = true;
  $("#recipe-form").reset();
  state.editingRecipeId = null;
  $("#modal-eyebrow").textContent = "Add to the archive";
  $("#modal-title").textContent = "New recipe";
  const photoRow = $("#modal-photo-row");
  if (photoRow) photoRow.hidden = true;
}

async function deleteRecipe(recipe) {
  if (!window.confirm(`Delete “${recipe.title}”? This cannot be undone.`)) return;
  try {
    await deleteRecipeFromCloud(recipe);
    state.recipes = state.recipes.filter((item) => item.id !== recipe.id);
    saveRecipes();
    showList();
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
    setupSectionEditor($("#import-section-editor"), getSections(draft));
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
// Results filter live, so the mobile keyboard's Search key just dismisses the
// keyboard to reveal them (blur). enterkeyhint="search" labels that key.
$("#search-input").addEventListener("keydown", (event) => { if (event.key === "Enter") { event.preventDefault(); event.target.blur(); } });
$("#sort-select").addEventListener("change", (event) => { state.sort = event.target.value; renderRecipes(); });
$("#min-rating-select")?.addEventListener("change", (event) => { state.minRating = Number(event.target.value) || 0; renderRecipes(); });
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
  if (state.activeRecipe?.id === recipe.id) render();
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
  if (event.key === "Escape") { closeModal(); closeImportModal(); closeAuthModal(); closeLabelManager(); $("#filter-popover").hidden = true; }
});
$$(".nav-item").forEach((item) => item.addEventListener("click", () => { state.view = item.dataset.view; state.mode = "list"; state.activeRecipe = null; clearDrawerUrl(); closeMenu(); render(); }));
$$("#plan-toggle .plan-toggle-btn").forEach((btn) => btn.addEventListener("click", () => {
  state.planPane = btn.dataset.pane;
  $$("#plan-toggle .plan-toggle-btn").forEach((b) => b.classList.toggle("is-active", b === btn));
  $("#plan-pane").hidden = state.planPane !== "plan";
  $("#grocery-pane").hidden = state.planPane !== "groceries";
}));
$("#clear-made-button")?.addEventListener("click", () => { if (confirm("Clear all meals marked made?")) runPlanAction(async () => { await clearMadeMeals(); renderPlan(); }); });
$("#start-new-week-button")?.addEventListener("click", () => { if (confirm("Start a new week? This clears made meals and checked-off grocery items.")) runPlanAction(async () => { await startNewWeek(); renderPlan(); renderGroceries(); }); });
$("#add-meal-button")?.addEventListener("click", openAddMealModal);
$("#add-meal-close")?.addEventListener("click", closeAddMealModal);
$("#add-meal-modal")?.addEventListener("click", (e) => { if (e.target.id === "add-meal-modal") closeAddMealModal(); });
$("#add-meal-search")?.addEventListener("input", (e) => renderAddMealResults(e.target.value));
$("#add-meal-confirm")?.addEventListener("click", () => runPlanAction(async () => {
  for (const id of addMealSelection) await addPlannedMeal(id);
  closeAddMealModal();
  renderPlan();
  showToast(`Added ${addMealSelection.size} to this week.`);
}));
$("#generate-grocery-button")?.addEventListener("click", openGenerateModal);
$("#generate-grocery-close")?.addEventListener("click", closeGenerateModal);
$("#generate-grocery-modal")?.addEventListener("click", (e) => { if (e.target.id === "generate-grocery-modal") closeGenerateModal(); });
$("#generate-grocery-confirm")?.addEventListener("click", () => runPlanAction(confirmGenerateGrocery));
$("#add-grocery-button")?.addEventListener("click", () => {
  const label = prompt("Add an item to the grocery list:");
  if (label && label.trim()) runPlanAction(async () => { await addGroceryItem(label); renderGroceries(); });
});
$("#clear-got-button")?.addEventListener("click", () => runPlanAction(async () => { await clearGrocery((g) => g.status === "got"); renderGroceries(); }));
$("#clear-all-grocery-button")?.addEventListener("click", () => { if (confirm("Clear the whole grocery list?")) runPlanAction(async () => { await clearGrocery(() => true); renderGroceries(); }); });
$("#staples-button")?.addEventListener("click", openStaples);
$("#staples-close")?.addEventListener("click", closeStaples);
$("#staples-done")?.addEventListener("click", closeStaples);
$("#staples-modal")?.addEventListener("click", (e) => { if (e.target.id === "staples-modal") closeStaples(); });
$("#staples-add")?.addEventListener("click", () => { const v = $("#staples-input").value; if (v.trim()) runPlanAction(async () => { await addStaple(v); $("#staples-input").value = ""; renderStaples(); }); });
$("#staples-input")?.addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); $("#staples-add").click(); } });
$("#recipe-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(event.target);
  const title = data.get("title").trim();
  const tags = (data.get("tags") || "").split(",").map((tag) => tag.trim()).filter(Boolean);
  const sections = readSectionEditor($("#recipe-section-editor"));
  if (state.editingRecipeId) {
    const recipe = state.recipes.find((item) => item.id === state.editingRecipeId);
    if (!recipe) return;
    Object.assign(recipe, {
      title,
      description: data.get("description") || "",
      time: Number.parseInt(data.get("time"), 10) || 30,
      servings: Number.parseInt(data.get("servings"), 10) || 4,
      tags: tags.length ? tags : ["new"]
    });
    applyRecipeSections(recipe, sections);
    ensureInstructions(recipe);
    closeModal();
    // Persist locally and refresh the UI first so the edit survives even if the
    // cloud write fails (otherwise it lived only in memory and reverted on
    // reload). Then attempt the cloud sync and report only its outcome.
    saveRecipes();
    showRecipe(recipe.id, { updateUrl: false });
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
    variants: [],
    ratings: [],
    source: "Added manually"
  };
  applyRecipeSections(recipe, sections);
  ensureInstructions(recipe);
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
    variants: [],
    ratings: [],
    source: "Distilled import · review required",
    sourceUrl: state.activeImportDraft?.sourceUrl || ""
  };
  applyRecipeSections(recipe, readSectionEditor($("#import-section-editor")));
  closeImportModal();
  state.activeImportDraft = null;
  const addToPlan = data.get("addToPlan") === "on";
  // persistNewRecipe merges onto an existing duplicate (matched by source URL
  // or title) rather than saving `recipe` itself, in which case `recipe.id`
  // stays the client-side placeholder, never a real (UUID) row id. Resolve the
  // duplicate BEFORE persisting so `saved` points at the actual saved row
  // either way: the pre-existing duplicate, or `recipe` itself when there is
  // no duplicate (its `.id` is a real UUID once saveRecipeToCloud resolves).
  const saved = findDuplicateRecipe(recipe) || recipe;
  persistNewRecipe(recipe).then(async () => {
    if (addToPlan && saved.id) { await addPlannedMeal(saved.id); showToast("Saved and added to this week."); }
  }).catch((e) => { console.error(e); showToast("Saved, but could not add to this week."); });
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

// Passwordless sign-in: email a 6-digit code, then verify it. Easier than
// typing a long password (and works cross-device without a redirect).
$("#auth-otp-button")?.addEventListener("click", async () => {
  if (!cloud.client) { showAuthError("Supabase is not configured in this browser."); return; }
  const email = $("#auth-form [name=email]").value.trim();
  if (!email) { showAuthError("Enter your email first."); return; }
  const button = $("#auth-otp-button");
  button.disabled = true;
  $("#auth-error").hidden = true;
  try {
    const { error } = await cloud.client.auth.signInWithOtp({ email, options: { shouldCreateUser: false } });
    if (error) throw error;
    $("#otp-fields").hidden = false;
    button.textContent = "Resend code";
    showToast("Sign-in code emailed. Enter it below.");
    setTimeout(() => $("#otp-input")?.focus(), 0);
  } catch (error) {
    showAuthError(error.message || "Couldn't send a code.");
  } finally {
    button.disabled = false;
  }
});
$("#otp-verify-button")?.addEventListener("click", async () => {
  if (!cloud.client) return;
  const email = $("#auth-form [name=email]").value.trim();
  const token = $("#otp-input").value.trim();
  if (!token) { showAuthError("Enter the 6-digit code."); return; }
  const button = $("#otp-verify-button");
  button.disabled = true;
  $("#auth-error").hidden = true;
  try {
    const { error } = await cloud.client.auth.verifyOtp({ email, token, type: "email" });
    if (error) throw error;
    closeAuthModal();
    showToast("Signed in.");
  } catch (error) {
    showAuthError(error.message || "Invalid or expired code.");
  } finally {
    button.disabled = false;
  }
});

// Mobile side-menu (hamburger). Off-canvas sidebar + scrim on small screens.
function closeMenu() {
  document.body.classList.remove("menu-open");
  const scrim = $("#menu-scrim");
  if (scrim) scrim.hidden = true;
}
$("#menu-toggle")?.addEventListener("click", () => {
  const open = !document.body.classList.contains("menu-open");
  document.body.classList.toggle("menu-open", open);
  const scrim = $("#menu-scrim");
  if (scrim) scrim.hidden = !open;
});
$("#menu-scrim")?.addEventListener("click", closeMenu);
$("#modal-add-photo")?.addEventListener("click", () => $("#modal-photo-input")?.click());
$("#modal-photo-input")?.addEventListener("change", (event) => {
  const file = event.target.files && event.target.files[0];
  const recipe = state.recipes.find((item) => item.id === state.editingRecipeId);
  if (file && recipe) uploadRecipePhoto(recipe, file);
});

// Testing aid: clear the app's local caches (public snapshot, cached recipes,
// recent views) + any service-worker caches, then hard-reload past the HTTP
// cache with a busting query. Keeps the auth session and manual ratings.
$("#reset-cache")?.addEventListener("click", async () => {
  try {
    ["kitchen-archive-public", "kitchen-archive-recipes", "kitchen-archive-recent-views", "kitchen-archive-last-import-debug"]
      .forEach((key) => localStorage.removeItem(key));
    if (window.caches) {
      const keys = await caches.keys();
      await Promise.all(keys.map((k) => caches.delete(k)));
    }
    if (navigator.serviceWorker) {
      const regs = await navigator.serviceWorker.getRegistrations();
      await Promise.all(regs.map((r) => r.unregister()));
    }
  } catch (error) {
    console.warn("Reset cache:", error);
  }
  location.replace(location.pathname + "?fresh=" + Date.now());
});

// Register the service worker (network-first: fresh after every deploy, offline
// fallback). Harmless if unsupported.
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => navigator.serviceWorker.register("sw.js").catch(() => {}));
}

// If the cloud is configured, hold the first paint in a loading state until the
// public/household library resolves, so seed recipes don't flash then reload.
state.booting = Boolean(window.KITCHEN_ARCHIVE_SUPABASE?.url && window.KITCHEN_ARCHIVE_SUPABASE?.anonKey);
render();
initSupabase();
