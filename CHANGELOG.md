# QA Sweep Changelog

Autonomous QA pass over the recipe app: driving prod with Playwright, fixing
persistence/correctness bugs, and cataloging every decision made without you so
you can review here and in the commit history.

Each entry records: the finding, the root cause, the decision I made (where I'd
normally have asked), the change, and how it was verified.

---

## Bug fixes

### 1. Imported recipes had no nutrition/macros (e.g. salmon showed 0/0/0/0)

- **Reported by:** you ("salmon recipe doesn't have any nutrition info").
- **Root cause:** Nutrition was only ever hand-typed on the 6 seeded starter
  recipes. Every imported or manually-added recipe was created with
  `calories/protein/carbs/fat = 0` (app.js manual-add + distill-review forms),
  and the `distill-recipe` edge function never asked the model for nutrition,
  nor parsed it from page JSON-LD. The drawer still printed "estimate · medium
  confidence" over those zeros — misleading.
- **Decision (you were away / picked "LLM estimates" + "backfill"):**
  1. Extend the distill edge function to return per-serving macros — from the
     LLM, and from schema.org `NutritionInformation` JSON-LD when present.
  2. Carry nutrition through the client draft → save path instead of zeroing.
  3. Add a per-recipe **"Estimate nutrition"** button (backfill) shown when a
     recipe has no nutrition yet; hide the "estimate" label until real values
     exist and show an explicit "not calculated yet" state.
- **Files:** `supabase/functions/distill-recipe/index.ts`, `app.js`, `styles.css`.
- **Verification:** _pending live test on the salmon recipe (signed in)._

### 2. Ratings entered as "Uni"/"Alex" never persisted to the cloud (showed 0)

- **Reported by:** you ("I input ratings for both recipes and now they both
  show 0").
- **Root cause:** `saveRatingToCloud` bailed with `if (!member) return;` whenever
  the reviewer name wasn't a real `household_members` row. The reviewer dropdown
  only offers the hardcoded `localReviewers` ("Uni"/"Alex"), which are **not**
  members — so the cloud insert was always skipped and the rating lived only in
  one browser's localStorage. On reload, `loadCloudRecipes` rebuilds ratings
  from cloud + local, so on any other device the list was empty → `averageRating`
  returned 0. (The next line's `member?.id || cloud.memberId` fallback was dead
  code behind the early return.)
- **Decision:** Attribute a rating to the signed-in member (`cloud.memberId`)
  when the chosen alias isn't a real member, so it persists. De-dupe by deleting
  any prior (recipe, member) row before insert (table has no unique constraint).
  On successful cloud save, drop the local alias copy so the reload merge doesn't
  render the rating twice (cloud real-name + local alias).
- **Files:** `app.js` (`saveRatingToCloud`, `removeManualRating`, submit handler).
- **Verification:** _pending live test: save a rating, reload, confirm it sticks._

---

## Notes / caveats

- Prod auth is per-origin; testing the fixes required signing in again on the
  local build (same Supabase backend) — flagged rather than assumed.
- The edge function change must be **deployed** (`supabase functions deploy
  distill-recipe`) for new imports to get nutrition; the client backfill button
  works against the deployed function.
