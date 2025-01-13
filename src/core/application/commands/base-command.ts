import { TraceLinkType } from '@/core/domain';

// src/core/application/commands/base-command.ts
export interface BaseCommand {
    id: string;
    timestamp: Date;
    userId: string;
    organizationId: string;
    metadata?: Record<string, unknown>;
}

export interface LinkCommand extends BaseCommand {
    type: 'LINK_DOCUMENT';
    payload: {
        sourceId: string;
        targetId: string;
        linkType: TraceLinkType;
    };
}
