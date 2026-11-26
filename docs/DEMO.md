# Presentation guide

## Before you start

- `npm run seed` for fresh demo data, then `npm run dev`.
- Open a normal window (the poster) and a private window (the doer).
- Have the Supabase Table Editor open in another tab.
- Open the site once beforehand if it is deployed, so nothing is asleep or paused.

## Five demo steps

1. **The idea and login.** Show the home page (headline, the string joining problem, skill and
   ExTask). In window 1 log in as `priya` / `Demo@1234`. In window 2 log in with the phone number
   `9000000002` (Ramesh, a phone-only account, no OTP).
2. **Post a task.** As Priya, post "Fix a broken switchboard", Rs 350, Indore. Point at the live
   card preview, then show the new row in the Supabase `tasks` table.
3. **Bid.** As Ramesh, find it using search and send a bid of Rs 300. In Priya's window the bid
   slides in within ten seconds without reloading.
4. **Hire.** As Priya, select the bid. The HIRED stamp lands, other bids are declined, and only
   these two now see each other's contact details. Show Ramesh's **My bids**.
5. **Complete and rate.** Priya marks it completed (the checkmark draws), both give stars, and
   Ramesh's profile shows the new average with the Verified badge.

If time allows, show the phone layout (browser device toolbar) and `npm test`.

## College requirements

| Requirement                       | Where it is                                         |
| --------------------------------- | --------------------------------------------------- |
| Front end (own UI, not API based) | `client/`: every screen is written in React         |
| Back end                          | `server/`: Express REST API with the business rules |
| Database connectivity             | `server/services/` to PostgreSQL on Supabase        |

## Likely viva questions

**Why not call Supabase from React?** Rules and secrets belong on the server. The browser could be
edited by anyone; the API cannot.

**Where is the password?** Supabase Auth stores it hashed in `auth.users`. Our tables have no
password column.

**How does phone login work without OTP?** The server keeps an `auth_email` for each profile (a
generated one for phone-only users), looks it up and signs in with it. The trade-off: the phone
number is not verified.

**What if two requests hire at the same moment?** `select_bid` locks the task row (`for update`),
so the second request waits, sees the task is no longer open and is refused.

**What is row level security doing here?** It is on with no policies, so browser keys can read
nothing. The server's secret key bypasses it, which is why it must never leak.

**How is the average rating updated?** A database trigger on `reviews` recalculates it.

**How do you stop invalid data?** zod validators on every input, plus database constraints
(budget above 0, rating 1 to 5, one bid per person per task).

**What is not built?** Payments, chat, maps, admin panel, mobile app and password reset.

**"India's first": can you support that?** It is the project's tagline. Check what similar services
exist before the presentation, and be ready to explain what is different or to soften the claim.

## For the report and synopsis

- Write the database as **PostgreSQL (Supabase)**, and list Supabase and Express.js under tools.
- The UML document still mentions MongoDB collections and `passwordHash`; update it to PostgreSQL
  tables, with passwords handled by Supabase Auth.
