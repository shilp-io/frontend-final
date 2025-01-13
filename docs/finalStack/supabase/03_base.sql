-- Base tables
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    website TEXT,
    logo_url TEXT,
    tags TEXT[],
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    created_by UUID,
    updated_by UUID,
    metadata JSONB,
    version INTEGER DEFAULT 1,
    is_deleted BOOLEAN DEFAULT FALSE
);

CREATE TABLE user_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    firebase_uid TEXT UNIQUE,
    display_name TEXT,
    avatar_url TEXT,
    job_title TEXT,
    department TEXT,
    bio TEXT,
    tags TEXT[],
    organization_id UUID REFERENCES organizations(id),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    created_by UUID,
    updated_by UUID,
    metadata JSONB,
    version INTEGER DEFAULT 1,
    is_deleted BOOLEAN DEFAULT FALSE
);

CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    status entity_status NOT NULL DEFAULT 'draft',
    start_date TIMESTAMPTZ,
    target_end_date TIMESTAMPTZ,
    actual_end_date TIMESTAMPTZ,
    tags TEXT[],
    access_level access_level NOT NULL DEFAULT 'private',
    organization_id UUID REFERENCES organizations(id),
    project_owner_id UUID NOT NULL REFERENCES user_profiles(id),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    created_by UUID,
    updated_by UUID,
    metadata JSONB,
    version INTEGER DEFAULT 1,
    is_deleted BOOLEAN DEFAULT FALSE
);

CREATE TABLE components (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    status entity_status NOT NULL DEFAULT 'draft',
    tags TEXT[],
    default_property_values JSONB,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    created_by UUID,
    updated_by UUID,
    metadata JSONB,
    version INTEGER DEFAULT 1,
    is_deleted BOOLEAN DEFAULT FALSE
);

CREATE TABLE collections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    access_level access_level NOT NULL DEFAULT 'private',
    tags TEXT[],
    organization_id UUID REFERENCES organizations(id),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    created_by UUID,
    updated_by UUID,
    metadata JSONB,
    version INTEGER DEFAULT 1,
    is_deleted BOOLEAN DEFAULT FALSE
);

CREATE TABLE requirements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    component_id UUID NOT NULL REFERENCES components(id),
    title TEXT,
    description TEXT,
    priority requirement_priority NOT NULL DEFAULT 'medium',
    status requirement_status NOT NULL DEFAULT 'draft',
    level requirement_level NOT NULL DEFAULT 'system',
    original_content TEXT NOT NULL,
    enhanced_content JSONB,
    selected_format requirement_format,
    tags TEXT[],
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    created_by UUID,
    updated_by UUID,
    metadata JSONB,
    version INTEGER DEFAULT 1,
    is_deleted BOOLEAN DEFAULT FALSE
);