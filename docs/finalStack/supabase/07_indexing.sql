-- Create useful indexes
CREATE INDEX idx_user_profiles_firebase_uid ON user_profiles(firebase_uid);
CREATE INDEX idx_components_name_trgm ON components USING gin (name gin_trgm_ops);
CREATE INDEX idx_requirements_component_id ON requirements(component_id);
CREATE INDEX idx_project_components_project_id ON project_components(project_id);
CREATE INDEX idx_requirements_status ON requirements(status);
CREATE INDEX idx_requirements_priority ON requirements(priority);
CREATE INDEX idx_entity_members_entity_id ON entity_members(entity_id);
CREATE INDEX idx_entity_assignments_entity_id ON entity_assignments(entity_id);
CREATE INDEX idx_organizations_name_trgm ON organizations USING gin (name gin_trgm_ops);
CREATE INDEX idx_projects_name_trgm ON projects USING gin (name gin_trgm_ops);
CREATE INDEX idx_collections_name_trgm ON collections USING gin (name gin_trgm_ops);
CREATE INDEX idx_requirements_title_trgm ON requirements USING gin (title gin_trgm_ops);
CREATE INDEX idx_requirements_description_trgm ON requirements USING gin (description gin_trgm_ops);
CREATE INDEX idx_entity_members_user_id ON entity_members(user_id);
CREATE INDEX idx_entity_assignments_user_id ON entity_assignments(user_id);
CREATE INDEX idx_component_property_schemas_component_id ON component_property_schemas(component_id);
CREATE INDEX idx_requirement_property_values_requirement_id ON requirement_property_values(requirement_id);