# WhisperWall — Kindness Connection

An anonymous, positive-only campus compliment wall, built with React + Vite + React Router.
No backend required — everything is simulated in a service layer backed by `localStorage`,
so it's easy to swap for a real API later without touching any components.

## Features

- **Home** — hero, live stats, and a preview of the wall
- **Wall** (`/wall`) — full compliment feed with category filters, search, reactions (❤️😊👏),
  and reporting
- **Write** (`/write`) — anonymous compliment form with a recipient picker, mood selector,
  random kindness prompt generator, character limit, and a lightweight moderation check
  (auto-flags posts with disallowed words for admin review)
- **Badges** (`/badges`) — unlockable badges based on how many compliments you've posted and
  reactions collected, plus a decorative "Kindness Cloud"
- **Admin** (`/admin`) — separate, login-gated dashboard (demo credentials below) with stats,
  a weekly activity chart, and a moderation queue to approve/delete reported or flagged posts

## Admin demo login

```
username: admin
password: kindness123
```

(See `src/utils/constants.js` to change these.)

## Project structure

```
src/
  components/       Hero, stats, compliments, write, Badges, Cloud, Dashboard, Navbar, Footer, layout, common
  pages/            Home, Wall, Write, Badges, Admin, NotFound
  context/          AuthContext, ThemeContext
  services/         api, complimentService, badgeService, adminService, authService (all localStorage-backed)
  data/             seed compliments, badges, prompts, categories, stats
  utils/            constants, formatDate, helpers, validation
  styles/           globals.css, variables.css
```

## Run it

```bash
npm install
npm run dev
```

Then open the printed local URL. Run `npm run build` to produce a production build in `dist/`.

## Swapping in a real backend

Every read/write goes through `src/services/*.js`. Replace the `localStorage` calls inside
those files with real `fetch()`/API calls — the pages and components don't need to change.
