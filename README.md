# Confidia — polished user experience

Anonymous campus kindness wall: compliments, reactions, replies, chat, badges, and admin moderation.

## What’s improved (user side)

### Backend
- Stronger auth validation (name, email, password length, optional custom username)
- Day-streak tracking on login / session restore / posting
- Fixed `reactionsGiven` field on login response
- `GET /api/auth/profile` — user stats, computed badges, own compliments
- Safer compliment create (length limits, category normalization, streak touch)
- Longer JWT lifetime (14d)

### UI / UX
- Sticky glass-style navbar with avatar chip, active links, mobile menu
- Full Profile page: stats, badges, your anonymous posts, guest CTA
- Wall loading skeletons + friendlier empty states
- Write page inline success/error (no more bare `alert`s)
- Polished login/register already present; consistent purple/pink campus theme
- Badge unlock celebration popup when a new badge is earned

## Environment

`backend/.env`:

```
PORT=4000
MONGO_URI=mongodb://127.0.0.1:27017/confidia
JWT_SECRET=Confidia_secret_home
ADMIN_USER=admin
ADMIN_PASS=confidia2026
```

Change these before deploying anywhere real — the values above are just for local dev.

## Run

MongoDB on `127.0.0.1:27017`:

```bash
cd backend && npm install && npm run dev
cd .. && npm install && npm run dev
```

Frontend: http://localhost:5173  
Backend:  http://localhost:4000

## Auth

- Student register/login: `/user-register`, `/user-login`
- Admin: `/admin-login` → `admin` / `confidia2026`
- Write / react / report require a logged-in **user**

## API map

| Path | Notes |
|------|--------|
| `/api/auth/*` | register, login |
| `/api/auth/me` | session + streak touch |
| `/api/auth/profile` | stats, badges, my posts |
| `/api/wall` | formatted feed + POST create |
| `/api/compliments/*` | modular CRUD + react/report |
| `/api/notifications/*` | user notifications |
| `/api/admin/*` | moderation |
| `/api/stats` | homepage counters |
| Socket.io | campus anonymous chat |
