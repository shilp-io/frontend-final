-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For better text search

-- Create ENUM types
CREATE TYPE entity_status AS ENUM ('draft', 'active', 'on_hold', 'completed', 'archived');
CREATE TYPE requirement_status AS ENUM ('draft', 'pending_review', 'approved', 'in_progress', 'testing', 'completed', 'rejected');
CREATE TYPE requirement_priority AS ENUM ('critical', 'high', 'medium', 'low');
CREATE TYPE access_level AS ENUM ('private', 'project', 'organization', 'public');
CREATE TYPE trace_link_type AS ENUM ('derives_from', 'implements', 'relates_to', 'conflicts_with', 'is_related_to', 'parent_of', 'child_of');
CREATE TYPE member_role AS ENUM ('owner', 'manager', 'contributor', 'viewer');
CREATE TYPE document_type AS ENUM ('specification', 'reference', 'documentation', 'standard', 'guideline', 'report');
CREATE TYPE requirement_level AS ENUM ('system', 'sub_system', 'component');
CREATE TYPE user_theme AS ENUM ('light', 'dark', 'system');
CREATE TYPE notification_preference AS ENUM ('all', 'important', 'none');
CREATE TYPE requirement_format AS ENUM ('ears', 'incose');
CREATE TYPE assignment_role AS ENUM ('assignee', 'reviewer', 'observer');
CREATE TYPE property_type AS ENUM ('text', 'number', 'boolean', 'date', 'enum', 'multi_enum', 'rich_text', 'url', 'user_reference', 'requirement_reference', 'component_reference');