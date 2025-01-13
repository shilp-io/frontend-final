-- Create a table to track requirement versions
CREATE TABLE requirement_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    requirement_id UUID NOT NULL REFERENCES requirements(id),
    content JSONB NOT NULL,
    change_reason TEXT,
    changed_by UUID REFERENCES user_profiles(id),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    version INTEGER NOT NULL
);

-- Index for requirement versions
CREATE INDEX idx_requirement_versions_requirement_id ON requirement_versions(requirement_id);