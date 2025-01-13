import { useCallback, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

interface PipelineResponse {
    run_id: string;
}

interface PipelineRunResponse {
    run_id: string;
    state: 'RUNNING' | 'DONE' | 'FAILED';
    outputs?: {
        output: string;
    };
}

interface GumloopOptions {
    skipCache?: boolean;
}

interface StartPipelineParams {
    requirement: string;
    filenames?: string[] | string;
    systemName?: string;
    objective?: string;
}

export function useGumloop(options: GumloopOptions = {}) {
    const [error, setError] = useState<Error | null>(null);
    const queryClient = useQueryClient();

    const uploadFilesMutation = useMutation({
        mutationFn: async (files: File[]): Promise<string[]> => {
            console.log(
                'Uploading files:',
                files.map((f) => ({ name: f.name, size: f.size })),
            );
            const response = await fetch('/api/ai', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'upload',
                    files,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(
                    `Upload failed: ${errorData.error || response.statusText}`,
                );
            }

            const result = await response.json();
            console.log('Upload successful:', result.files);
            return result.files;
        },
        onError: (error: Error) => {
            console.error('File upload error:', error);
            setError(error);
        },
    });

    const startPipelineMutation = useMutation({
        mutationFn: async ({
            requirement,
            filenames,
            systemName,
            objective,
        }: StartPipelineParams): Promise<PipelineResponse> => {
            console.log('Starting pipeline:', {
                requirement,
                filenames,
                systemName,
                objective,
            });
            const response = await fetch('/api/ai', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'startPipeline',
                    requirement,
                    files: filenames,
                    systemName,
                    objective,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(
                    `Pipeline start failed: ${errorData.error || response.statusText}`,
                );
            }

            const result = await response.json();
            console.log('Pipeline started successfully:', result);
            return result;
        },
        onError: (error: Error) => {
            console.error('Pipeline start error:', error);
            setError(error);
        },
    });

    const getPipelineRun = useCallback(
        async (runId: string): Promise<PipelineRunResponse> => {
            console.log('Fetching pipeline run status for runId:', runId);
            const response = await fetch(`/api/ai?runId=${runId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(
                    `Failed to get pipeline status: ${errorData.error || response.statusText}`,
                );
            }

            return response.json();
        },
        [],
    );

    const usePipelineRun = (runId?: string) => {
        return useQuery<PipelineRunResponse, Error>({
            queryKey: ['pipelineRun', runId],
            queryFn: () => getPipelineRun(runId!),
            enabled: !!runId && !options.skipCache,
            refetchInterval: (query) => {
                const state = query.state.data?.state;
                if (state === 'DONE' || state === 'FAILED') {
                    return false;
                }
                return state === 'RUNNING' ? 2000 : false;
            },
        });
    };

    const { mutateAsync: uploadFiles, error: uploadError } =
        uploadFilesMutation;
    const { mutateAsync: startPipeline, error: pipelineError } =
        startPipelineMutation;

    return {
        uploadFiles,
        startPipeline,
        getPipelineRun: usePipelineRun,
        loading:
            uploadFilesMutation.isPending || startPipelineMutation.isPending,
        error: error || uploadError || pipelineError,
        clearCache: useCallback(
            (runId?: string) => {
                console.log('Clearing cache for runId:', runId);
                if (runId) {
                    queryClient.invalidateQueries({
                        queryKey: ['pipelineRun', runId],
                    });
                } else {
                    queryClient.invalidateQueries({
                        queryKey: ['pipelineRun'],
                    });
                }
            },
            [queryClient],
        ),
    };
}
