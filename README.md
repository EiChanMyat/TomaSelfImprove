# Toma – Grow Daily, Care Deeply

Responsive habit-tracking website with a yellow tomato companion, Toma.
Habits (add / edit / delete your own), growth-energy garden, focus timer, mood + affirmations.
Stack: HTML5, Tailwind CSS (CDN), vanilla JavaScript, Supabase.

## Structure
```
toma-web/
├── index.html                       page structure
├── css/style.css                    custom styles and animations
├── assets/alarm-04.mp3              timer alarm sound
├── js/config.js                     Supabase URL + publishable key
├── js/data.js                       state, localStorage and Supabase data layer
├── js/app.js                        views, timer, actions, startup
└── supabase/
    ├── schema.sql                   tables, row-level security, starter habits (run first)
    ├── update-custom-habits.sql     custom habits update (run second)
    ├── update-v4.sql                manage all habits, custom focus timers, mood calendar (run third)
    ├── update-v5.sql                to-do list (run fourth)
    ├── update-v6.sql                profile names and delete my account (run fifth)
    └── update-v7.sql                habit schedules and achievements (run sixth)
```

## Run locally
VS Code -> right-click index.html -> Open with Live Server.

## Supabase setup (new project)
1. SQL Editor: run schema.sql, then update-custom-habits.sql.
2. Authentication -> URL Configuration: add your site URLs.
3. Put your Project URL and publishable key in js/config.js. Never use the secret key.

## Deploy
Commit and sync to GitHub; Vercel redeploys automatically.

## Landing page
The first screen is a landing page (inside index.html, styled in css/style.css, logic in js/landing.js).
Returning signed-in users and guests go straight to the app; click the title in the app to see the landing page again.

Settings, dark mode, forgot password and the midnight refresh live in js/settings.js.

Insights and achievements live in js/insights.js (shown on the Progress tab).

Sign-up rules (email format, name, password checklist, show-password eye) live in js/validation.js.
In Supabase also set Authentication > Sign In / Providers > Email: minimum password length 8 and "Lowercase, uppercase letters and digits", so the rules are enforced on the server too.
