import type { Database } from "@/types";
import type { Collection, Project, Requirement, ExternalDoc } from "@/types";

export type DatabaseEntity<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];

export type DatabaseQueryResult<T> = {
  data: T[];
  error: Error | null;
};

type EntityMap = {
  collections: Collection;
  projects: Project;
  requirements: Requirement;
  external_docs: ExternalDoc;
};

export function mapDatabaseEntity<T extends keyof EntityMap>(
  entity: DatabaseEntity<T> | null,
): EntityMap[T] | null {
  if (!entity) return null;

  // Preserve null values for timestamps
  const mapped = {
    ...entity,
    created_at: entity.created_at,
    updated_at: entity.updated_at,
    created_by: entity.created_by,
    updated_by: entity.updated_by,
  };

  return mapped as EntityMap[T];
}

export function mapDatabaseEntities<T extends keyof EntityMap>(
  entities: DatabaseEntity<T>[] | null,
): EntityMap[T][] {
  if (!entities) return [];
  return entities
    .map((entity) => mapDatabaseEntity<T>(entity)!)
    .filter(Boolean);
}
