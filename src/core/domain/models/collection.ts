// src/core/domain/models/collection.ts
import { BaseEntity, UUID } from './common';
import { AccessLevel } from './enums';

export interface Collection extends BaseEntity {
    name: string;
    description: string | null;
    access_level: AccessLevel;
    tags: string[] | null;
    organization_id: UUID | null;
}

export type CollectionData = Partial<Omit<Collection, keyof BaseEntity>>;
