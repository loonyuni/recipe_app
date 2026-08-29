const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS"
};

type Nutrition = {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
};

type RecipeDraft = {
  title: string;
  description: string;
  servings: number;
  time: string;
  ingredients: string[];
  instructions: string[];
  tags: string[];
  imageUrl?: string;
  measurementMode?: "both" | "original" | "metric";
  nutrition?: Nutrition;
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" }
  });
}

function stripHtml(html: string) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<[^>]+>/g, "\n")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, "\"")
    .replace(/\s+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function isoDurationToText(value: unknown) {
  if (typeof value !== "string") return "";
  const match = value.match(/P(?:([0-9]+)D)?T?(?:([0-9]+)H)?(?:([0-9]+)M)?/i);
  if (!match) return value;
  const parts = [];
  if (match[1]) parts.push(`${match[1]} day${match[1] === "1" ? "" : "s"}`);
  if (match[2]) parts.push(`${match[2]} hr`);
  if (match[3]) parts.push(`${match[3]} min`);
  return parts.join(" ") || value;
}

function imageValueToUrl(value: unknown): string {
  if (typeof value === "string") return value;
  if (!value || typeof value !== "object") return "";
  const item = value as Record<string, unknown>;
  return String(item.url || item.contentUrl || item["@id"] || "");
}

function findRecipeJsonLd(html: string) {
  const scripts = [...html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
  for (const match of scripts) {
    try {
      const parsed = JSON.parse(match[1].trim());
      const candidates = Array.isArray(parsed) ? parsed : [parsed, ...(parsed?.["@graph"] || [])];
      const recipe = candidates.find((item) => {
        const type = item?.["@type"];
        return type === "Recipe" || (Array.isArray(type) && type.includes("Recipe"));
      });
      if (recipe) return recipe;
    } catch {
      // Some publishers include invalid JSON-LD blocks; continue to the next one.
    }
  }
  return null;
}

// Pull the leading number out of schema.org nutrition strings such as
// "610 calories" or "35 g"; returns 0 when absent or unparseable.
function nutritionNumber(value: unknown): number {
  const match = String(value ?? "").match(/[\d.]+/);
  const parsed = match ? Number(match[0]) : 0;
  return Number.isFinite(parsed) ? Math.round(parsed) : 0;
}

// schema.org NutritionInformation is per single serving; map it onto our
// flat nutrition shape. Returns null when no usable values are present.
function structuredNutrition(recipe: Record<string, unknown>): Nutrition | null {
  const info = recipe.nutrition as Record<string, unknown> | undefined;
  if (!info || typeof info !== "object") return null;
  const nutrition = {
    calories: nutritionNumber(info.calories),
    protein: nutritionNumber(info.proteinContent),
    carbs: nutritionNumber(info.carbohydrateContent),
    fat: nutritionNumber(info.fatContent)
  };
  const hasAny = Object.values(nutrition).some((value) => value > 0);
  return hasAny ? nutrition : null;
}

function structuredRecipeDraft(recipe: Record<string, unknown>): RecipeDraft | null {
  if (!recipe) return null;
  const instructions = Array.isArray(recipe.recipeInstructions)
    ? recipe.recipeInstructions.map((step) => typeof step === "string" ? step : step?.text || step?.name || "").filter(Boolean)
    : [];
  const ingredients = Array.isArray(recipe.recipeIngredient)
    ? recipe.recipeIngredient.filter((item) => typeof item === "string")
    : [];
  const yieldText = String(recipe.recipeYield || "");
  const servingMatch = yieldText.match(/\d+/);
  return {
    title: String(recipe.name || "Imported recipe"),
    description: String(recipe.description || "Cleaned from the source recipe metadata."),
    servings: servingMatch ? Number(servingMatch[0]) : 4,
    time: isoDurationToText(recipe.totalTime) || [
      recipe.prepTime && `Prep ${isoDurationToText(recipe.prepTime)}`,
      recipe.cookTime && `Cook ${isoDurationToText(recipe.cookTime)}`
    ].filter(Boolean).join(" · ") || "45 min",
    ingredients,
    instructions,
    tags: [recipe.recipeCategory, recipe.recipeCuisine].flatMap((value) => Array.isArray(value) ? value : value ? [String(value)] : [])
    ,
    imageUrl: Array.isArray(recipe.image)
      ? imageValueToUrl(recipe.image[0])
      : imageValueToUrl(recipe.image),
    nutrition: structuredNutrition(recipe) || undefined
  };
}

function fallbackDraft(text: string, url: string): RecipeDraft {
  const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const ingredientIndex = lines.findIndex((line) => /^ingredients?\b/i.test(line));
  const instructionIndex = lines.findIndex((line) => /^(instructions?|directions?|method|steps?)\b/i.test(line));
  const servesIndex = lines.findIndex((line) => /^serves?\b/i.test(line));
  const title = (servesIndex > 0 ? lines[servesIndex - 1] : lines[0]) || "Imported recipe";
  const ingredients = ingredientIndex >= 0
    ? lines.slice(ingredientIndex + 1, instructionIndex > ingredientIndex ? instructionIndex : ingredientIndex + 12)
    : lines.filter((line) => /^[-•*]|\d/.test(line)).slice(0, 12);
  const instructions = instructionIndex >= 0
    ? lines.slice(instructionIndex + 1).filter((line) => !/subscribe|newsletter|advertisement/i.test(line)).slice(0, 12)
    : [];
  const servingMatch = text.match(/serves?\s*:?\s*(\d+)/i);
  return {
    title,
    description: "Cleaned from the source page. Review the extracted details before saving.",
    servings: servingMatch ? Number(servingMatch[1]) : 4,
    time: "45 min",
    ingredients: ingredients.map((line) => line.replace(/^[-•*]\s*/, "")),
    instructions: instructions.map((line) => line.replace(/^\d+[.)]\s*/, "")),
    tags: [],
  };
}

// Reject hostnames that resolve to private, loopback, or link-local space, and
// literal IPs in those ranges, to prevent SSRF against internal services and
// cloud metadata endpoints (e.g. 169.254.169.254).
function isBlockedHost(hostname: string): boolean {
  const host = hostname.replace(/^\[|\]$/g, "").toLowerCase();
  if (host === "localhost" || host.endsWith(".localhost") || host.endsWith(".internal") || host.endsWith(".local")) {
    return true;
  }
  // IPv6 loopback / unique-local / link-local.
  if (host === "::1" || host.startsWith("fc") || host.startsWith("fd") || host.startsWith("fe80")) {
    return true;
  }
  const ipv4 = host.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (ipv4) {
    const [a, b] = ipv4.slice(1).map(Number);
    if (a === 10 || a === 127 || a === 0) return true;
    if (a === 169 && b === 254) return true;         // link-local + metadata
    if (a === 172 && b >= 16 && b <= 31) return true; // private
    if (a === 192 && b === 168) return true;          // private
    if (a === 100 && b >= 64 && b <= 127) return true; // carrier-grade NAT
  }
  return false;
}

function assertSafeUrl(rawUrl: string): URL {
  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    throw new Error("That does not look like a valid URL");
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error("Only http and https URLs can be imported");
  }
  if (isBlockedHost(parsed.hostname)) {
    throw new Error("That URL points to a private or internal address");
  }
  return parsed;
}

