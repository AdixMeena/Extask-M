-- =============================================================================
-- ExTask database schema (PostgreSQL on Supabase)
--
-- How to use: Supabase dashboard > SQL Editor > New query > paste this whole
-- file > Run. It is safe to run again: nothing is dropped and existing rows
-- are kept.
--
-- Changing the database later? Do not edit tables by hand. Add a new numbered
-- file in db/migrations/ (see the README there) and run only that file.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table if not exists public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  name          text not null,
  username      text not null unique,
  email         text unique,
  phone         text unique,
  auth_email    text not null unique,   -- the email Supabase Auth signs in with (real or generated)
  bio           text,
  location      text,
  id_verified   boolean not null default false,
  id_details    text,
  rating_avg    numeric(3,2) not null default 0,
  rating_count  int not null default 0,
  created_at    timestamptz not null default now(),
  constraint profiles_contact_required check (email is not null or phone is not null)
);

create table if not exists public.tasks (
  id               uuid primary key default gen_random_uuid(),
  poster_id        uuid not null,
  title            text not null,
  description      text not null,
  category         text,
  budget           numeric(10,2) not null check (budget > 0),
  location         text,
  deadline         date,
  status           text not null default 'open'
                     check (status in ('open','assigned','completed','cancelled')),
  selected_bid_id  uuid,
  created_at       timestamptz not null default now(),
  -- One column to search, so the API can use a single safe ILIKE filter.
  search_text      text generated always as
                     (title || ' ' || description || ' ' || coalesce(category, '')) stored,
  -- Constraints are named because the API refers to them when joining tables.
  constraint tasks_poster_id_fkey
    foreign key (poster_id) references public.profiles(id) on delete cascade
);

create table if not exists public.bids (
  id            uuid primary key default gen_random_uuid(),
  task_id       uuid not null,
  bidder_id     uuid not null,
  amount        numeric(10,2) not null check (amount > 0),
  message       text,
  availability  text,
  status        text not null default 'pending'
                  check (status in ('pending','accepted','rejected')),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  constraint bids_one_per_user unique (task_id, bidder_id),
  constraint bids_task_id_fkey
    foreign key (task_id) references public.tasks(id) on delete cascade,
  constraint bids_bidder_id_fkey
    foreign key (bidder_id) references public.profiles(id) on delete cascade
);

-- tasks and bids point at each other, so this key is added after both exist.
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'tasks_selected_bid_fk') then
    alter table public.tasks
      add constraint tasks_selected_bid_fk
      foreign key (selected_bid_id) references public.bids(id) on delete set null;
  end if;
end $$;

create table if not exists public.reviews (
  id           uuid primary key default gen_random_uuid(),
  task_id      uuid not null,
  reviewer_id  uuid not null,
  reviewee_id  uuid not null,
  rating       int not null check (rating between 1 and 5),
  comment      text,
  created_at   timestamptz not null default now(),
  constraint reviews_once_per_task unique (task_id, reviewer_id),
  constraint reviews_not_self check (reviewer_id <> reviewee_id),
  constraint reviews_task_id_fkey
    foreign key (task_id) references public.tasks(id) on delete cascade,
  constraint reviews_reviewer_id_fkey
    foreign key (reviewer_id) references public.profiles(id) on delete cascade,
  constraint reviews_reviewee_id_fkey
    foreign key (reviewee_id) references public.profiles(id) on delete cascade
);

-- ---------------------------------------------------------------------------
-- Indexes for the queries the app runs most
-- ---------------------------------------------------------------------------

create index if not exists tasks_status_created_idx on public.tasks (status, created_at desc);
create index if not exists tasks_poster_idx         on public.tasks (poster_id);
create index if not exists bids_bidder_idx          on public.bids (bidder_id);
create index if not exists reviews_reviewee_idx     on public.reviews (reviewee_id);

-- ---------------------------------------------------------------------------
-- Functions
--
-- Anything that changes more than one row, or must not race with another
-- request, lives here. A function runs in one transaction: it either fully
-- happens or not at all. "for update" locks the task row so two requests
-- cannot change the same task at the same moment.
--
-- The short error codes (TASK_NOT_OPEN and friends) are translated into
-- friendly messages by server/utils/dbErrors.js.
-- ---------------------------------------------------------------------------

-- Place a bid, or update your own pending bid on the same task.
create or replace function public.place_bid(
  p_task_id      uuid,
  p_bidder_id    uuid,
  p_amount       numeric,
  p_message      text,
  p_availability text
)
returns public.bids
language plpgsql
set search_path = public
as $$
declare
  v_task public.tasks;
  v_bid  public.bids;
