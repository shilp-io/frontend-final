// src/core/application/commands/requirement-commands.ts
import { BaseCommand } from './base-command';
import { RequirementData, RequirementPriority } from '@/core/domain';

export interface CreateRequirementCommand extends BaseCommand {
    type: 'CREATE_REQUIREMENT';
    payload: {
        projectId: string;
        title: string;
        description: string;
        priority: RequirementPriority;
        sourceDocIds: string[];
    };
}

export interface UpdateRequirementCommand extends BaseCommand {
    type: 'UPDATE_REQUIREMENT';
    payload: {
        requirementId: string;
        changes: Partial<RequirementData>;
    };
}

export interface DeleteRequirementCommand extends BaseCommand {
    type: 'DELETE_REQUIREMENT';
    payload: {
        requirementId: string;
    };
}

export type RequirementCommand =
    | CreateRequirementCommand
    | UpdateRequirementCommand
    | DeleteRequirementCommand;
