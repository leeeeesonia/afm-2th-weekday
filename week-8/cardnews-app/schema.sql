-- Cardnews — Supabase Postgres schema.
-- 적용 방법:
--   1) Supabase 프로젝트 → SQL Editor에 붙여넣어 실행
--   2) DATABASE_URL을 .env에 설정 (Project Settings → Database → Connection string · Connection pooling 권장)
--
-- 한 명 사용 (Sonia) 가정. 추후 multi-user 시 user_id 컬럼 추가 + RLS.

create table if not exists cardnews_projects (
  id text primary key,
  name text not null,
  template_id text not null,       -- 'essay' | 'brand-story' | 'brand-insight' | 'interview' | 'collection-life'
  status text not null default 'draft' check (status in ('draft', 'done')),
  data jsonb not null default '{}'::jsonb,   -- pages[], overlays[], 모든 props
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists cardnews_projects_updated_at_idx
  on cardnews_projects (updated_at desc);

create index if not exists cardnews_projects_status_idx
  on cardnews_projects (status);

-- (옵션) updated_at 자동 갱신 trigger — 서버가 직접 set 하므로 trigger는 선택사항.
-- create or replace function set_updated_at() returns trigger as $$
-- begin new.updated_at = now(); return new; end; $$ language plpgsql;
-- create trigger cardnews_projects_updated
--   before update on cardnews_projects
--   for each row execute function set_updated_at();