begin
  select * into v_task from tasks where id = p_task_id for update;

  if not found then
    raise exception 'TASK_NOT_FOUND';
  end if;
  if v_task.poster_id = p_bidder_id then
    raise exception 'OWN_TASK';
  end if;
  if v_task.status <> 'open' then
    raise exception 'TASK_NOT_OPEN';
  end if;

  insert into bids (task_id, bidder_id, amount, message, availability)
  values (p_task_id, p_bidder_id, p_amount, p_message, p_availability)
  on conflict (task_id, bidder_id) do update
    set amount       = excluded.amount,
        message      = excluded.message,
        availability = excluded.availability,
        updated_at   = now()
    where bids.status = 'pending'
  returning * into v_bid;

  if v_bid.id is null then
    raise exception 'BID_NOT_PENDING';
  end if;

  return v_bid;
end $$;

-- Hire one bidder: task becomes assigned, that bid accepted, the rest rejected.
create or replace function public.select_bid(
  p_task_id   uuid,
  p_bid_id    uuid,
  p_poster_id uuid
)
returns public.tasks
language plpgsql
set search_path = public
as $$
declare
  v_task public.tasks;
begin
  select * into v_task from tasks where id = p_task_id for update;

  if not found then
    raise exception 'TASK_NOT_FOUND';
  end if;
  if v_task.poster_id <> p_poster_id then
    raise exception 'NOT_TASK_OWNER';
  end if;
  if v_task.status <> 'open' then
    raise exception 'TASK_NOT_OPEN';
  end if;
  if not exists (
    select 1 from bids where id = p_bid_id and task_id = p_task_id and status = 'pending'
  ) then
    raise exception 'BID_NOT_FOUND';
  end if;

  update bids
     set status = case when id = p_bid_id then 'accepted' else 'rejected' end,
         updated_at = now()
   where task_id = p_task_id;

  update tasks
     set status = 'assigned', selected_bid_id = p_bid_id
   where id = p_task_id
  returning * into v_task;

  return v_task;
end $$;

-- Cancel an open task and close any bids still waiting on it.
create or replace function public.cancel_task(
  p_task_id   uuid,
  p_poster_id uuid
)
returns public.tasks
language plpgsql
set search_path = public
as $$
declare
  v_task public.tasks;
begin
  select * into v_task from tasks where id = p_task_id for update;

  if not found then
    raise exception 'TASK_NOT_FOUND';
  end if;
  if v_task.poster_id <> p_poster_id then
    raise exception 'NOT_TASK_OWNER';
  end if;
  if v_task.status <> 'open' then
    raise exception 'TASK_NOT_OPEN';
  end if;

  update bids set status = 'rejected', updated_at = now()
   where task_id = p_task_id and status = 'pending';

  update tasks set status = 'cancelled' where id = p_task_id
  returning * into v_task;

  return v_task;
end $$;

-- ---------------------------------------------------------------------------
-- Trigger: keep each user's average rating up to date
-- ---------------------------------------------------------------------------

create or replace function public.refresh_rating()
returns trigger
language plpgsql
-- "security definer" matters: deleting an account also deletes its reviews, and
-- Supabase does that with a role that cannot otherwise touch these tables.
security definer
set search_path = public
as $$
declare
  v_user uuid := coalesce(new.reviewee_id, old.reviewee_id);
begin
  -- Lock the profile first so two reviews arriving together are both counted.
  perform 1 from profiles where id = v_user for update;

  update profiles
     set rating_count = (select count(*) from reviews where reviewee_id = v_user),
         rating_avg   = coalesce(
           (select round(avg(rating), 2) from reviews where reviewee_id = v_user), 0)
   where id = v_user;

  return null;
end $$;

drop trigger if exists reviews_refresh_rating on public.reviews;
create trigger reviews_refresh_rating
  after insert or update or delete on public.reviews
  for each row execute function public.refresh_rating();

-- ---------------------------------------------------------------------------
-- Security
--
-- Only the Express server (secret / service role key) may touch the data.
-- 1. Row level security is ON with no policies, so browser keys see nothing.
-- 2. Browser roles also get no table or function permissions at all.
-- 3. The server's role is granted access explicitly (newer Supabase projects
--    no longer do this automatically).
-- ---------------------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.tasks    enable row level security;
alter table public.bids     enable row level security;
alter table public.reviews  enable row level security;

revoke all on public.profiles, public.tasks, public.bids, public.reviews
  from anon, authenticated;

grant usage on schema public to service_role;
grant select, insert, update, delete
  on public.profiles, public.tasks, public.bids, public.reviews
  to service_role;

revoke execute on function
  public.place_bid(uuid, uuid, numeric, text, text),
  public.select_bid(uuid, uuid, uuid),
  public.cancel_task(uuid, uuid),
  public.refresh_rating()
  from public, anon, authenticated;

grant execute on function
  public.place_bid(uuid, uuid, numeric, text, text),
  public.select_bid(uuid, uuid, uuid),
  public.cancel_task(uuid, uuid)
  to service_role;

-- Tell the Supabase API layer to pick up the new tables and functions now.
notify pgrst, 'reload schema';
