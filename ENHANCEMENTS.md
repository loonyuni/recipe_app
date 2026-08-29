# Product & Layout Enhancement Proposals

Compiled during the QA sweep. Not implemented — these are ranked suggestions for
your call. Grounded in the current app (desktop + mobile screenshots, markup,
CSS). Effort is rough: S = <1hr, M = a few hrs, L = a day+.

## High value / low effort

1. **Rating input is broken UX when signed out (S).** The drawer always shows the
   reviewer dropdown ("Uni"/"Alex") and Save Rating even when not signed in, and
   ratings only meaningfully persist for members. Hide or disable the rating form
   when signed out, and label the dropdown with the *actual* signed-in member.
   (Related to the ratings bug just fixed — the reviewer model is confusing.)

2. **"Recently cooked" view is meaningless on seeded data (S).** Every recipe has
   `cooked > 0`, so the view shows everything. There's no way to mark a recipe as
   cooked. Add a "Mark as cooked today" action in the drawer that bumps a
   `cooked`/`lastCooked` timestamp — makes the view real and feeds a "cook streak."

3. **Nutrition label honesty (S — partly done).** Now fixed to hide the "estimate ·
   medium confidence" line when there's no data. Next: show the confidence based on
   source (JSON-LD published = high, LLM estimate = medium) instead of hardcoding.

4. **Empty search/filter result count (S).** `#result-count` exists but a "6 of 6"
   / "0 results" indicator next to the filter row would make search feel responsive.

5. **More keyboard shortcuts (S).** ⌘K→focus-search is already wired (app.js:1615)
   and Esc closes overlays. Cheap wins: `/` to search, `n` for new recipe, and a
   discoverable shortcuts hint (the ⌘K kbd is the only one surfaced).

## Medium value / medium effort

6. **Servings scaler (M).** Let users scale ingredient quantities by target
   servings — high-utility for a household cookbook. Pairs well with the metric
   conversion already in `measurementMode`.

7. **Cook mode / step-by-step view (M).** A full-screen, large-type, screen-wake
   instructions view for actually cooking from the phone. This is the #1 thing a
   "household cookbook" is used for and the current drawer isn't ideal at the stove.

8. **Bulk label management from the grid (M).** Currently a label can only be added
   from an open recipe. Allow multi-select on cards → apply/remove a label to
   several at once. Speeds up organizing an imported backlog.

9. **Image handling on cards (M).** Cards without a photo show a colored block with
   the title. Consider a consistent aspect-ratio and a subtle placeholder pattern so
   the grid reads evenly (see mobile screenshot — the cropped orange block looks
   unfinished).

## Layout / visual polish

10. **Mobile hero is oversized (S).** On a 390px screen the "What are we making?"
    hero eats most of the first viewport before any recipe is visible. Tighten the
    clamp() min so recipes appear higher on mobile.

11. **Card rating chip contrast (S).** `★ 4.8` sits quietly bottom-right; a tiny
    bump in weight/contrast would make ratings scannable across the grid.

12. **Sticky topbar on scroll (S).** The action buttons (Sign in / Import / Add)
    scroll away. A sticky/condensing topbar keeps "Add recipe" reachable in a long
    list.

13. **Drawer as right-rail on desktop, sheet on mobile (M).** The drawer already
    slides from the right; on mobile a bottom-sheet pattern would feel more native
    and leave the list visible behind it.

14. **Dark mode (M).** `theme-color` is set and colors are CSS variables — a dark
    palette is mostly a variable swap and suits evening meal-planning.

## Data / trust

15. **Confidence + source attribution on imported recipes (M).** Show the source
    domain and a "review imported fields" nudge, since distillation is imperfect.

16. **Undo for destructive actions (S).** Delete is immediate. A toast with "Undo"
    (re-insert the just-deleted recipe) is cheap insurance for a personal archive.
