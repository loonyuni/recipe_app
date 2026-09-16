# Supabase migrations

Numbered SQL migrations, applied in order. Run in the Supabase SQL Editor or via
the Management API SQL endpoint (see `CLAUDE.md` → "Applying SQL / DB ops").
These are the source of truth for the schema; they've already been applied to the
`axajsafyosisflrjqpya` project.

| # | File | What it does |
|---|------|--------------|
| 0001 | `0001_schema.sql` | Core tables (households, members, recipes, tags, ratings, variants) + RLS + `is_household_member` |
| 0002 | `0002_onboarding.sql` | `create_household` RPC |
| 0003 | `0003_permissions_fix.sql` | Data-API grants (authenticated only) |
| 0004 | `0004_images.sql` | `image_url` / `image_urls` / `measurement_mode` columns |
| 0005 | `0005_sections.sql` | `sections` jsonb column (multi-component recipes) |
| 0006 | `0006_public_sharing.sql` | `is_public` + `slug`, `public_recipes` view, `publish_recipe` RPC |
| 0007 | `0007_open_browsing.sql` | `public_library` flag, `is_hidden`, slug trigger, `cook_log`, `log_cook`/`set_public_library`, view rewrite |
| 0008 | `0008_backfill_images.sql` | One-off image backfill |

Storage (`recipe-photos` public bucket) + its policies were created directly via
the Management API, not captured here — recorded in `CLAUDE.md`.
