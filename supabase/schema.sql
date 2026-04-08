create table if not exists public.uploaded_tracks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  original_filename text not null,
  mime_type text not null,
  file_size bigint not null,
  duration_seconds numeric null,
  storage_path text not null unique,
  created_at timestamptz not null default now(),
  user_id uuid null
);

create index if not exists uploaded_tracks_created_at_idx
  on public.uploaded_tracks (created_at desc);

insert into storage.buckets (id, name, public)
values ('uploaded-audio', 'uploaded-audio', false)
on conflict (id) do nothing;
