-- Выполнить один раз в Supabase → SQL Editor.
create table if not exists public.projects (
  slug text primary key check (slug ~ '^[a-z0-9-]+$'),
  title text not null,
  type text default '',
  lead text default '',
  project_date text default '',
  category text not null check (category in ('Apartment','House','Commercial')),
  city text default '',
  area text default '',
  rooms text default '',
  team text default '',
  docs text default '',
  visual text default '',
  cover_url text not null,
  plan_url text default '',
  plan_note text default '',
  show_plan boolean not null default true,
  gallery jsonb not null default '[]'::jsonb check (jsonb_typeof(gallery) = 'array'),
  published boolean not null default true,
  sort_order integer not null default 0,
  updated_at timestamptz not null default now()
);

alter table public.projects enable row level security;

create or replace function public.is_cms_admin()
returns boolean
language sql
stable
set search_path = ''
as $$
  select coalesce((select auth.uid()) = 'eda34486-95b6-46f6-9465-ba5404e5dace'::uuid, false)
$$;
revoke all on function public.is_cms_admin() from public, anon;
grant execute on function public.is_cms_admin() to authenticated;

revoke all on table public.projects from anon, authenticated;
grant select on table public.projects to anon;
grant select, insert, update, delete on table public.projects to authenticated;

drop policy if exists "Published projects are public" on public.projects;
create policy "Published projects are public" on public.projects for select to anon using (published = true);
drop policy if exists "Admins can read all projects" on public.projects;
create policy "Admins can read all projects" on public.projects for select to authenticated using ((select public.is_cms_admin()));
drop policy if exists "Admins can create projects" on public.projects;
create policy "Admins can create projects" on public.projects for insert to authenticated with check ((select public.is_cms_admin()));
drop policy if exists "Admins can update projects" on public.projects;
create policy "Admins can update projects" on public.projects for update to authenticated using ((select public.is_cms_admin())) with check ((select public.is_cms_admin()));
drop policy if exists "Admins can delete projects" on public.projects;
create policy "Admins can delete projects" on public.projects for delete to authenticated using ((select public.is_cms_admin()));

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('project-media', 'project-media', true, 15728640, array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set
  public = true,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public project images" on storage.objects;
create policy "Public project images" on storage.objects for select to public using (bucket_id = 'project-media');
drop policy if exists "Admins upload project images" on storage.objects;
create policy "Admins upload project images" on storage.objects for insert to authenticated with check (bucket_id = 'project-media' and (select public.is_cms_admin()));
drop policy if exists "Admins update project images" on storage.objects;
create policy "Admins update project images" on storage.objects for update to authenticated using (bucket_id = 'project-media' and (select public.is_cms_admin())) with check (bucket_id = 'project-media' and (select public.is_cms_admin()));
drop policy if exists "Admins delete project images" on storage.objects;
create policy "Admins delete project images" on storage.objects for delete to authenticated using (bucket_id = 'project-media' and (select public.is_cms_admin()));

create or replace function public.touch_project_updated_at()
returns trigger language plpgsql as $$ begin new.updated_at = now(); return new; end $$;
drop trigger if exists projects_touch_updated_at on public.projects;
create trigger projects_touch_updated_at before update on public.projects
for each row execute function public.touch_project_updated_at();
