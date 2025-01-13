-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- Create custom types
create type project_status as enum (
  'draft', 'active', 'on_hold', 'completed', 'archived'
);

create type requirement_priority as enum (
  'critical', 'high', 'medium', 'low'
);

create type requirement_status as enum (
  'draft', 'pending_review', 'approved', 'in_progress', 'testing', 'completed', 'rejected'
);

create type document_type as enum (
  'specification', 'reference', 'documentation', 'standard', 'guideline', 'report'
);

create type collection_access_level as enum (
  'private', 'project', 'organization', 'public'
);

create type member_role as enum (
  'owner', 'manager', 'contributor', 'viewer'
);

create type trace_link_type as enum (
  'derives_from', 'implements', 'relates_to', 'conflicts_with'
);

-- Create tables
create table projects (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  description text,
  status project_status not null default 'draft',
  start_date timestamp with time zone,
  target_end_date timestamp with time zone,
  actual_end_date timestamp with time zone,
  tags text[] default '{}',
  metadata jsonb default '{}',
  version integer not null default 1,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id)
);

create table project_members (
  project_id uuid references projects(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  role member_role not null default 'viewer',
  joined_at timestamp with time zone default now(),
  primary key (project_id, user_id)
);

create table requirements (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid references projects(id) on delete cascade,
  parent_id uuid references requirements(id),
  title text not null,
  description text,
  acceptance_criteria text[] default '{}',
  priority requirement_priority not null default 'medium',
  status requirement_status not null default 'draft',
  assigned_to uuid references auth.users(id),
  reviewer uuid references auth.users(id),
  tags text[] default '{}',
  metadata jsonb default '{}',
  version integer not null default 1,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id)
);

create table requirement_dependencies (
  requirement_id uuid references requirements(id) on delete cascade,
  depends_on_id uuid references requirements(id) on delete cascade,
  primary key (requirement_id, depends_on_id),
  check (requirement_id != depends_on_id)
);

create table requirement_trace_links (
  from_requirement_id uuid references requirements(id) on delete cascade,
  to_requirement_id uuid references requirements(id) on delete cascade,
  link_type trace_link_type not null,
  primary key (from_requirement_id, to_requirement_id, link_type),
  check (from_requirement_id != to_requirement_id)
);

create table collections (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  description text,
  parent_id uuid references collections(id),
  access_level collection_access_level not null default 'private',
  tags text[] default '{}',
  metadata jsonb default '{}',
  version integer not null default 1,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id)
);

create table collection_owners (
  collection_id uuid references collections(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  primary key (collection_id, user_id)
);

create table external_docs (
  id uuid primary key default uuid_generate_v4(),
  collection_id uuid references collections(id) on delete cascade,
  title text not null,
  url text not null,
  type document_type not null,
  version_info text,
  author text,
  publication_date timestamp with time zone,
  last_verified_date timestamp with time zone,
  status text not null default 'active',
  tags text[] default '{}',
  metadata jsonb default '{}',
  version integer not null default 1,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id)
);

-- Junction tables for many-to-many relationships
create table project_collections (
  project_id uuid references projects(id) on delete cascade,
  collection_id uuid references collections(id) on delete cascade,
  primary key (project_id, collection_id)
);

create table project_documents (
  project_id uuid references projects(id) on delete cascade,
  document_id uuid references external_docs(id) on delete cascade,
  primary key (project_id, document_id)
);

create table requirement_documents (
  requirement_id uuid references requirements(id) on delete cascade,
  document_id uuid references external_docs(id) on delete cascade,
  primary key (requirement_id, document_id)
);

create table requirement_collections (
  requirement_id uuid references requirements(id) on delete cascade,
  collection_id uuid references collections(id) on delete cascade,
  primary key (requirement_id, collection_id)
);

-- Create indexes for better query performance
create index idx_projects_status on projects(status);
create index idx_requirements_project_id on requirements(project_id);
create index idx_requirements_status on requirements(status);
create index idx_requirements_assigned_to on requirements(assigned_to);
create index idx_collections_access_level on collections(access_level);
create index idx_external_docs_collection_id on external_docs(collection_id);

-- Create updated_at triggers
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_projects_updated_at
  before update on projects
  for each row
  execute function update_updated_at();

create trigger update_requirements_updated_at
  before update on requirements
  for each row
  execute function update_updated_at();

create trigger update_collections_updated_at
  before update on collections
  for each row
  execute function update_updated_at();

create trigger update_external_docs_updated_at
  before update on external_docs
  for each row
  execute function update_updated_at();