# Kitchen Archive

A static-first recipe archive prototype.

## Run locally

Open `index.html` in a browser, or run:

```bash
python3 -m http.server 8080
```

Then visit `http://localhost:8080`.

## What works in this first slice

- Recipe library with responsive layout
- Dynamic labels
- Multi-label filtering
- Hybrid-ish local search with natural-language synonym matching
- Family ratings and household favorites
- Recipe detail drawer with nutrition, ingredients, variants, and source
- Add recipes manually
- Browser persistence through `localStorage`
- Recipe distillation flow for pasted text, links, and file uploads
- Editable cleaned draft with suggested labels before saving

## Next implementation slice

- Real repository setup and GitHub Pages deployment
- Private database/authentication
- PDF/image OCR review
- LLM label suggestions
- Structured ingredient normalization
- Nutrition data mapping
- Persistent family member profiles and ratings

## Supabase preparation

See [`SUPABASE_SETUP.md`](./SUPABASE_SETUP.md) and run [`supabase-schema.sql`](./supabase-schema.sql) in a Supabase project's SQL Editor.
