# Toma – Grow Daily, Care Deeply

Responsive habit-tracking website with a yellow tomato companion, Toma.
Habits (add / edit / delete your own), growth-energy garden, focus timer, mood + affirmations.
Stack: HTML5, Tailwind CSS (CDN), vanilla JavaScript, Supabase.

## Structure
```
toma-web/
├── index.html                       page structure
├── css/style.css                    custom styles and animations
├── js/config.js                     Supabase URL + publishable key
├── js/data.js                       state, localStorage and Supabase data layer
├── js/app.js                        views, timer, actions, startup
└── supabase/
    ├── schema.sql                   tables, row-level security, starter habits (run first)
    └── update-custom-habits.sql     custom habits update (run second)
```

## Run locally
VS Code -> right-click index.html -> Open with Live Server.

## Supabase setup (new project)
1. SQL Editor: run schema.sql, then update-custom-habits.sql.
2. Authentication -> URL Configuration: add your site URLs.
3. Put your Project URL and publishable key in js/config.js. Never use the secret key.

## Deploy
Commit and sync to GitHub; Vercel redeploys automatically.
