# Kaizen Survey — Supabase Setup

This app uses the existing external Supabase project
`https://wgltvbdpqhfngtwmsxou.supabase.co` (shared with *Astro Voyage Launch*).

Run the SQL below **once** in the Supabase SQL editor to set up the table,
RLS policies, the `user_roles` table, and a `has_role` helper. Then create an
admin user.

## 1. SQL

```sql
-- ============ Roles ============
do $$ begin
  create type public.app_role as enum ('admin', 'user');
exception when duplicate_object then null; end $$;

create table if not exists public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role public.app_role not null,
  unique (user_id, role)
);

grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;

alter table public.user_roles enable row level security;

drop policy if exists "users read own roles" on public.user_roles;
create policy "users read own roles"
on public.user_roles for select to authenticated
using (user_id = auth.uid());

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = _user_id and role = _role
  )
$$;

-- ============ Survey responses ============
create table if not exists public.kaizen_survey_responses (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),

  full_name text not null,
  email text not null,
  company text not null,
  role text,
  msme_size text,
  industry text,

  rating_content int not null check (rating_content between 1 and 5),
  rating_facilitator int not null check (rating_facilitator between 1 and 5),
  rating_pace int not null check (rating_pace between 1 and 5),
  rating_relevance int not null check (rating_relevance between 1 and 5),
  rating_materials int not null check (rating_materials between 1 and 5),
  overall_nps int not null check (overall_nps between 0 and 10),

  understood_kaizen int not null check (understood_kaizen between 1 and 5),
  understood_dmaic int not null check (understood_dmaic between 1 and 5),
  understood_gemba int not null check (understood_gemba between 1 and 5),
  understood_5s int not null check (understood_5s between 1 and 5),
  understood_pokayoke int not null check (understood_pokayoke between 1 and 5),
  confidence_to_apply int not null check (confidence_to_apply between 1 and 5),
  key_takeaway text,

  top_defect text,
  root_cause_hypothesis text,
  plan_30_days text,
  plan_60_days text,
  plan_90_days text,
  expected_annual_savings_inr numeric,
  additional_comments text
);

grant insert on public.kaizen_survey_responses to anon, authenticated;
grant select on public.kaizen_survey_responses to authenticated;
grant all on public.kaizen_survey_responses to service_role;

alter table public.kaizen_survey_responses enable row level security;

-- Anyone (including unauthenticated visitors) can submit a response
drop policy if exists "anyone can submit" on public.kaizen_survey_responses;
create policy "anyone can submit"
on public.kaizen_survey_responses for insert
to anon, authenticated
with check (true);

-- Only admins can read responses
drop policy if exists "admins can read" on public.kaizen_survey_responses;
create policy "admins can read"
on public.kaizen_survey_responses for select
to authenticated
using (public.has_role(auth.uid(), 'admin'));
```

## 2. Create an admin user

1. Supabase Dashboard → **Authentication → Users → Add user** → create with
   email + password (tick "Auto Confirm User").
2. Copy that user's UUID and run:

```sql
insert into public.user_roles (user_id, role)
values ('PASTE-USER-UUID-HERE', 'admin');
```

That user can now sign in at `/admin`, see all responses, and export to
CSV / Excel.

## 3. Migration — form simplification (run once)

The form was simplified in a later revision:

- `Role / designation` and `MSME size` inputs were removed.
- The entire **Session feedback** section was removed (5 ratings + NPS).
- The Learning-outcomes description was reworded.

To stop the existing NOT NULL / CHECK constraints from blocking new inserts,
run this in the Supabase SQL editor:

```sql
alter table public.kaizen_survey_responses
  alter column rating_content     drop not null,
  alter column rating_facilitator drop not null,
  alter column rating_pace        drop not null,
  alter column rating_relevance   drop not null,
  alter column rating_materials   drop not null,
  alter column overall_nps        drop not null;
```

(The CHECK constraints are fine to leave — they only fire when a value is
provided, and the new form no longer sends one.)

Existing rows keep their old values; new submissions will store `NULL` for
those columns.

## 4. Migration — add `opportunities` column (run once)

A new open-ended "Opportunities" question was added to the form. Add the
column to capture it:

```sql
alter table public.kaizen_survey_responses
  add column if not exists opportunities text;
```


