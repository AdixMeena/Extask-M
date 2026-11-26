# Deploy ExTask

One GitHub repository, one Supabase project, **two Vercel projects**.

| Part           | Where    | Root directory |
| -------------- | -------- | -------------- |
| Database, auth | Supabase | none           |
| Express API    | Vercel   | `server`       |
| React website  | Vercel   | `client`       |

Do [local setup](LOCAL_SETUP.md) first. It is much easier to fix problems on your own computer.

## 1. Supabase

You can use the same project as local development.

1. SQL Editor: run `server/db/schema.sql` (skip if already done).
2. Note the **Project URL**, **publishable** key and **secret** key.

## 2. Push the code to GitHub

Create an empty repository on <https://github.com/new>, then in the `extask` folder:

```bash
git init
git add .
git status          # make sure no ".env" file is listed (".env.example" is fine)
git commit -m "ExTask version 1"
git branch -M main
git remote add origin https://github.com/YOUR_NAME/extask.git
git push -u origin main
```

## 3. Deploy the API

1. In Vercel choose **Add New > Project** and import the repository.
2. Project name: for example `extask-api`.
3. **Root Directory:** `server`. The framework is detected as Express. Leave build settings empty.
4. Add these **Environment Variables**:

   | Name                        | Value                           |
   | --------------------------- | ------------------------------- |
   | `SUPABASE_URL`              | your project URL                |
   | `SUPABASE_ANON_KEY`         | publishable key                 |
   | `SUPABASE_SERVICE_ROLE_KEY` | secret key                      |
   | `CLIENT_URL`                | `http://localhost:5173` for now |

   Do not add `PORT`.

5. Deploy. Open `https://YOUR-API.vercel.app/api/health`; it should show `{"status":"ok"}`.
6. Open `https://YOUR-API.vercel.app/api/tasks`; it should list tasks (or an empty list). This
   proves the database connection works.

## 4. Deploy the website

1. **Add New > Project**, import the same repository again.
2. Project name: for example `extask`.
3. **Root Directory:** `client`. Framework preset **Vite**, build command `npm run build`, output
   directory `dist`.
4. Environment variable:

   | Name           | Value                             |
   | -------------- | --------------------------------- |
   | `VITE_API_URL` | `https://YOUR-API.vercel.app/api` |

5. Deploy and copy the website address.

`client/vercel.json` already makes deep links such as `/tasks/123` work after a refresh.

## 5. Connect the two

1. Open the **API** project > Settings > Environment Variables.
2. Change `CLIENT_URL` to the website address, for example `https://extask.vercel.app`.
3. **Redeploy** the API (Deployments > latest > Redeploy). Variables only apply to new
   deployments.

Use the main production address. Preview addresses differ for every deployment; to allow more
than one, separate them with commas in `CLIENT_URL`.

## 6. Test the live site

Register two accounts, post a task, bid, hire, complete and rate. Refresh on a task page.

To run the automated flow or seed the live database, point `server/.env` at the same Supabase
project and run `npm run test:e2e` or `npm run seed` on your computer.

> The demo accounts share a public password. After your presentation, remove them with
> `npm run seed -- --remove`.

## Updating after a change

```bash
npm run lint && npm test && npm run build
git add .
git commit -m "Describe the change"
git push
```

Vercel redeploys both projects by itself. If you added a database change, run its SQL file from
`server/db/migrations/` in Supabase **before** pushing.

If a deployment breaks, Vercel > Deployments > pick the last good one > **Promote to Production**.

## Fallback: API on Render

If the API gives trouble on Vercel, keep the website there and create a **Web Service** on Render
(Railway is similar):

| Setting        | Value                  |
| -------------- | ---------------------- |
| Root directory | `server`               |
| Build command  | `npm install`          |
| Start command  | `npm start`            |
| Variables      | the same four as above |

Then set `VITE_API_URL` on the website project to the new address plus `/api` and redeploy it.
No code changes are needed.

## Troubleshooting

| Problem                                 | Fix                                                                       |
| --------------------------------------- | ------------------------------------------------------------------------- |
| API says "The server is not configured" | Add the missing variables, then redeploy                                  |
| API build or function fails             | Check Root Directory is `server`; read Vercel > Logs                      |
| CORS error on the website               | `CLIENT_URL` must equal the website address; redeploy the API             |
| Website calls `localhost`               | `VITE_API_URL` was missing at build time; add it and redeploy the website |
| 404 on every API call from the website  | `VITE_API_URL` must end in `/api`                                         |
| API asks you to log in to Vercel        | You opened a protected preview URL; use the production domain             |
| Everything fails after some days        | The free Supabase project may be paused; restore it in the dashboard      |

Free plans and their limits change, so check them a few days before your demo, and keep a local
copy running as a backup.
