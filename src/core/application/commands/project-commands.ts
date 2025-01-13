// src/core/application/commands/project-commands.ts
import { ProjectData } from '@/core/domain';
import { BaseCommand } from './base-command';

export interface CreateProjectCommand extends BaseCommand {
    type: 'CREATE_PROJECT';
    payload: {
        name: string;
        description: string;
        organizationId: string;
        metadata?: Record<string, unknown>;
    };
}

export interface UpdateProjectCommand extends BaseCommand {
    type: 'UPDATE_PROJECT';
    payload: {
        projectId: string;
        changes: Partial<ProjectData>;
    };
}

export interface DeleteProjectCommand extends BaseCommand {
    type: 'DELETE_PROJECT';
    payload: {
        projectId: string;
    };
}

export type ProjectCommand =
    | CreateProjectCommand
    | UpdateProjectCommand
    | DeleteProjectCommand;
