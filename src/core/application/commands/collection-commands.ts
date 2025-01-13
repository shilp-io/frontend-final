import { BaseCommand } from './base-command';
import { CollectionData } from '@/core/domain';

export interface CreateCollectionCommand extends BaseCommand {
    type: 'CREATE_COLLECTION';
    payload: {
        name: string;
    };
}

export interface UpdateCollectionCommand extends BaseCommand {
    type: 'UPDATE_COLLECTION';
    payload: {
        collectionId: string;
        changes: Partial<CollectionData>;
    };
}

export interface DeleteCollectionCommand extends BaseCommand {
    type: 'DELETE_COLLECTION';
    payload: {
        collectionId: string;
    };
}

export type CollectionCommand =
    | CreateCollectionCommand
    | UpdateCollectionCommand
    | DeleteCollectionCommand;
