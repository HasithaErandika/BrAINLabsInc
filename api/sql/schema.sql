-- ─────────────────────────────────────────────────────────────────────────────
-- BrAIN Labs — Supabase PostgreSQL Schema + RLS Policies
-- Run this in the Supabase SQL Editor (or use supabase db push)
-- ─────────────────────────────────────────────────────────────────────────────

-- ─────────────────────────────────────────────────────────────────────────────
-- PROFILES  (extends Supabase auth.users)
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists profiles (
  id          uuid references auth.users primary key,
  full_name   text,
  email       text unique,
  avatar_url  text,
  role        text not null default 'researcher'
    check (role in ('super_admin', 'researcher')),
  institution text not null default 'BrAIN Labs',
  created_at  timestamptz not null default now()
);

-- Auto-create profile on Google sign-up
create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ─────────────────────────────────────────────────────────────────────────────
-- PUBLICATIONS
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists publications (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  authors     text[]  not null default '{}',
  abstract    text,
  doi         text unique,
  year        int,
  tags        text[] not null default '{}',
  pdf_url     text,
  venue       text,
  status      text not null default 'draft' check (status in ('draft', 'published')),
  created_by  uuid references profiles(id) on delete set null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Auto-update updated_at
create or replace function touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

create trigger publications_updated_at before update on publications
  for each row execute procedure touch_updated_at();

-- ─────────────────────────────────────────────────────────────────────────────
-- EVENTS
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists events (
  id           uuid primary key default gen_random_uuid(),
  title        text not null,
  description  text,
  event_date   timestamptz,
  location     text,
  type         text check (type in ('seminar', 'workshop', 'conference')),
  tags         text[] not null default '{}',
  banner_url   text,
  max_capacity int not null default 100,
  status       text not null default 'draft' check (status in ('draft', 'published')),
  created_by   uuid references profiles(id) on delete set null,
  created_at   timestamptz not null default now()
);

create table if not exists registrations (
  id            uuid primary key default gen_random_uuid(),
  event_id      uuid not null references events(id) on delete cascade,
  name          text not null,
  email         text not null,
  registered_at timestamptz not null default now(),
  unique (event_id, email)
);

-- ─────────────────────────────────────────────────────────────────────────────
-- BLOG POSTS
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists blog_posts (
  id           uuid primary key default gen_random_uuid(),
  title        text not null,
  slug         text unique not null,
  content      text,
  excerpt      text,
  cover_url    text,
  tags         text[] not null default '{}',
  status       text not null default 'draft' check (status in ('draft', 'published')),
  published_at timestamptz,
  created_by   uuid references profiles(id) on delete set null,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create trigger blog_posts_updated_at before update on blog_posts
  for each row execute procedure touch_updated_at();

-- ─────────────────────────────────────────────────────────────────────────────
-- RESEARCH ARTICLES
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists research_articles (
  id            uuid primary key default gen_random_uuid(),
  title         text not null,
  authors       text[] not null default '{}',
  abstract      text,
  content       text,
  pdf_url       text,
  tags          text[] not null default '{}',
  research_area text check (research_area in (
    'Large Language Models',
    'Neuromorphic Computing',
    'Spiking Neural Networks',
    'AI Security',
    'Neuroscience and Health'
  )),
  status        text not null default 'draft' check (status in ('draft', 'published')),
  created_by    uuid references profiles(id) on delete set null,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create trigger research_updated_at before update on research_articles
  for each row execute procedure touch_updated_at();

-- ─────────────────────────────────────────────────────────────────────────────
-- ROW LEVEL SECURITY
-- ─────────────────────────────────────────────────────────────────────────────
alter table profiles          enable row level security;
alter table publications      enable row level security;
alter table events            enable row level security;
alter table registrations     enable row level security;
alter table blog_posts        enable row level security;
alter table research_articles enable row level security;

-- Helpers
create or replace function is_super_admin()
returns boolean language sql security definer as $$
  select exists (
    select 1 from profiles where id = auth.uid() and role = 'super_admin'
  );
$$;

-- PUBLIC: read published content (for brainlabsinc.org)
create policy "Public read publications" on publications
  for select using (status = 'published');

create policy "Public read events" on events
  for select using (status = 'published');

create policy "Public read blog posts" on blog_posts
  for select using (status = 'published');

create policy "Public read research" on research_articles
  for select using (status = 'published');

-- RESEARCHERS: CRUD own content
create policy "Researcher own publications" on publications
  for all using (auth.uid() = created_by);

create policy "Researcher own events" on events
  for all using (auth.uid() = created_by);

create policy "Researcher own blog posts" on blog_posts
  for all using (auth.uid() = created_by);

create policy "Researcher own research" on research_articles
  for all using (auth.uid() = created_by);

-- SUPER ADMIN: full access to everything
create policy "Super admin publications" on publications
  for all using (is_super_admin());

create policy "Super admin events" on events
  for all using (is_super_admin());

create policy "Super admin blog posts" on blog_posts
  for all using (is_super_admin());

create policy "Super admin research" on research_articles
  for all using (is_super_admin());

create policy "Super admin profiles" on profiles
  for all using (is_super_admin());

-- Profiles: users can read their own
create policy "Own profile read" on profiles
  for select using (auth.uid() = id);

create policy "Own profile update" on profiles
  for update using (auth.uid() = id);

-- Registrations: anyone can insert; super_admin can read all
create policy "Public register event" on registrations
  for insert with check (true);

create policy "Super admin registrations" on registrations
  for select using (is_super_admin());