// Fetch a URL while re-validating every redirect hop, so a page can't bounce
// us to an internal address that passed the initial SSRF check.
async function safeFetch(rawUrl: string): Promise<Response> {
  let target = assertSafeUrl(rawUrl);
  for (let hop = 0; hop < 5; hop += 1) {
    const response = await fetch(target.toString(), {
      headers: { "User-Agent": "KitchenArchive/1.0 recipe importer" },
      redirect: "manual"
    });
    if (response.status < 300 || response.status >= 400) return response;
    const location = response.headers.get("location");
    if (!location) throw new Error("The page redirected without a destination");
    target = assertSafeUrl(new URL(location, target).toString());
  }
  throw new Error("The page redirected too many times");
}

async function fetchSource(url: string) {
  const response = await safeFetch(url);
  if (!response.ok) throw new Error(`Could not fetch the page (${response.status})`);
  const html = await response.text();
  const imageMatch = html.match(/<meta[^>]+(?:property|name)=["']og:image["'][^>]+content=["']([^"']+)["'][^>]*>/i)
    || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']og:image["'][^>]*>/i);
  return {
    html,
    text: stripHtml(html).slice(0, 50000),
    imageUrl: imageMatch?.[1] || ""
  };
}

async function callModel(sourceText: string, sourceUrl: string): Promise<RecipeDraft | null> {
  const provider = Deno.env.get("LLM_PROVIDER") || "anthropic";
  const apiKey = Deno.env.get("LLM_API_KEY") || Deno.env.get("ANTHROPIC_API_KEY");
  const baseUrl = Deno.env.get("LLM_BASE_URL") || "https://api.openai.com/v1";
  const model = Deno.env.get("LLM_MODEL") || (provider === "anthropic" ? "claude-haiku-4-5-20251001" : "");
  if (!apiKey || !model) return null;

  const systemPrompt = "You clean recipe webpages into structured data. Ignore stories, ads, navigation, author biographies, and newsletter text. Never invent missing quantities. Return JSON only with title, description, servings, time, ingredients, instructions, tags, measurementMode, imageUrl when known, and nutrition. IMPORTANT: time must be a plain string such as '45 minutes'; ingredients must be an array of plain strings such as '150 g salmon fillet, skinless'; instructions must be an array of plain strings; tags must be an array of plain strings; measurementMode must be 'both', 'original', or 'metric'. Never return ingredient or time objects. Keep original quantities alongside metric conversions when conversion is reliable; prefer metric for baking. nutrition must be an object with numeric fields calories, protein, carbs, and fat estimating the values PER SINGLE SERVING (grams for protein/carbs/fat, kcal for calories). If the page states nutrition, use it; otherwise estimate from the ingredients and servings. Round to whole numbers. Never return zeros unless the recipe genuinely has none.";
  const userPrompt = JSON.stringify({ sourceUrl, sourceText });
  if (provider === "anthropic") {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": Deno.env.get("ANTHROPIC_VERSION") || "2023-06-01"
      },
      body: JSON.stringify({
        model,
        max_tokens: 1800,
        temperature: 0.1,
        system: systemPrompt,
        messages: [{ role: "user", content: userPrompt }]
      })
    });
    if (!response.ok) throw new Error(`Anthropic returned ${response.status}`);
    const payload = await response.json();
    const content = payload.content?.find((item: { type?: string }) => item.type === "text")?.text;
    if (!content) throw new Error("Anthropic returned an empty result");
    return JSON.parse(content.replace(/^```json\s*|\s*```$/g, ""));
  }

  const response = await fetch(`${baseUrl.replace(/\/$/, "")}/chat/completions`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model,
      temperature: 0.1,
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: userPrompt
        }
      ]
    })
  });
  if (!response.ok) throw new Error(`The language model returned ${response.status}`);
  const payload = await response.json();
  const content = payload.choices?.[0]?.message?.content;
  if (!content) throw new Error("The language model returned an empty result");
  return JSON.parse(content.replace(/^```json\s*|\s*```$/g, ""));
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") return jsonResponse({ error: "POST required" }, 405);
  try {
    const { text = "", url = "", skipModel = false } = await request.json();
    if (!text.trim() && !url.trim()) return jsonResponse({ error: "Provide recipe text or a URL" }, 400);
    const fetched = text.trim() ? null : await fetchSource(url.trim());
    const sourceText = text.trim() || fetched.text;
    const structured = fetched ? structuredRecipeDraft(findRecipeJsonLd(fetched.html)) : null;
    let draft = structured;
    if (!skipModel) {
      try {
        draft = await callModel(sourceText, url.trim());
      } catch {
        draft = null;
      }
    }
    draft = draft || structured || fallbackDraft(sourceText, url.trim());
    // Prefer the model's per-serving estimate, fall back to any nutrition the
    // page published in JSON-LD, and always coerce to clean whole numbers so
    // the client never stores NaN or partial objects.
    const rawNutrition = (draft.nutrition && Object.values(draft.nutrition).some((value) => nutritionNumber(value) > 0))
      ? draft.nutrition
      : structured?.nutrition;
    const nutrition = rawNutrition
      ? {
          calories: nutritionNumber(rawNutrition.calories),
          protein: nutritionNumber(rawNutrition.protein),
          carbs: nutritionNumber(rawNutrition.carbs),
          fat: nutritionNumber(rawNutrition.fat)
        }
      : undefined;
    return jsonResponse({
      ...draft,
      imageUrl: draft.imageUrl || structured?.imageUrl || fetched?.imageUrl || "",
      nutrition,
      sourceUrl: url.trim()
    });
  } catch (error) {
    return jsonResponse({ error: error instanceof Error ? error.message : "Recipe import failed" }, 500);
  }
});
