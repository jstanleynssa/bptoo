-- bptoo.com initial schema

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================
-- CATEGORIES
-- ============================================================
create table categories (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text not null unique,
  description text,
  color text default '#6366f1',
  created_at timestamptz default now()
);

-- Seed default categories
insert into categories (name, slug, description, color) values
  ('Mental Health', 'mental-health', 'Thoughts on bipolar 2, mental wellness, and the journey', '#8b5cf6'),
  ('Creativity', 'creativity', 'The creative process, art, and making things', '#ec4899'),
  ('Projects', 'projects', 'Things I have built or am building', '#3b82f6'),
  ('Ideas', 'ideas', 'Half-baked thoughts and rabbit holes worth exploring', '#f59e0b'),
  ('Life', 'life', 'Everything else', '#10b981');

-- ============================================================
-- TAGS
-- ============================================================
create table tags (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text not null unique,
  created_at timestamptz default now()
);

-- ============================================================
-- POSTS (blog)
-- ============================================================
create table posts (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  slug text not null unique,
  excerpt text,
  content text, -- Tiptap JSON as text / HTML
  cover_image_url text,
  category_id uuid references categories(id) on delete set null,
  status text not null default 'draft' check (status in ('draft', 'published')),
  published_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Post ↔ Tag join
create table post_tags (
  post_id uuid references posts(id) on delete cascade,
  tag_id uuid references tags(id) on delete cascade,
  primary key (post_id, tag_id)
);

-- ============================================================
-- PROJECTS
-- ============================================================
create table projects (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  slug text not null unique,
  description text,
  content text,
  cover_image_url text,
  images text[] default '{}',
  url text,
  github_url text,
  status text not null default 'draft' check (status in ('draft', 'published')),
  featured boolean default false,
  sort_order int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Project ↔ Tag join
create table project_tags (
  project_id uuid references projects(id) on delete cascade,
  tag_id uuid references tags(id) on delete cascade,
  primary key (project_id, tag_id)
);

-- ============================================================
-- ARTWORK
-- ============================================================
create table artwork (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  slug text not null unique,
  description text,
  image_url text not null,
  medium text, -- e.g. "Digital", "Acrylic", "Mixed Media"
  year int,
  status text not null default 'draft' check (status in ('draft', 'published')),
  featured boolean default false,
  sort_order int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Artwork ↔ Tag join
create table artwork_tags (
  artwork_id uuid references artwork(id) on delete cascade,
  tag_id uuid references tags(id) on delete cascade,
  primary key (artwork_id, tag_id)
);

-- ============================================================
-- STORAGE BUCKETS
-- ============================================================
-- Run these in Supabase dashboard or via CLI:
-- supabase storage create media --public

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
-- Posts: public can read published; only authenticated can write
alter table posts enable row level security;
create policy "Public can read published posts" on posts for select using (status = 'published');
create policy "Auth users can do anything with posts" on posts for all using (auth.role() = 'authenticated');

alter table categories enable row level security;
create policy "Public can read categories" on categories for select using (true);
create policy "Auth users can manage categories" on categories for all using (auth.role() = 'authenticated');

alter table tags enable row level security;
create policy "Public can read tags" on tags for select using (true);
create policy "Auth users can manage tags" on tags for all using (auth.role() = 'authenticated');

alter table post_tags enable row level security;
create policy "Public can read post_tags" on post_tags for select using (true);
create policy "Auth users can manage post_tags" on post_tags for all using (auth.role() = 'authenticated');

alter table projects enable row level security;
create policy "Public can read published projects" on projects for select using (status = 'published');
create policy "Auth users can do anything with projects" on projects for all using (auth.role() = 'authenticated');

alter table project_tags enable row level security;
create policy "Public can read project_tags" on project_tags for select using (true);
create policy "Auth users can manage project_tags" on project_tags for all using (auth.role() = 'authenticated');

alter table artwork enable row level security;
create policy "Public can read published artwork" on artwork for select using (status = 'published');
create policy "Auth users can do anything with artwork" on artwork for all using (auth.role() = 'authenticated');

alter table artwork_tags enable row level security;
create policy "Public can read artwork_tags" on artwork_tags for select using (true);
create policy "Auth users can manage artwork_tags" on artwork_tags for all using (auth.role() = 'authenticated');

-- ============================================================
-- UPDATED_AT TRIGGER
-- ============================================================
create or replace function handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger posts_updated_at before update on posts for each row execute procedure handle_updated_at();
create trigger projects_updated_at before update on projects for each row execute procedure handle_updated_at();
create trigger artwork_updated_at before update on artwork for each row execute procedure handle_updated_at();
