const GUMLOOP_API_KEY = process.env.NEXT_PUBLIC_GUMLOOP_API_KEY;
const GUMLOOP_API_URL =
    process.env.NEXT_PUBLIC_GUMLOOP_API_URL || 'https://api.gumloop.com/api/v1';
const USER_ID = process.env.NEXT_PUBLIC_GUMLOOP_USER_ID;
const SAVED_ITEM_ID = process.env.NEXT_PUBLIC_GUMLOOP_SAVED_ITEM_ID;

// Validate required environment variables
if (!GUMLOOP_API_KEY) {
    throw new Error(
        'Missing required environment variable: NEXT_PUBLIC_GUMLOOP_API_KEY',
    );
}

if (!USER_ID) {
    throw new Error(
        'Missing required environment variable: NEXT_PUBLIC_GUMLOOP_USER_ID',
    );
}

if (!SAVED_ITEM_ID) {
    throw new Error(
        'Missing required environment variable: NEXT_PUBLIC_GUMLOOP_SAVED_ITEM_ID',
    );
}

// After validation, we can safely assert these as strings
const validatedApiKey = GUMLOOP_API_KEY as string;
const validatedUserId = USER_ID as string;
const validatedSavedItemId = SAVED_ITEM_ID as string;

interface PipelineInput {
    input_name: string;
    value: string;
}

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

export class GumloopService {
    private static instance: GumloopService;

    private constructor() {}

    public static getInstance(): GumloopService {
        if (!GumloopService.instance) {
            GumloopService.instance = new GumloopService();
        }
        return GumloopService.instance;
    }

    async uploadFiles(files: File[]): Promise<string[]> {
        console.log(
            'Starting file upload process:',
            files.map((f) => ({ name: f.name, size: f.size, type: f.type })),
        );

        if (files.length === 0) {
            throw new Error('Please upload at least one PDF file');
        }

        // Validate all files are PDFs
        for (const file of files) {
            if (!file.type.includes('pdf')) {
                console.error(
                    'Invalid file type detected:',
                    file.type,
                    'for file:',
                    file.name,
                );
                throw new Error(
                    `Only PDF files are accepted. Invalid file: ${file.name}`,
                );
            }
        }

        try {
            // Convert files to base64 and create payload
            console.log('Beginning base64 encoding for', files.length, 'files');
            const encodedFiles = await Promise.all(
                files.map(async (file) => {
                    return new Promise<string>((resolve, reject) => {
                        const reader = new FileReader();
                        reader.onload = () => {
                            const base64 = (reader.result as string).split(
                                ',',
                            )[1];
                            console.log(
                                `Successfully encoded file: ${file.name} (${Math.round(base64.length / 1024)}KB)`,
                            );
                            resolve(base64);
                        };
                        reader.onerror = (error) => {
                            console.error(
                                'FileReader error for file:',
                                file.name,
                                error,
                            );
                            reject(error);
                        };
                        reader.readAsDataURL(file);
                    });
                }),
            );

            const payload = {
                user_id: validatedUserId,
                files: files.map((file, index) => ({
                    file_name: file.name,
                    file_content: encodedFiles[index],
                })),
            };

            console.log('Making API request to upload files');
            const response = await fetch(`${GUMLOOP_API_URL}/upload_files`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${validatedApiKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Upload API error:', {
                    status: response.status,
                    statusText: response.statusText,
                    responseBody: errorText,
                });
                throw new Error(
                    `Server error: ${response.status} ${response.statusText}`,
                );
            }

            const uploadResult = await response.json();
            console.log('Upload result:', uploadResult.success);
            return uploadResult.uploaded_files;
        } catch (error) {
            console.error('Upload process failed:', error);
            const errorMessage =
                error instanceof Error
                    ? error.message
                    : 'Unknown error occurred';
            throw new Error(`Failed to upload files: ${errorMessage}`);
        }
    }

    async startPipeline(
        requirement: string,
        filenames?: string[] | string,
        systemName?: string,
        objective?: string,
    ): Promise<PipelineResponse> {
        console.log('Starting pipeline with params:', {
            filenames,
            systemName,
            objective,
            requirement,
        });

        const pipelineInputs: PipelineInput[] = [];

        // Convert filenames to array if it's a string
        const filenamesArray =
            typeof filenames === 'string'
                ? filenames.split(',').map((f) => f.trim())
                : filenames;

        console.log('Processed filenames:', filenamesArray);

        if (filenamesArray?.length) {
            pipelineInputs.push({
                input_name: 'Upload Regulation Document Here - PDF Format Only',
                value: filenamesArray[0],
            });
        }

        if (systemName) {
            pipelineInputs.push({
                input_name:
                    'System Name [Product/Feature/System/Subsystem/Component]',
                value: systemName,
            });
        }

        if (objective) {
            pipelineInputs.push({
                input_name: 'Objective:',
                value: objective,
            });
        }

        if (requirement) {
            pipelineInputs.push({
                input_name: 'Requirement: ',
                value: requirement,
            });
        }

        console.log('Prepared pipeline inputs:', pipelineInputs);

        try {
            console.log('Making API request to start pipeline');
            const response = await fetch(`${GUMLOOP_API_URL}/start_pipeline`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${validatedApiKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    user_id: validatedUserId,
                    saved_item_id: validatedSavedItemId,
                    pipeline_inputs: pipelineInputs,
                }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Start pipeline API error:', {
                    status: response.status,
                    statusText: response.statusText,
                    responseBody: errorText,
                });
                throw new Error(
                    `Failed to start pipeline: ${response.status} ${response.statusText}`,
                );
            }

            const result = await response.json();
            console.log('Pipeline started successfully:', result);
            return result;
        } catch (error) {
            console.error('Start pipeline process failed:', error);
            const errorMessage =
                error instanceof Error
                    ? error.message
                    : 'Unknown error occurred';
            throw new Error(`Failed to start pipeline: ${errorMessage}`);
        }
    }

    async getPipelineRun(runId: string): Promise<PipelineRunResponse> {
        console.log('Getting pipeline run status:', {
            runId,
            userId: validatedUserId,
        });

        try {
            console.log('Making API request to get pipeline run');
            const response = await fetch(
                `${GUMLOOP_API_URL}/get_pl_run?run_id=${runId}&user_id=${validatedUserId}`,
                {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${validatedApiKey}`,
                        'Content-Type': 'application/json',
                    },
                },
            );

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Get pipeline run API error:', {
                    status: response.status,
                    statusText: response.statusText,
                    responseBody: errorText,
                });
                throw new Error(
                    `Failed to get pipeline run status: ${response.status} ${response.statusText}`,
                );
            }

            const result = await response.json();
            console.log('Pipeline run status retrieved:', result);
            return result;
        } catch (error) {
            console.error('Get pipeline run process failed:', error);
            const errorMessage =
                error instanceof Error
                    ? error.message
                    : 'Unknown error occurred';
            throw new Error(
                `Failed to get pipeline run status: ${errorMessage}`,
            );
        }
    }
}

// Export a singleton instance
export const gumloopService = GumloopService.getInstance();
