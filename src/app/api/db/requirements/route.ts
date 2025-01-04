import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdminService } from '@/lib/services/supabaseAdmin';
import { rateLimit } from '@/lib/middleware/rateLimit';
import type { Tables } from '@/types/supabase';

type Requirement = Tables<'requirements'>;

// GET /api/db/requirements
export async function GET(req: NextRequest) {
  try {
    const rateLimitResponse = await rateLimit()(req, NextResponse.next());
    if (rateLimitResponse.status === 429) {
      return rateLimitResponse;
    }

    const searchParams = req.nextUrl.searchParams;
    const id = searchParams.get('id');
    const projectId = searchParams.get('projectId');
    const subscribe = searchParams.get('subscribe') === 'true';

    const client = supabaseAdminService.getClient();

    // Handle subscription request
    if (subscribe && projectId) {
      const stream = new TransformStream();
      const writer = stream.writable.getWriter();
      const encoder = new TextEncoder();

      // Set up Supabase real-time subscription
      const subscription = client
        .channel('requirements-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'requirements',
            filter: `project_id=eq.${projectId}`
          },
          async (payload) => {
            // Send the update to the client
            const data = JSON.stringify({
              eventType: payload.eventType,
              old: payload.old,
              new: payload.new
            });
            await writer.write(encoder.encode(`data: ${data}\n\n`));
          }
        )
        .subscribe();

      // Clean up subscription when the client disconnects
      req.signal.addEventListener('abort', () => {
        subscription.unsubscribe();
        writer.close();
      });

      return new Response(stream.readable, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive'
        }
      });
    }

    // Handle regular GET requests
    if (id) {
      const { data, error } = await client
        .from('requirements')
        .select('*')
        .eq('id', id)
        .single();
        
      if (error) throw error;
      return NextResponse.json(data);
    }

    if (projectId) {
      const { data, error } = await client
        .from('requirements')
        .select('*')
        .eq('project_id', projectId);
        
      if (error) throw error;
      return NextResponse.json(data);
    }

    const { data, error } = await client
      .from('requirements')
      .select('*');
      
    if (error) throw error;
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in GET /api/db/requirements:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

// POST /api/db/requirements
export async function POST(req: NextRequest) {
  try {
    const rateLimitResponse = await rateLimit()(req, NextResponse.next());
    if (rateLimitResponse.status === 429) {
      return rateLimitResponse;
    }

    const data = await req.json();
    
    if (!data.project_id) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      );
    }

    const client = supabaseAdminService.getClient();
    const { data: requirement, error } = await client
      .from('requirements')
      .insert(data)
      .select()
      .single();
      
    if (error) throw error;
    return NextResponse.json(requirement, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/db/requirements:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

// PUT /api/db/requirements
export async function PUT(req: NextRequest) {
  try {
    const rateLimitResponse = await rateLimit()(req, NextResponse.next());
    if (rateLimitResponse.status === 429) {
      return rateLimitResponse;
    }

    const data = await req.json();
    const { id, ...updates } = data;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Requirement ID is required' },
        { status: 400 }
      );
    }

    const client = supabaseAdminService.getClient();
    const { data: requirement, error } = await client
      .from('requirements')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
      
    if (error) throw error;
    return NextResponse.json(requirement);
  } catch (error) {
    console.error('Error in PUT /api/db/requirements:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

// DELETE /api/db/requirements
export async function DELETE(req: NextRequest) {
  try {
    const rateLimitResponse = await rateLimit()(req, NextResponse.next());
    if (rateLimitResponse.status === 429) {
      return rateLimitResponse;
    }

    const searchParams = req.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Requirement ID is required' },
        { status: 400 }
      );
    }

    const client = supabaseAdminService.getClient();
    const { error } = await client
      .from('requirements')
      .delete()
      .eq('id', id);
      
    if (error) throw error;
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error in DELETE /api/db/requirements:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
