import { useCallback, useState } from 'react';
import { useMutation, useQuery, useQueryClient, Query } from '@tanstack/react-query';

interface PipelineResponse {
  run_id: string;
}

interface PipelineRunResponse {
  run_id: string;
  state: string;
  outputs?: {
    output: string;
  };
}

interface GumloopOptions {
  skipCache?: boolean;
}

export function useGumloop(options: GumloopOptions = {}) {
  const [error, setError] = useState<Error | null>(null);
  const queryClient = useQueryClient();

  const uploadFilesMutation = useMutation({
    mutationFn: async (files: File[]) => {
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'upload',
          files
        }),
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const result = await response.json();
      return result.files;
    }
  });

  const startPipelineMutation = useMutation({
    mutationFn: async ({
      requirement,
      filenames,
      systemName,
      objective
    }: {
      requirement: string;
      filenames?: string[] | string;
      systemName?: string;
      objective?: string;
    }): Promise<PipelineResponse> => {
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
          objective
        }),
      });

      if (!response.ok) {
        throw new Error(`Pipeline start failed: ${response.statusText}`);
      }

      return response.json();
    }
  });

  const getPipelineRun = useCallback(async (runId: string): Promise<PipelineRunResponse> => {
    const response = await fetch(`/api/ai?runId=${runId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to get pipeline status: ${response.statusText}`);
    }

    return response.json();
  }, []);

  const usePipelineRun = (runId?: string) => {
    return useQuery({
      queryKey: ['pipelineRun', runId],
      queryFn: () => getPipelineRun(runId!),
      enabled: !!runId && !options.skipCache,
      refetchInterval: (query) => {
        // Refetch every 2 seconds while the pipeline is running
        return query.state.data?.state === 'RUNNING' ? 2000 : false;
      }
    });
  };

  return {
    uploadFiles: uploadFilesMutation.mutateAsync,
    startPipeline: startPipelineMutation.mutateAsync,
    getPipelineRun: usePipelineRun,
    loading: uploadFilesMutation.isPending || startPipelineMutation.isPending,
    error: error || uploadFilesMutation.error || startPipelineMutation.error,
    clearCache: useCallback((runId?: string) => {
      if (runId) {
        queryClient.invalidateQueries({ queryKey: ['pipelineRun', runId] });
      } else {
        queryClient.invalidateQueries({ queryKey: ['pipelineRun'] });
      }
    }, [queryClient])
  };
} 