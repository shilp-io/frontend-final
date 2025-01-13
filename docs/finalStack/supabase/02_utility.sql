-- Create a function for updating updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a function to handle soft deletes
CREATE OR REPLACE FUNCTION soft_delete()
RETURNS TRIGGER AS $$
BEGIN
    NEW.is_deleted = TRUE;
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a function to automatically update version numbers
CREATE OR REPLACE FUNCTION update_version_number()
RETURNS TRIGGER AS $$
BEGIN
    NEW.version = OLD.version + 1;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a function to validate requirement property values
CREATE OR REPLACE FUNCTION validate_requirement_property()
RETURNS TRIGGER AS $$
DECLARE
    schema_record RECORD;
BEGIN
    -- Get the property schema
    SELECT type, validation_rules 
    INTO schema_record 
    FROM component_property_schemas 
    WHERE id = NEW.schema_id;

    -- Type-specific validation
    CASE schema_record.type
        WHEN 'number' THEN
            IF NOT (jsonb_typeof(NEW.value) = 'number') THEN
                NEW.is_valid = FALSE;
            END IF;
        WHEN 'boolean' THEN
            IF NOT (jsonb_typeof(NEW.value) = 'boolean') THEN
                NEW.is_valid = FALSE;
            END IF;
        WHEN 'enum' THEN
            IF NOT (NEW.value <@ schema_record.options) THEN
                NEW.is_valid = FALSE;
            END IF;
        WHEN 'multi_enum' THEN
            IF NOT (NEW.value <@ schema_record.options) THEN
                NEW.is_valid = FALSE;
            END IF;
        -- Add more type validations as needed
    END CASE;

    NEW.last_validated = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;