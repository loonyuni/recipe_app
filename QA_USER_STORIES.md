# User Stories & QA Test Matrix

Derived from the shipped feature surface (app.js event handlers, index.html,
edge function) since there's no canonical spec in the repo. Each story has a
verification status from this QA sweep.

Legend: ✅ verified · ⚠️ bug found · ⏳ pending · 🔍 needs signed-in prod

## Auth & session
- **US-1** As a household member, I can sign in with email/password. — ✅ (login works)
- **US-2** My session persists per device so I stay logged in. — 🔍
- **US-3** I can create a new household account (sign-up). — ⚠️ (double-load could create duplicate households; fixed)
- **US-4** I can sign out. — ⚠️ (left prev household's recipes on screen/localStorage; fixed)

## Recipes — browse & view
- **US-5** I see all my household recipes in a grid. — ✅
- **US-6** I can open a recipe drawer with full details. — ✅
- **US-7** I can search recipes by title/ingredient. — ⏳
- **US-8** I can sort by recently added / highest rated / title / quickest. — ⏳
- **US-9** I can filter to Family favorites (avg ≥ 4.5) and Recently cooked. — ⏳

## Recipes — create & edit
- **US-10** I can add a recipe manually. — ⚠️ (local-only recipes lost on reload; fixed)
- **US-11** I can import/distill a recipe from URL or pasted text/PDF. — 🔍
- **US-12** I can edit an existing recipe. — ✅ (traced: memory + cloud + localStorage consistent)
- **US-13** I can delete a recipe. — ✅ (traced: cloud-first, then local + memory)

## Nutrition
- **US-14** Each recipe shows per-serving macros. — ⚠️ (imported recipes had 0; fixed + backfill added)
- **US-15** I can estimate nutrition for a recipe that lacks it. — ⏳ (new; test backfill)

## Ratings
- **US-16** I can rate a recipe and it persists across reloads/devices. — ⚠️ (never synced to cloud; fixed)
- **US-17** Re-rating updates my existing rating rather than duplicating. — ⏳ (fixed; verify no dupes)
- **US-18** Average rating drives Family favorites + Highest-rated sort. — ⏳

## Labels / tags
- **US-19** I can add, rename, delete labels. — ✅ happy-path traced; ⚠️ failed cloud sync was silent (fixed)
- **US-20** I can filter recipes by clicking a label. — ✅ (in-memory view state; traced)
- **US-21** I can merge/audit labels. — ✅ (traced: dedup + reconciliation correct)
- **US-22** I can clear all active filters. — ✅ (verified via Playwright + trace)

## Persistence (cross-cutting)
- **US-23** All create/edit/rate/label actions persist to the cloud and survive
  reload on any device. — ⚠️ 6 bugs found & fixed (ratings, imports nutrition,
  local-only recipe loss, sign-out leak, double-load, silent label/edit sync
  failures). Live signed-in confirmation delegated to user (PR #1 checklist).
