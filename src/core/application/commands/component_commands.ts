import { BaseCommand } from './base-command';
import { ComponentData } from '@/core/domain';

export interface CreateComponentCommand extends BaseCommand {
    type: 'CREATE_COMPONENT';
    payload: {
        name: string;
        description: string;
        projectId: string;
    };
}

export interface UpdateComponentCommand extends BaseCommand {
    type: 'UPDATE_COMPONENT';
    payload: {
        componentId: string;
        changes: Partial<ComponentData>;
    };
}

export interface DeleteComponentCommand extends BaseCommand {
    type: 'DELETE_COMPONENT';
    payload: {
        componentId: string;
    };
}

export type ComponentCommand =
    | CreateComponentCommand
    | UpdateComponentCommand
    | DeleteComponentCommand;
