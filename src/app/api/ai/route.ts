import { NextRequest, NextResponse } from 'next/server';
import { gumloopService } from '@/lib/services/gumloop';
import { rateLimit } from '@/lib/middleware/rateLimit';

interface UploadRequest {
    action: 'upload';
    files: File[];
}

interface StartPipelineRequest {
    action: 'startPipeline';
    requirement: string;
    files?: string[] | string;
    systemName?: string;
    objective?: string;
}

interface GetPipelineStatusRequest {
    action: 'getPipelineStatus';
    runId: string;
}

function isUploadRequest(body: unknown): body is UploadRequest {
    return typeof body === 'object' && body !== null && 'action' in body && 
           (body as UploadRequest).action === 'upload' && Array.isArray((body as UploadRequest).files);
}

function isStartPipelineRequest(body: unknown): body is StartPipelineRequest {
    return typeof body === 'object' && body !== null && 'action' in body && 
           (body as StartPipelineRequest).action === 'startPipeline' && 
           typeof (body as StartPipelineRequest).requirement === 'string';
}

function isGetPipelineStatusRequest(body: unknown): body is GetPipelineStatusRequest {
    return typeof body === 'object' && body !== null && 'action' in body && 
           (body as GetPipelineStatusRequest).action === 'getPipelineStatus' && 
           typeof (body as GetPipelineStatusRequest).runId === 'string';
}

// Apply rate limiting middleware
const rateLimitMiddleware = rateLimit({
    maxRequests: 20, // 20 requests per minute
    windowMs: 60 * 1000 // 1 minute
});

export async function POST(request: NextRequest) {
    try {
        // Apply rate limiting
        const response = NextResponse.next();
        const rateLimitResponse = await rateLimitMiddleware(request, response);
        if (rateLimitResponse.status !== 200) {
            return rateLimitResponse;
        }

        // Parse and validate request body
        const body = await request.json();

        if (!body.action) {
            return NextResponse.json(
                { error: 'Action is required' },
                { status: 400 }
            );
        }

        switch (body.action) {
            case 'upload':
                if (!isUploadRequest(body)) {
                    return NextResponse.json(
                        { error: 'Invalid upload request format' },
                        { status: 400 }
                    );
                }
                const uploadedFiles = await gumloopService.uploadFiles(body.files);
                return NextResponse.json({ success: true, files: uploadedFiles });

            case 'startPipeline':
                if (!isStartPipelineRequest(body)) {
                    return NextResponse.json(
                        { error: 'Invalid pipeline request format' },
                        { status: 400 }
                    );
                }
                const pipelineResponse = await gumloopService.startPipeline(
                    body.requirement,
                    body.files,
                    body.systemName,
                    body.objective
                );
                return NextResponse.json(pipelineResponse);

            case 'getPipelineStatus':
                if (!isGetPipelineStatusRequest(body)) {
                    return NextResponse.json(
                        { error: 'Invalid status request format' },
                        { status: 400 }
                    );
                }
                const status = await gumloopService.getPipelineRun(body.runId);
                return NextResponse.json(status);

            default:
                return NextResponse.json(
                    { error: 'Invalid action' },
                    { status: 400 }
                );
        }
    } catch (error) {
        console.error('API error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'An error occurred' },
            { status: 500 }
        );
    }
}

// GET method for pipeline status checks
export async function GET(request: NextRequest) {
    try {
        // Apply rate limiting
        const response = NextResponse.next();
        const rateLimitResponse = await rateLimitMiddleware(request, response);
        if (rateLimitResponse.status !== 200) {
            return rateLimitResponse;
        }

        const runId = request.nextUrl.searchParams.get('runId');
        if (!runId) {
            return NextResponse.json(
                { error: 'Run ID is required' },
                { status: 400 }
            );
        }

        const status = await gumloopService.getPipelineRun(runId);
        return NextResponse.json(status);
    } catch (error) {
        console.error('API error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'An error occurred' },
            { status: 500 }
        );
    }
}
