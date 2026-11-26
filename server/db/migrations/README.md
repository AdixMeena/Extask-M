# Database changes

`../schema.sql` is the starting point (version 1). Once your database holds data,
make changes as small numbered files here and run each one **once** in the
Supabase SQL Editor, in order.

Example, `002_add_task_photo.sql`:

```sql
alter table public.tasks add column if not exists photo_url text;
notify pgrst, 'reload schema';
```

Then:

1. Also add the change to `../schema.sql`, so a fresh install gets it.
2. Update the matching validator, service and page.
3. Commit the SQL file together with the code that needs it.

A new **table** also needs these three lines, or the server cannot use it:

```sql
alter table public.your_table enable row level security;
revoke all on public.your_table from anon, authenticated;
grant select, insert, update, delete on public.your_table to service_role;
```
