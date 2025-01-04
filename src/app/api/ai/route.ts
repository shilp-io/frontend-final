import { NextRequest, NextResponse } from 'next/server';
import { gumloopService } from '@/lib/services/gumloop';
import { rateLimit } from '@/lib/middleware/rateLimit';

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
        const { action, files, requirement, systemName, objective, runId } = body;

        if (!action) {
            return NextResponse.json(
                { error: 'Action is required' },
                { status: 400 }
            );
        }

        switch (action) {
            case 'upload':
                if (!files || !Array.isArray(files)) {
                    return NextResponse.json(
                        { error: 'Files array is required for upload' },
                        { status: 400 }
                    );
                }
                const uploadedFiles = await gumloopService.uploadFiles(files);
                return NextResponse.json({ success: true, files: uploadedFiles });

            case 'startPipeline':
                if (!requirement) {
                    return NextResponse.json(
                        { error: 'Requirement is required for pipeline start' },
                        { status: 400 }
                    );
                }
                const pipelineResponse = await gumloopService.startPipeline(
                    requirement,
                    files,
                    systemName,
                    objective
                );
                return NextResponse.json(pipelineResponse);

            case 'getPipelineStatus':
                if (!runId) {
                    return NextResponse.json(
                        { error: 'Run ID is required for status check' },
                        { status: 400 }
                    );
                }
                const status = await gumloopService.getPipelineRun(runId);
                return NextResponse.json(status);

            default:
                return NextResponse.json(
                    { error: 'Invalid action' },
                    { status: 400 }
                );
        }
    } catch (error) {
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'An error occurred' },
            { status: 500 }
        );
    }
}

// Optionally support GET method for pipeline status checks
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
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'An error occurred' },
            { status: 500 }
        );
    }
}
