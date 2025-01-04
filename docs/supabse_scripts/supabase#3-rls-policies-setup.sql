-- Enable RLS on all tables
alter table public.projects enable row level security;
alter table public.project_members enable row level security;
alter table public.requirements enable row level security;
alter table public.requirement_dependencies enable row level security;
alter table public.requirement_trace_links enable row level security;
alter table public.collections enable row level security;
alter table public.collection_owners enable row level security;
alter table public.external_docs enable row level security;
alter table public.project_collections enable row level security;
alter table public.project_documents enable row level security;
alter table public.requirement_documents enable row level security;
alter table public.requirement_collections enable row level security;
alter table public.firebase_users enable row level security;
alter table public.user_profiles enable row level security;

-- Create secure view for users with proper RLS
create or replace view users_view with (security_invoker = true) as
select 
  coalesce(au.id, fu.supabase_uid) as id,
  coalesce(au.email, fu.email) as email,
  fu.id as firebase_uid,
  up.display_name,
  up.avatar_url,
  up.job_title,
  up.department,
  up.theme,
  up.notification_preferences,
  up.email_notifications,
  up.timezone,
  up.bio,
  up.tags,
  up.metadata,
  up.last_active_at,
  up.created_at,
  up.updated_at
from user_profiles up
left join auth.users au on up.supabase_uid = au.id
left join firebase_users fu on up.firebase_uid = fu.id;

-- Basic RLS policies for each table
-- Projects policy
create policy "Users can view projects they are members of"
  on projects for select
  using (
    auth.uid() in (
      select user_id 
      from project_members 
      where project_id = id
    )
  );

-- Project members policy
create policy "Users can view project members where they are also members"
  on project_members for select
  using (
    auth.uid() in (
      select user_id 
      from project_members 
      where project_id = project_members.project_id
    )
  );

-- Requirements policy
create policy "Users can view requirements for their projects"
  on requirements for select
  using (
    auth.uid() in (
      select user_id 
      from project_members 
      where project_id = requirements.project_id
    )
  );

-- Collections policy
create policy "Users can view collections they own or are public"
  on collections for select
  using (
    auth.uid() in (
      select user_id 
      from collection_owners 
      where collection_id = id
    ) or access_level = 'public'
  );

-- User profiles policy
create policy "Users can view their own profile"
  on user_profiles for select
  using (auth.uid()::text = supabase_uid::text or auth.uid()::text = firebase_uid);

-- Firebase users policy
create policy "Users can view their own firebase record"
  on firebase_users for select
  using (auth.uid()::text = supabase_uid::text);

-- Junction tables policies
create policy "Users can view their project collections"
  on project_collections for select
  using (
    auth.uid() in (
      select user_id 
      from project_members 
      where project_id = project_collections.project_id
    )
  );

create policy "Users can view their project documents"
  on project_documents for select
  using (
    auth.uid() in (
      select user_id 
      from project_members 
      where project_id = project_documents.project_id
    )
  );

create policy "Users can view requirement documents for their projects"
  on requirement_documents for select
  using (
    exists (
      select 1 
      from requirements r
      join project_members pm on r.project_id = pm.project_id
      where r.id = requirement_documents.requirement_id
      and pm.user_id = auth.uid()
    )
  );

-- Additional security policies as needed
create policy "Users can view requirement dependencies for their projects"
  on requirement_dependencies for select
  using (
    exists (
      select 1 
      from requirements r
      join project_members pm on r.project_id = pm.project_id
      where r.id = requirement_dependencies.requirement_id
      and pm.user_id = auth.uid()
    )
  );

create policy "Users can view requirement trace links for their projects"
  on requirement_trace_links for select
  using (
    exists (
      select 1 
      from requirements r
      join project_members pm on r.project_id = pm.project_id
      where r.id = requirement_trace_links.from_requirement_id
      and pm.user_id = auth.uid()
    )
  );