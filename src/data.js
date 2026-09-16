// data.js — Supabase load/save/sync, ratings, cook counts, storage upload,
// public library + cache/snapshot, auth session + modal, init. (loads after helpers.js)
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
  // Sections take precedence when present; otherwise the flat columns become a
  // single untitled section on read (via getSections). When sections do exist,
  // derive the flat arrays from them so search/nutrition see every component.
  const sections = normalizeSections(row.sections);
  const flatIngredients = sections
    ? flatIngredientsFromSections(sections)
    : (Array.isArray(row.ingredients) ? row.ingredients.map(formatIngredient) : []);
  const flatInstructions = sections
    ? flatInstructionsFromSections(sections)
    : (Array.isArray(row.instructions) ? row.instructions.map(formatInstruction) : []);
  return {
    id: row.id,
    title: row.title,
    description: row.description || "",
    time: formatTime(row.time_minutes || 0),
    servings: row.servings || 4,
    // Household rows come from select("*") without a `tags` key (filled later by
    // the recipe_tags join); public_recipes view rows arrive with tags inline.
    tags: Array.isArray(row.tags) ? row.tags : [],
    slug: row.slug || null,
    isPublic: Boolean(row.is_public),
    isHidden: Boolean(row.is_hidden),
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
    sections: sections || undefined,
    ingredients: flatIngredients,
    ingredientRecords: flatIngredients.map(toIngredientRecord),
    instructions: flatInstructions,
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
    // Cook counts + last-cooked, aggregated client-side from cook_log rows.
    const { data: cooks, error: cookError } = await cloud.client
      .from("cook_log")
      .select("recipe_id, cooked_at")
      .in("recipe_id", recipeIds);
    if (cookError) {
      console.warn("Cook log load skipped:", cookError.message);
    } else {
      const countByRecipe = new Map();
      const lastByRecipe = new Map();
      (cooks || []).forEach((row) => {
        countByRecipe.set(row.recipe_id, (countByRecipe.get(row.recipe_id) || 0) + 1);
        const prev = lastByRecipe.get(row.recipe_id);
        if (!prev || new Date(row.cooked_at) > new Date(prev)) lastByRecipe.set(row.recipe_id, row.cooked_at);
      });
      state.recipes.forEach((recipe) => {
        recipe.cookCount = countByRecipe.get(recipe.id) || 0;
        recipe.lastCookedAt = lastByRecipe.get(recipe.id) || null;
      });
    }
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
    // Backfill ratings that only ever lived in localStorage (entered offline or
    // signed-out) so they persist to the cloud instead of being stranded. Once
    // uploaded, drop the local copy so it isn't re-sent on the next load.
    for (const recipe of state.recipes) {
      const cloudMembers = new Set((ratingsByRecipe.get(recipe.id) || []).map((rating) => rating.member));
      const localOnly = (savedRatings[normalizeRecipeTitle(recipe.title)] || []).filter((rating) => !cloudMembers.has(rating.member));
      for (const rating of localOnly) {
        try {
          await saveRatingToCloud(recipe, rating);
          removeManualRating(recipe, rating.member);
        } catch (backfillError) {
          console.warn("Rating backfill skipped:", backfillError.message);
        }
      }
    }
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
  state.booting = false;
  render();
  await openInitialSharedRecipe();
}

// --- Public sharing / permalinks --------------------------------------------
// A signed-out visitor (or a signed-in user opening someone else's shared link)
// reads the `public_recipes` view: only recipes an owner has opted into, with a
// safe column subset. Rows are marked `foreign` so the UI renders them
// read-only (no edit/delete/share/rating controls).

// True whenever no one is signed in on this device. Drives read-only UI.
function isReadOnly() {
  return !cloud.session;
}

// A recipe is editable only if the signed-in user owns it (loaded from their
// household). Public rows opened by slug are flagged `foreign` and stay locked.
function canEditRecipe(recipe) {
  return Boolean(cloud.session) && !recipe?.foreign;
}

function mapPublicRow(row) {
  const recipe = recipeFromRow(row);
  recipe.foreign = true;
  recipe.isPublic = true;
  recipe.tags = Array.isArray(row.tags) ? row.tags : [];
  recipe.cookCount = Number(row.cook_count) || 0;
  recipe.lastCookedAt = row.last_cooked_at || null;
  return recipe;
}

// Fetch every public recipe for the browse gallery a signed-out visitor sees.
async function loadPublicRecipes() {
  if (!cloud.client) return [];
  const { data, error } = await cloud.client
    .from("public_recipes")
    .select("*")
    .order("updated_at", { ascending: false });
  if (error) {
    console.warn("Public recipes load failed:", error.message);
    return [];
  }
  return (data || []).map(mapPublicRow);
}

async function fetchPublicRecipeBySlug(slug) {
  if (!cloud.client || !slug) return null;
  const { data, error } = await cloud.client
    .from("public_recipes")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (error || !data) return null;
  return mapPublicRow(data);
}

