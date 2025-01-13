// src/core/domain/models/organization.ts
import { BaseEntity } from './common';

export interface Organization extends BaseEntity {
    name: string;
    description: string | null;
    website: string | null;
    logo_url: string | null;
    tags: string[] | null;
}

export type OrganizationData = Partial<Omit<Organization, keyof BaseEntity>>;
