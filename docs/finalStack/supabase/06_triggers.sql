-- Create updated_at triggers for all tables
CREATE TRIGGER update_organizations_updated_at
    BEFORE UPDATE ON organizations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_projects_updated_at
    BEFORE UPDATE ON projects
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_components_updated_at
    BEFORE UPDATE ON components
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_collections_updated_at
    BEFORE UPDATE ON collections
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_requirements_updated_at
    BEFORE UPDATE ON requirements
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_project_components_updated_at
    BEFORE UPDATE ON project_components
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_entity_members_updated_at
    BEFORE UPDATE ON entity_members
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_entity_assignments_updated_at
    BEFORE UPDATE ON entity_assignments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_component_property_schemas_updated_at
    BEFORE UPDATE ON component_property_schemas
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_requirement_property_values_updated_at
    BEFORE UPDATE ON requirement_property_values
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- Create soft delete triggers for all tables
CREATE TRIGGER soft_delete_organizations
    BEFORE DELETE ON organizations
    FOR EACH ROW
    EXECUTE FUNCTION soft_delete();

CREATE TRIGGER soft_delete_user_profiles
    BEFORE DELETE ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION soft_delete();

CREATE TRIGGER soft_delete_projects
    BEFORE DELETE ON projects
    FOR EACH ROW
    EXECUTE FUNCTION soft_delete();

CREATE TRIGGER soft_delete_components
    BEFORE DELETE ON components
    FOR EACH ROW
    EXECUTE FUNCTION soft_delete();

CREATE TRIGGER soft_delete_collections
    BEFORE DELETE ON collections
    FOR EACH ROW
    EXECUTE FUNCTION soft_delete();

CREATE TRIGGER soft_delete_requirements
    BEFORE DELETE ON requirements
    FOR EACH ROW
    EXECUTE FUNCTION soft_delete();

CREATE TRIGGER soft_delete_project_components
    BEFORE DELETE ON project_components
    FOR EACH ROW
    EXECUTE FUNCTION soft_delete();

CREATE TRIGGER soft_delete_entity_members
    BEFORE DELETE ON entity_members
    FOR EACH ROW
    EXECUTE FUNCTION soft_delete();

CREATE TRIGGER soft_delete_entity_assignments
    BEFORE DELETE ON entity_assignments
    FOR EACH ROW
    EXECUTE FUNCTION soft_delete();

CREATE TRIGGER soft_delete_component_property_schemas
    BEFORE DELETE ON component_property_schemas
    FOR EACH ROW
    EXECUTE FUNCTION soft_delete();

CREATE TRIGGER soft_delete_requirement_property_values
    BEFORE DELETE ON requirement_property_values
    FOR EACH ROW
    EXECUTE FUNCTION soft_delete();

-- Create version update triggers for all tables
CREATE TRIGGER update_organizations_version
    BEFORE UPDATE ON organizations
    FOR EACH ROW
    EXECUTE FUNCTION update_version_number();

CREATE TRIGGER update_user_profiles_version
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_version_number();

CREATE TRIGGER update_projects_version
    BEFORE UPDATE ON projects
    FOR EACH ROW
    EXECUTE FUNCTION update_version_number();

CREATE TRIGGER update_components_version
    BEFORE UPDATE ON components
    FOR EACH ROW
    EXECUTE FUNCTION update_version_number();

CREATE TRIGGER update_collections_version
    BEFORE UPDATE ON collections
    FOR EACH ROW
    EXECUTE FUNCTION update_version_number();

CREATE TRIGGER update_requirements_version
    BEFORE UPDATE ON requirements
    FOR EACH ROW
    EXECUTE FUNCTION update_version_number();

CREATE TRIGGER update_project_components_version
    BEFORE UPDATE ON project_components
    FOR EACH ROW
    EXECUTE FUNCTION update_version_number();

CREATE TRIGGER update_entity_members_version
    BEFORE UPDATE ON entity_members
    FOR EACH ROW
    EXECUTE FUNCTION update_version_number();

CREATE TRIGGER update_entity_assignments_version
    BEFORE UPDATE ON entity_assignments
    FOR EACH ROW
    EXECUTE FUNCTION update_version_number();

CREATE TRIGGER update_component_property_schemas_version
    BEFORE UPDATE ON component_property_schemas
    FOR EACH ROW
    EXECUTE FUNCTION update_version_number();

CREATE TRIGGER update_requirement_property_values_version
    BEFORE UPDATE ON requirement_property_values
    FOR EACH ROW
    EXECUTE FUNCTION update_version_number();

-- Create a function to track requirement changes
CREATE OR REPLACE FUNCTION track_requirement_changes()
RETURNS TRIGGER AS $$
BEGIN
    -- Only track changes if the row is being updated
    IF (TG_OP = 'UPDATE') THEN
        -- Insert a new version into the requirement_versions table
        INSERT INTO requirement_versions (
            requirement_id,
            content,
            change_reason,
            changed_by,
            created_at,
            updated_at,
            version
        ) VALUES (
            NEW.id, -- The ID of the updated requirement
            jsonb_build_object(
                'title', NEW.title,
                'description', NEW.description,
                'priority', NEW.priority,
                'status', NEW.status,
                'level', NEW.level,
                'original_content', NEW.original_content,
                'enhanced_content', NEW.enhanced_content,
                'selected_format', NEW.selected_format,
                'tags', NEW.tags,
                'metadata', NEW.metadata
            ), -- Capture all relevant fields in a JSONB object
            NEW.metadata->>'change_reason', -- Extract change reason from metadata
            NEW.updated_by, -- The user who made the update
            CURRENT_TIMESTAMP, -- Timestamp for the version
            CURRENT_TIMESTAMP, -- Timestamp for the version
            NEW.version -- The version number of the requirement
        );
    END IF;

    -- Return the new row for the update to proceed
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger for requirement version tracking
CREATE TRIGGER track_requirement_changes_trigger
    AFTER UPDATE ON requirements
    FOR EACH ROW
    EXECUTE FUNCTION track_requirement_changes();

-- Create a trigger to validate requirement property values
CREATE TRIGGER validate_requirement_property_trigger
    BEFORE INSERT OR UPDATE ON requirement_property_values
    FOR EACH ROW
    EXECUTE FUNCTION validate_requirement_property();