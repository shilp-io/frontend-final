import { BaseCommand } from './base-command';
import { ExternalDocData } from '@/core/domain';

export interface CreateDocumentCommand extends BaseCommand {
    type: 'CREATE_DOCUMENT';
    payload: {
        title: string;
        url: string;
    };
}

export interface UpdateDocumentCommand extends BaseCommand {
    type: 'UPDATE_DOCUMENT';
    payload: {
        documentId: string;
        changes: Partial<ExternalDocData>;
    };
}

export interface DeleteDocumentCommand extends BaseCommand {
    type: 'DELETE_DOCUMENT';
    payload: {
        documentId: string;
    };
}

export type DocumentCommand =
    | CreateDocumentCommand
    | UpdateDocumentCommand
    | DeleteDocumentCommand;
