# API reference

Base URL: `http://localhost:5050/api` (local) or `https://YOUR-API.vercel.app/api`.

- Bodies and replies are JSON.
- "Auth" means send `Authorization: Bearer <accessToken>`.
- Errors: `{ "error": { "message": "...", "details": [{ "field": "...", "message": "..." }] } }`

| Status | Meaning                                                       |
| ------ | ------------------------------------------------------------- |
| 400    | Invalid input                                                 |
| 401    | Not logged in, or the token expired                           |
| 403    | Logged in but not allowed                                     |
| 404    | Not found                                                     |
| 409    | Clashes with the current state (already taken, task not open) |
| 429    | Too many attempts                                             |
| 503    | Supabase Auth could not be reached                            |

## Auth

| Method | Endpoint         | Auth | Body                                       |
| ------ | ---------------- | ---- | ------------------------------------------ |
| POST   | `/auth/register` | No   | `name, username, password, email?, phone?` |
| POST   | `/auth/login`    | No   | `identifier, password`                     |
| POST   | `/auth/refresh`  | No   | `refreshToken`                             |
| POST   | `/auth/logout`   | Yes  | none (204)                                 |
| GET    | `/auth/me`       | Yes  | none                                       |

Register (201), login and refresh return:

```json
{ "accessToken": "...", "refreshToken": "...", "user": { "id": "...", "username": "priya" } }
```

## Users

| Method | Endpoint             | Auth | Notes                                                           |
| ------ | -------------------- | ---- | --------------------------------------------------------------- |
| GET    | `/users/:id`         | No   | Public profile with `rating_avg`, `rating_count`, `id_verified` |
| PUT    | `/users/me`          | Yes  | `name, location?, bio?, idDetails?` (send all; empty clears)    |
| GET    | `/users/:id/reviews` | No   | Latest 50 reviews received                                      |

## Tasks

| Method | Endpoint                   | Auth     | Notes                                                         |
| ------ | -------------------------- | -------- | ------------------------------------------------------------- |
| GET    | `/tasks`                   | No       | Search, newest first                                          |
| POST   | `/tasks`                   | Yes      | `title, description, budget, category?, location?, deadline?` |
| GET    | `/tasks/mine`              | Yes      | Tasks you posted                                              |
| GET    | `/tasks/:id`               | Optional | `{ task, reviews, viewer }`                                   |
| PUT    | `/tasks/:id/cancel`        | Poster   | Open tasks only                                               |
| PUT    | `/tasks/:id/select/:bidId` | Poster   | Hires; rejects other bids                                     |
| PUT    | `/tasks/:id/complete`      | Poster   | Assigned tasks only                                           |

Search parameters: `q`, `category`, `location`, `minBudget`, `maxBudget`,
`status` (`open` by default, `assigned`, `completed`, `cancelled`, `all`), `page`, `limit` (max 50).

```
GET /tasks?q=tap&location=indore&maxBudget=500
```

```json
{
  "tasks": [
    {
      "id": "...",
      "title": "Fix a leaking kitchen tap",
      "budget": 400,
      "status": "open",
      "bidCount": 2,
      "poster": { "name": "Priya Sharma" }
    }
  ],
  "pagination": { "page": 1, "limit": 12, "total": 1, "totalPages": 1 }
}
```

`viewer` is `null` for guests. Otherwise it has `isOwner`, `isHired`, `hasReviewed`, `myBid`, and,
only for the poster and the hired person after hiring, `hired` and `contact`.

## Bids

| Method | Endpoint          | Auth   | Notes                                                   |
| ------ | ----------------- | ------ | ------------------------------------------------------- |
| POST   | `/tasks/:id/bids` | Yes    | `amount, message?, availability?`. 201 new, 200 updated |
| GET    | `/tasks/:id/bids` | Poster | All bids on the task                                    |
| GET    | `/bids/mine`      | Yes    | Your bids with task and status                          |

## Reviews

| Method | Endpoint             | Auth | Notes                                                             |
| ------ | -------------------- | ---- | ----------------------------------------------------------------- |
| POST   | `/tasks/:id/reviews` | Yes  | `rating` (1 to 5), `comment?`. Poster and hired person, once each |

## Other

| Method | Endpoint  | Notes                                                               |
| ------ | --------- | ------------------------------------------------------------------- |
| GET    | `/health` | `{ "status": "ok" }`                                                |
| GET    | `/stats`  | `{ "stats": { "openTasks", "completedTasks", "members", "bids" } }` |
