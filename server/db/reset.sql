-- DANGER: deletes every ExTask table and all the data in them.
-- Use only to start again from zero, then run schema.sql.
-- Sign-in accounts are kept in auth.users. "npm run seed" clears the demo ones;
-- delete any others in Supabase > Authentication > Users.

drop table if exists public.reviews, public.bids, public.tasks, public.profiles cascade;
drop function if exists public.place_bid(uuid, uuid, numeric, text, text);
drop function if exists public.select_bid(uuid, uuid, uuid);
drop function if exists public.cancel_task(uuid, uuid);
drop function if exists public.refresh_rating();
