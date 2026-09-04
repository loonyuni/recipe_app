# Supabase setup

This project is currently local-first. These steps prepare the hosted database.

## 1. Create a project

Create a Supabase project and keep the database password somewhere safe. The free plan is enough for the first version.

## 2. Run the schema

Open **SQL Editor**, create a new query, paste in [`supabase-schema.sql`](./supabase-schema.sql), and run it. Then run [`supabase-onboarding.sql`](./supabase-onboarding.sql) in a second query.

If the app reports `permission denied for table household_members`, run [`supabase-permissions-fix.sql`](./supabase-permissions-fix.sql) as a third query.

To enable public recipe sharing / permalinks, run [`supabase-public-sharing.sql`](./supabase-public-sharing.sql). It adds `is_public` + `slug` columns, a `public_recipes` read-only view (the only thing `anon` can read: public rows, safe columns), and the `publish_recipe(uuid, boolean)` RPC used by the drawer's Share toggle.

## 3. Create the browser config

Copy `supabase-config.example.js` to `supabase-config.js` and fill in the project URL and browser-safe anon key from the project API settings.

Do not commit a service-role key. Browser access is protected by Row Level Security.

## 4. Create the first household

After authentication is wired into the app, the first signed-in user will create the household and add family members. We will add that onboarding screen next.

## 5. Recommended next code slice

Connect the library to Supabase behind a small repository layer:

```text
recipeRepository.list()
recipeRepository.create()
recipeRepository.update()
recipeRepository.export()
```

The UI can continue using local seed data when the Supabase config is absent.

## Recipe distillation function

The link importer calls `supabase/functions/distill-recipe`. Deploy it with the Supabase CLI:

```bash
supabase login
supabase link --project-ref axajsafyosisflrjqpya
supabase functions deploy distill-recipe
```

The function works without a model key using a basic cleanup fallback. For real LLM cleanup, set an OpenAI-compatible provider:

```bash
supabase secrets set \
  LLM_API_KEY="your-provider-key" \
  LLM_BASE_URL="https://your-provider.example/v1" \
  LLM_MODEL="your-model-name"
```

Keep the model key in Supabase secrets; never put it in `supabase-config.js`.

For Claude/Anthropic API access instead:

```bash
supabase secrets set \
  LLM_PROVIDER="anthropic" \
  LLM_API_KEY="your-anthropic-api-key" \
  LLM_MODEL="the-model-id-from-your-anthropic-console"
```

A Claude app subscription and Anthropic API billing are separate. A Claude Pro/Max subscription does not itself provide an API key or API usage allowance.
