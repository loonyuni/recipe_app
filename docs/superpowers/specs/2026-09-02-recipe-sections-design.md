# Multi-section recipes (pastry-school format)

## Problem

Pastry-school recipes are often one dish made of several component recipes
(e.g. flan = pie pastry + flan custard + finishing), each with its own
ingredients and instructions. Today a recipe is a single row with two flat
`jsonb` arrays (`ingredients`, `instructions`); the only "section" is a
cosmetic colon-label convention inside the flat ingredient list, and
instructions have no grouping at all. We want components to stay distinct
(mirroring how you bake them) while still living under one recipe.

## Decisions (from brainstorming)

- **Whole-recipe scaling**: one scale factor applies to every section at once.
- **Stacked layout**: sections render top-to-bottom on the recipe page, each a
  labeled block (title + its ingredients + its method).
- **Uniform model**: every recipe has 1+ sections. A simple recipe is one
  section with an empty title, on the same code path. Sections are additive and
  optional.

## Data model

In-memory recipe gains `sections`:

```
recipe.sections = [
  { title: "Pie pastry",   ingredients: [string], instructions: [string] },
  { title: "Flan custard", ingredients: [string], instructions: [string] },
  ...
]
```

Sections are the **source of truth** for display and editing. The existing flat
`recipe.ingredients` / `recipe.instructions` are **derived projections** kept in
sync for search, nutrition, and backward compatibility:

- flat `ingredients` = for each section, a `"<title>:"` header line (only when
  titled, reusing the existing header convention) followed by its ingredients.
- flat `instructions` = all sections' instructions concatenated.

A recipe with no `sections` (legacy rows, starter recipes) is treated as one
untitled section built from its flat arrays, so nothing regresses.

## Storage

Add one additive column: `recipes.sections jsonb not null default '[]'::jsonb`.
Rows with `[]` fall back to the single-section projection on load. Save/update
writes `sections` plus the derived flat `ingredients`/`instructions` (the flat
columns stay populated so legacy reads, search, and nutrition keep working).

## Import

Extend the distill Edge Function's `RecipeDraft` with optional
`sections: {title, ingredients[], instructions[]}[]` and update the model prompt
to emit sections for multi-component recipes (single flat arrays otherwise).
Client `normalizeDraft` carries sections through and derives flat arrays. When
the model returns no sections, the recipe is a single untitled section.

## Display (drawer)

- Single untitled section → classic layout unchanged (Ingredients heading +
  scale panel + list, Method heading + steps).
- Titled / multiple sections → one scale panel at top, then a stacked block per
  section: section title, its ingredient list, its method list.
- Scaling iterates every ingredient list under the drawer and applies the one
  global factor via the existing `scaleIngredient` path. Instructions render
  statically (they don't scale).

## Editing (manual form + import review)

Replace the two flat textareas with a **section editor**: a container of section
cards, each with a title input + ingredients textarea + instructions textarea +
remove button, plus an "Add section" button. One untitled section by default, so
simple manual entry is unchanged. Submit reads sections from the editor and
derives the flat arrays.

## Testing

No test harness; verify in-browser signed-in (Playwright): import a multi-section
recipe → sections render stacked; scale 2× → every section's quantities scale;
edit to add/remove a section → round-trips through save/reload; an existing
simple recipe still renders and scales unchanged.

## Files touched

- `supabase-schema.sql` + new `supabase-sections.sql` (add column, applied via mgmt API)
- `supabase/functions/distill-recipe/index.ts` (type + prompt + passthrough)
- `app.js` (section helpers, `recipeFromRow`, `normalizeDraft`, cloud save/update,
  drawer render, `applyDrawerScaling`, edit/import forms + submit handlers)
- `index.html` (section-editor containers in both forms)
- `styles.css` (section block + section editor styles)
