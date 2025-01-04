-- Create custom types for user preferences and settings
create type user_theme as enum (
  'light', 'dark', 'system'
);

create type notification_preference as enum (
  'all', 'important', 'none'
);

-- Add support for Firebase authentication
create table firebase_users (
  id text primary key,  -- Firebase UID
  email text unique,
  supabase_uid uuid unique references auth.users(id),
  provider text not null default 'firebase',
  created_at timestamp with time zone default now(),
  last_sign_in timestamp with time zone default now()
);

-- Modify user_profiles to work with both auth systems
create table user_profiles (
  id uuid primary key,  -- This can be either auth system
  firebase_uid text references firebase_users(id),
  supabase_uid uuid references auth.users(id),
  display_name text,
  avatar_url text,
  job_title text,
  department text,
  theme user_theme not null default 'system',
  notification_preferences notification_preference not null default 'important',
  email_notifications boolean not null default true,
  timezone text,
  bio text,
  tags text[] default '{}',
  metadata jsonb default '{}',
  last_active_at timestamp with time zone,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  -- Ensure user has either Supabase or Firebase auth
  constraint user_auth_check check (
    (firebase_uid is not null) or (supabase_uid is not null)
  ),
  constraint one_auth_type check (
    (firebase_uid is null and supabase_uid is not null) or
    (firebase_uid is not null and supabase_uid is null)
  )
);

-- Create indexes
create index idx_firebase_users_email on firebase_users(email);
create index idx_user_profiles_firebase_uid on user_profiles(firebase_uid);
create index idx_user_profiles_supabase_uid on user_profiles(supabase_uid);

-- Update the users view to include Firebase users
create or replace view users_view as
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