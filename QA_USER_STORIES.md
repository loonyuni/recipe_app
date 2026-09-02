# User Stories & QA Test Matrix

Derived from the shipped feature surface (app.js handlers, index.html, edge
function). Statuses reflect a full **live signed-in Playwright pass on prod**
(session minted via the Supabase admin API for testing), plus earlier fixes.

Legend: ✅ verified live · ⚠️ bug found+fixed · 🧪 verified by trace/DB

## Auth & session
- **US-1** Sign in with email/password. — ✅ live
- **US-2** Session persists per device. — ✅ (refresh-token rotation disabled so it no longer drops)
- **US-3** Create a household account (sign-up). — ⚠️ double-load could create duplicate households; fixed
- **US-4** Sign out clears state. — ⚠️ left prev household's data on screen/localStorage; fixed

## Recipes — browse & view
- **US-5** See recipes in a grid. — ✅ live
- **US-6** Open a recipe drawer. — ✅ live
- **US-7** Search by title/ingredient. — ✅ live (spans pastry archive; "chocolate"→33, "paris-brest"→exact)
- **US-8** Sort recently added / highest rated / title / quickest. — ✅ live
- **US-9** Family favorites (avg ≥ 4.5) + Recently cooked filters. — ✅ live

## Recipes — create & edit
- **US-10** Add a recipe manually. — ✅ live: added → reloaded → persisted (was local-only loss; fixed)
- **US-11** Import/distill from URL / pasted text / PDF. — ✅ live: paste → distilled via deployed edge fn → saved WITH nutrition (285 kcal)
- **US-12** Edit a recipe. — ✅ live: edited → reloaded → persisted (was silent revert; fixed)
- **US-13** Delete a recipe. — ✅ live: deleted → reloaded → gone; DB back to 82
- **US-14** Per-serving macros on each recipe. — ✅ live (salmon 520/42/18/32; croissant 303/4/29/18; 80 imports all populated)
- **US-15** Estimate nutrition for a recipe lacking it. — ✅ live vs deployed edge fn

## Ratings
- **US-16** Rate; persists across reloads/devices. — ✅ live vs prod DB
- **US-17** Re-rating updates, no duplicate row. — ✅ live (DB row stayed 1)
- **US-18** Average drives favorites + highest-rated sort. — ✅ live

## Labels / tags
- **US-19** Add / rename / delete labels. — ✅ add live (persisted across reload); rename/delete 🧪 traced; silent-failed-sync bug fixed
- **US-20** Filter by clicking a label. — ✅ live (pastry school → 80)
- **US-21** Merge / audit labels. — 🧪 traced (dedup + reconciliation correct)
- **US-22** Clear all active filters. — ✅ live (returns to 2 personal)

## Homepage / discoverability
- **US-24** Homepage not cluttered by the pastry archive. — ✅ live (Library shows 2 personal; Pastry school view shows 80)
- **US-25** All labels reachable + sorted. — ⚠️ sidebar hard-capped at 12 (47 hidden after import); FIXED → all 57 shown, usage-sorted, scrollable; verified live

## Persistence (cross-cutting)
- **US-23** All create/edit/rate/label actions persist and survive reload. — ✅ VERIFIED live end-to-end for add/edit/rate/delete/label-add.

## Bugs found + fixed across the whole QA effort (8)
ratings-not-syncing · imports-no-nutrition · local-only-recipe-loss · sign-out-data-leak · duplicate-household-double-load · silent-label/edit-sync · asset-cache-bust · sidebar-label-cap.
