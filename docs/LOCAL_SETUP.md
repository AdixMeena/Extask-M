# Run ExTask on your computer

Time needed: about 15 minutes.

## 1. Install the tools

- **Node.js 22.12 or newer** from <https://nodejs.org>. Check with `node -v`.
- A code editor such as VS Code.

Unzip the project, open the `extask` folder in your editor and open a terminal in that folder.

## 2. Install the packages

```bash
npm run setup
```

This installs three sets of packages (root, `server`, `client`) and creates `server/.env` and
`client/.env`.

## 3. Create the Supabase project

1. Sign in at <https://supabase.com> and create a **New project**. Choose a region near India
   (Mumbai or Singapore) and set a database password.
2. Wait until the project is ready.
3. Open **SQL Editor**, start a new query, paste the whole of `server/db/schema.sql` and press
   **Run**. You should see "Success. No rows returned". Running it again is safe.
4. Under **Authentication**, leave the **Email** sign-in provider enabled (it is on by default).
   You do not need SMS or any phone provider.

## 4. Add your keys

Find the values in the **Connect** dialog of your project, or under **Project Settings > API Keys**.
Open `server/.env` and fill in:

| Variable                    | Value                                      |
| --------------------------- | ------------------------------------------ |
| `SUPABASE_URL`              | Project URL, `https://xxxx.supabase.co`    |
| `SUPABASE_ANON_KEY`         | **Publishable** key (`sb_publishable_...`) |
| `SUPABASE_SERVICE_ROLE_KEY` | **Secret** key (`sb_secret_...`)           |
| `PORT`                      | Leave `5050`                               |
| `CLIENT_URL`                | Leave `http://localhost:5173`              |

Older projects show `anon` and `service_role` keys instead. They work in the same two places,
but Supabase is retiring them, so prefer the new keys.

> The secret key can read and change all your data. Keep it only in `server/.env`. Never put it
> in the `client` folder, in GitHub or in a chat.

`client/.env` already points to the local API and needs no change.

## 5. Check, seed and run

```bash
npm run check    # every line should say OK
npm run seed     # optional demo data
npm run dev
```

Open <http://localhost:5173>. Stop with `Ctrl + C`.

Demo logins: `priya`, `ramesh`, `sneha`, `imran`, `kavita`, password `Demo@1234`.
`ramesh` is a phone-only account, so you can also log in with `9000000002`.

To try posting and bidding at the same time, use a normal window for one person and a private
window for the other.

## 6. Give someone the Verified badge

Supabase dashboard > **Table Editor** > `profiles` > find the person > set `id_verified` to
`true` > save. They see it after reloading.

## 7. Run the tests

```bash
npm test             # quick, needs no database
npm run test:e2e     # full flow on your Supabase project; removes its test users afterwards
```

## Common problems

| What you see                                                        | Fix                                                                                               |
| ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| `Missing script` or `Cannot find package`                           | Run `npm run setup` in the `extask` folder                                                        |
| Errors mentioning an unsupported Node version                       | Install Node 22.12 or newer                                                                       |
| `check` says a table does not exist                                 | Run `server/db/schema.sql` in the SQL Editor                                                      |
| `permission denied for table`                                       | Run `schema.sql` again, and check the secret key is in `SUPABASE_SERVICE_ROLE_KEY`                |
| `Invalid API key`                                                   | Copy the keys again, with no spaces or quotes                                                     |
| `fetch failed`                                                      | Check `SUPABASE_URL`; a free project that was idle may be **paused**, restore it in the dashboard |
| Website says "Cannot reach the ExTask server"                       | The API is not running, or `VITE_API_URL` is wrong. Open <http://localhost:5050/api/health>       |
| CORS error in the browser console                                   | `CLIENT_URL` must match the website address exactly                                               |
| `port is already in use`                                            | Close the other terminal. If you change `PORT`, update `VITE_API_URL` too                         |
| Changed a `.env` file and nothing happened                          | Stop and run `npm run dev` again                                                                  |
| "Too many attempts"                                                 | The login limit is 30 tries per 15 minutes. Restart the server while developing                   |
| "An account with that email already exists" but there is no profile | Delete that user under Supabase > Authentication > Users                                          |
