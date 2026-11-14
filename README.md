# Toma – Grow Daily, Care Deeply (website version)

A responsive habit-tracking website with a yellow tomato companion, Toma.
Desktop: full-width site with a top menu and two-column dashboard. Phone: single column with a bottom tab bar.

Stack: HTML5, Tailwind CSS (CDN), Vanilla JavaScript (ES6+), Supabase (optional).

## Files
- index.html           the whole site (UI + logic)
- supabase/schema.sql  tables, row-level security, seed habits

## Run in VS Code
1. File → Open Folder… → this folder.
2. Install the Live Server extension, then right-click index.html → Open with Live Server.
Or run `npx serve` in the folder. Internet is needed for the CDNs.

Without Supabase keys the site runs in Local mode (progress saved in the browser).

## Connect Supabase
1. Create a project at https://supabase.com.
2. SQL Editor → paste supabase/schema.sql → Run.
3. Project Settings → API → copy Project URL and anon public key.
4. Paste them into SUPABASE_URL and SUPABASE_ANON_KEY at the top of the script in index.html (never the service_role key).
5. Authentication → turn off "Confirm email" while testing; add http://127.0.0.1:5500 under URL Configuration.
6. Reload, click Sign in, create an account.
