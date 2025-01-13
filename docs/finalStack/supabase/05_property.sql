-- Property related tables
CREATE TABLE component_property_schemas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    component_id UUID NOT NULL REFERENCES components(id),
    key TEXT NOT NULL,
    display_name TEXT NOT NULL,
    type property_type NOT NULL,
    default_value JSONB,
    validation_rules JSONB,
    options JSONB,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    created_by UUID,
    updated_by UUID,
    metadata JSONB,
    version INTEGER DEFAULT 1,
    is_deleted BOOLEAN DEFAULT FALSE,
    UNIQUE(component_id, key)
);

CREATE TABLE requirement_property_values (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    requirement_id UUID NOT NULL REFERENCES requirements(id),
    schema_id UUID NOT NULL REFERENCES component_property_schemas(id),
    value JSONB NOT NULL,
    is_valid BOOLEAN NOT NULL DEFAULT TRUE,
    last_validated TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    created_by UUID,
    updated_by UUID,
    metadata JSONB,
    version INTEGER DEFAULT 1,
    is_deleted BOOLEAN DEFAULT FALSE,
    UNIQUE(requirement_id, schema_id)
);