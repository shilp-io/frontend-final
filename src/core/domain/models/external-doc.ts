// src/core/domain/models/external-doc.ts
import { BaseEntity, UUID, ISODateTime } from './common';
import { DocumentType } from './enums';

export interface ExternalDoc extends BaseEntity {
    title: string;
    url: string;
    type: DocumentType;
    version_info: string | null;
    author: string | null;
    publication_date: ISODateTime | null;
    last_verified_date: ISODateTime | null;
    status: string;
    tags: string[] | null;
    organization_id: UUID | null;
}