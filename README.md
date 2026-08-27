# Confidia — Updated (MongoDB Backend + Anonymous Chat)

Anonymous kindness wall for campus, with a real MongoDB backend and admin dashboard.

## Requirements

- Node.js 18+
- MongoDB running locally (`mongodb://127.0.0.1:27017`)
- Database name: **confidia** (collections: `users`, `compliments`)

## Setup

### 1. Backend

```bash
cd backend
npm install
npm run dev
```

Runs on **http://localhost:4000**

Admin login:
- Username: `admin`
- Password: `confidia2026`

### 2. Frontend

```bash
# from project root
npm install
npm run dev
```

Runs on **http://localhost:5173**

## Features

- Compliments stored in MongoDB
- Admin dashboard reads **live stats, users, compliments, reports** from DB
- Approve / delete moderation
- Anonymous campus chat (Socket.io + MongoDB history)
- Report & react endpoints

## Routes

| Path | Description |
|------|-------------|
| `/` | Home |
| `/wall` | Kindness wall |
| `/write` | Write a compliment |
| `/chat` | Anonymous chat |
| `/Profile` | Badges |
| `/admin-login` | Admin dashboard |

## API (backend)

- `GET  /api/compliments`
- `POST /api/compliments`
- `POST /api/compliments/:id/report`
- `POST /api/compliments/:id/react`
- `POST /api/admin/login`
- `GET  /api/admin/stats`
- `GET  /api/admin/pending`
- `GET  /api/admin/compliments`
- `GET  /api/admin/users`
- `GET  /api/admin/moderation-log`
- `POST /api/admin/approve/:id`
- `DELETE /api/admin/compliments/:id`

## Note on compliments schema

Compliment documents should have fields like:

```json
{
  "to": "SOMEONE",
  "message": "...",
  "emoji": "💌",
  "category": "friends",
  "counts": [0, 0, 0],
  "commentsCount": 0,
  "reported": false,
  "reportReason": null
}
```

If your existing `compliments` collection uses different field names, rename them in Compass or adjust `server.js` schema.