// Cache the public library in localStorage for instant repeat loads
// (stale-while-revalidate): paint the cached list immediately, then refresh
// from Supabase in the background. Sidesteps the free-tier cold-start wait.
const PUBLIC_CACHE_KEY = "kitchen-archive-public";
function loadCachedPublic() {
  try {
    const value = JSON.parse(localStorage.getItem(PUBLIC_CACHE_KEY) || "null");
    return Array.isArray(value) ? value : null;
  } catch { return null; }
}
function saveCachedPublic(list) {
  try { localStorage.setItem(PUBLIC_CACHE_KEY, JSON.stringify(list)); } catch { /* quota */ }
}

// A static snapshot of the public library committed to the repo and served by
// the Pages CDN — instant first paint on a device with no localStorage cache
// (e.g. a friend opening a shared link cold), sidestepping the Supabase
// cold-start. Always superseded by the live fetch below. Regenerate with:
//   curl "<supabase>/rest/v1/public_recipes?select=*&order=updated_at.desc" \
//     -H "apikey: <anon>" -o public-recipes.json
async function loadSnapshot() {
  try {
    const res = await fetch("public-recipes.json");
    if (!res.ok) return null;
    const rows = await res.json();
    return Array.isArray(rows) ? rows.map(mapPublicRow) : null;
  } catch { return null; }
}

// Signed-out landing: show the public gallery (falling back to the seed recipes
// if nothing is shared yet or the fetch fails), then open a deep-linked recipe.
async function enterPublicMode() {
  cloud.connected = false;
  cloud.householdId = null;
  cloud.memberId = null;
  cloud.members = [];
  // 1. Instant paint: localStorage cache first, else the CDN snapshot.
  let early = loadCachedPublic();
  if (!(early && early.length)) {
    const snap = await loadSnapshot();
    if (snap && snap.length) early = snap;
  }
  if (early && early.length) {
    state.recipes = early;
    state.booting = false;
    render();
    await openInitialSharedRecipe();
  }
  // 2. Revalidate from Supabase and update in place.
  const publicRecipes = await loadPublicRecipes();
  if (publicRecipes.length) {
    state.recipes = publicRecipes;
    saveCachedPublic(publicRecipes);
  } else if (!(early && early.length)) {
    state.recipes = starterRecipes.map((recipe) => ({ ...recipe }));
  }
  saveRecipes();
  state.booting = false;
  render();
  if (!(early && early.length)) await openInitialSharedRecipe();
}

// Open the ?recipe=<slug> target on load. Resolves from the already-loaded set
// first (own or public), otherwise fetches the single public row by slug.
async function openInitialSharedRecipe() {
  if (!initialRecipeSlug) return;
  let recipe = state.recipes.find((item) => item.slug === initialRecipeSlug);
  if (!recipe) {
    recipe = await fetchPublicRecipeBySlug(initialRecipeSlug);
    if (recipe) {
      state.recipes = [recipe, ...state.recipes.filter((item) => item.id !== recipe.id)];
      render();
    }
  }
  if (recipe) showRecipe(recipe.id, { updateUrl: false });
  else showToast("That shared recipe isn't available.");
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
    sections: recipe.sections || [],
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
    sections: recipe.sections || [],
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
  const otpFields = $("#otp-fields");
  if (otpFields) otpFields.hidden = true;
  const otpInput = $("#otp-input");
  if (otpInput) otpInput.value = "";
  const otpButton = $("#auth-otp-button");
  if (otpButton) otpButton.textContent = "Email me a sign-in code";
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
    showRecipe(duplicate.id);
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
  showRecipe(recipe.id);
}

async function initSupabase() {
  updateAuthButton();
  if (!window.supabase || !window.KITCHEN_ARCHIVE_SUPABASE?.url || !window.KITCHEN_ARCHIVE_SUPABASE?.anonKey) {
    // No cloud configured: fall back to the seed recipes already in state.
    state.booting = false;
    render();
    return;
  }
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
        state.booting = false;
        render();
        showToast(`Recipes couldn't be loaded: ${error.message || "unknown error"}`);
      }
    } else {
      // Signed out (or initial no-session load): drop any household-private data
      // and show the public gallery. enterPublicMode falls back to the seed
      // recipes when nothing is shared, and opens a ?recipe=<slug> deep link.
      try {
        await enterPublicMode();
      } catch (error) {
        console.error(error);
        state.recipes = starterRecipes.map((recipe) => ({ ...recipe }));
        saveRecipes();
        render();
      }
    }
  });
  const { data, error } = await cloud.client.auth.getSession();
  if (error) {
    console.error(error);
    state.booting = false;
    render();
    return;
  }
  cloud.session = data.session;
  updateAuthButton();
  if (cloud.session) {
    try { await loadCloudRecipes(); } catch (loadError) { console.error(loadError); state.booting = false; render(); }
  }
}

