# Codex-assisted recipe imports

The hosted website is optional for recipe curation.

## Use this chat when

- you have pasted recipe text;
- you have a public recipe URL;
- you have a PDF, screenshot, or OCR file;
- you want substitutions, tags, nutrition estimates, or family ratings added;
- you want to update an existing recipe without creating a duplicate.

## Workflow

Tell Codex something like:

```text
Add this recipe to Kitchen Archive.
Source: <URL or filename>
Please preserve original measurements, add metric equivalents where reliable,
tag it, estimate nutrition, and check for duplicates.
```

Then provide the text, URL, or attach the file.

Codex should:

1. extract the recipe content and remove surrounding page filler;
2. normalize title, servings, time, ingredients, and instructions;
3. preserve original quantities and add metric alternatives when appropriate;
4. identify tags and estimate nutrition when enough information exists;
5. preserve source URL and image references;
6. detect an existing recipe by source URL or title;
7. update the existing recipe instead of creating a duplicate;
8. copy user-provided images into `assets/recipes/<slug>/`;
9. update the local project data or generate the required Supabase update.

This path does not call Claude and is intended to reduce API costs.

## What Codex can access

Codex can work with:

- text pasted directly into the conversation;
- files attached to the conversation;
- local files under the workspace, such as `/Users/ykuang/Downloads/recipe.pdf`;
- public URLs when the page is accessible.

For paywalled pages, provide a PDF, screenshot, OCR text, or copied recipe content instead.

## Local repo versus hosted database

Codex can directly edit this local repository, including:

- `app.js`
- recipe data
- SQL migration/update files
- image assets
- documentation

Those local changes do not automatically change the hosted Supabase database. To sync the hosted database, use one of these paths:

- sign in to the hosted app and save through its UI;
- run a generated SQL update in Supabase SQL Editor;
- add an authenticated import/sync command later.

Never solve this by putting a Supabase service-role key in the frontend or repository.

## Recommended handoff language

Use:

```text
Add this to the local repo only.
```

or:

```text
Add this to the local repo and prepare the Supabase update, but do not run external writes.
```

or:

```text
Add this and sync it to the hosted archive.
```

The last option may require a signed-in hosted session or a user-run SQL command if no safe database write path is available.
