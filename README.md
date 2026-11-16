# Toma 🍅 Grow Daily, Care Deeply

Toma is a gamified self-care and habit tracker. A cheerful yellow tomato named Toma keeps you company while you build habits, focus, track your mood, manage tasks and keep an eye on your money. Every habit waters your garden, so small wins are easy to see.

**Live site:** https://toma-self-improve-og.vercel.app

> Built as a capstone project, inspired by the MeGrow self-care app.

## Features

**Habits and garden**
- Create, edit and delete your own habits, with an icon and a reward of 5, 10 or 15 growth energy
- Choose which weekdays each habit repeats on. Rest days never break your streak
- Habits reset at your own local midnight
- A garden of up to 18 plants that grow from seeds, and new plant species unlock as you level up
- Name your own garden

**Focus timer**
- Pomodoro-style timers you can rename, resize (1 to 180 minutes) or create from scratch, such as "Cleaning"
- Start, pause and resume, with an alarm sound, confetti and a cheerful message when time is up

**Mood journal**
- One mood per day, with a monthly calendar where past days can be edited
- Pie chart of your moods over the last 7, 15 or 30 days
- A daily self-love affirmation

**To-do list and money tracker**
- To-do list with ticking, deleting and a Clear all button
- Money tracker for income and expenses, with a "money left" balance
- Provided labels (rent, bills, grocery, makeup, education and more) plus your own saved labels, kept separate for income and expenses
- Monthly or all-time view, edit and delete entries, and pie charts that only show labels you have used
- Currency picker

**Progress**
- Day streaks, a weekly chart and insights such as your strongest weekday and how your mood relates to your habits
- 12 achievement badges with a celebration when you unlock one

**Accounts and settings**
- Sign up, sign in, forgot password by email, change password and delete account
- Sign-up rules with a live password checklist, strength meter and show/hide eye, and clear errors under each field
- Guest mode that saves to the browser, so no account is needed to try it
- Light and dark mode, display name and profile settings
- Animated landing page, responsive from phones to desktops, with reduced-motion support

## Tech stack

| Area | Technology |
|---|---|
| Frontend | HTML5, Tailwind CSS (CDN), vanilla JavaScript (ES6+) |
| Backend and database | Supabase (PostgreSQL, Auth, row-level security) |
| Hosting | Vercel, deployed automatically from this GitHub repository |

There is no build step. The site is plain static files.

## Project structure

```
.
├── index.html            Landing page, app shell and dialogs
├── assets/
│   └── alarm-04.mp3      Timer alarm sound
├── css/
│   └── style.css         Custom styles, animations and dark mode
├── js/
│   ├── config.js         Supabase URL and publishable key
│   ├── data.js           App state, localStorage and Supabase data layer
│   ├── app.js            Views, focus timer and actions
│   ├── landing.js        Landing page and sign-in entry points
│   ├── settings.js       Profile, dark mode, password reset, delete account
│   ├── insights.js       Insights and achievements
│   ├── validation.js     Email, name and password rules
│   └── money.js          Money tracker
├── supabase/
│   ├── schema.sql                  Base tables and security rules
│   └── update-*.sql                Feature updates, run in order
└── README.md
```

## Run it locally

1. Clone the repository and open the folder in VS Code.
2. Install the **Live Server** extension.
3. Right-click `index.html` and choose **Open with Live Server**.

Or run `npx serve` in the project folder. The site needs internet access for the Tailwind, font and Supabase CDNs.

Without Supabase keys, Toma runs in guest mode and saves to the browser.

## Set up Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. Open **SQL Editor** and run these files from the `supabase` folder, one at a time, in this order:
   `schema.sql`, `update-custom-habits.sql`, `update-v4.sql`, `update-v5.sql`, `update-v6.sql`, `update-v7.sql`, `update-v8.sql`.
3. Go to **Authentication → Sign In / Providers → Email** and set the minimum password length to 8 with the requirement "Lowercase, uppercase letters and digits", so the rules are also enforced on the server.
4. Go to **Authentication → URL Configuration**. Set the Site URL to your deployed site, and add your local and deployed addresses under Redirect URLs, for example `http://127.0.0.1:5500/**` and `https://your-site.vercel.app/**`.
5. Copy your Project URL and publishable key from **Project Settings → API Keys** into `js/config.js`.

During development you can turn off **Confirm email** under **Authentication → Sign In / Providers → User Signups**, so test accounts work immediately. Turn it back on for real use.

### Database overview

| Table | Purpose |
|---|---|
| `habits` | Each user's habits, rewards and weekday schedules |
| `habit_logs` | One row per habit completed on a day |
| `moods` | One mood per user per day |
| `focus_sessions` | Finished focus timers |
| `garden_stats` | Total growth energy |
| `user_settings` | Focus timers, display and garden names, badges, money labels and currency |
| `todos` | To-do list |
| `transactions` | Income and expenses |

## Security

- Row-level security is enabled on every table, so each user can only read and change their own rows.
- Only the Supabase **publishable** key is used in the browser. The secret or service role key is never in this repository.
- Input is validated in the browser and by database constraints, and user text is escaped before it is shown.
- Account deletion uses a database function that removes the signed-in user and, through cascading rules, all of their data.

## Deploy

1. Import the repository into [Vercel](https://vercel.com) and choose the **Other** framework preset. Leave the build settings empty.
2. Every push to `main` redeploys the site automatically.

## Ideas for the future

- Install as an app (PWA) and reminder notifications
- Download your data as CSV
- Budgets and monthly spending goals

## Author

Built by Ei Chan Myat ([@EiChanMyat](https://github.com/EiChanMyat)).
