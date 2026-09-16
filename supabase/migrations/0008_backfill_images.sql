-- Attach the existing personal photos to the already-imported recipe.
-- This updates the row; it does not create a duplicate.
update public.recipes
set
  image_url = 'assets/recipes/one-pan-salmon-broccoli-bake/IMG_7622.JPG',
  image_urls = '[
    "assets/recipes/one-pan-salmon-broccoli-bake/IMG_7622.JPG",
    "assets/recipes/one-pan-salmon-broccoli-bake/IMG_7627.JPG",
    "assets/recipes/one-pan-salmon-broccoli-bake/IMG_7628.JPG"
  ]'::jsonb,
  updated_at = now()
where lower(title) = 'one-pan salmon and broccoli bake';
