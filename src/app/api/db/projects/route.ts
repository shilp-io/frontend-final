import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdminService } from '@/lib/services/supabaseAdmin';
import { rateLimit } from '@/lib/middleware/rateLimit';
import type { Tables } from '@/types/supabase';

type Project = Tables<'projects'>;
type ProjectInput = Pick<Project, 'name' | 'description' | 'status' | 'metadata' | 'created_by'>;

// GET /api/db/projects
export async function GET(req: NextRequest) {
  try {
    const rateLimitResponse = await rateLimit()(req, NextResponse.next());
    if (rateLimitResponse.status === 429) {
      return rateLimitResponse;
    }

    const searchParams = req.nextUrl.searchParams;
    const id = searchParams.get('id');
    const user_id = searchParams.get('user_id');

    const client = supabaseAdminService.getClient();

    if (id) {
      const { data: project, error } = await client
        .from('projects')
        .select('*')
        .eq('id', id)
        .single();
        
      if (error) throw error;
      return NextResponse.json(project);
    }

    let query = client
      .from('projects')
      .select('*');

    if (user_id) {
      query = query.eq('created_by', user_id);
    }

    const { data: projects, error } = await query;
      
    if (error) throw error;
    return NextResponse.json(projects);
  } catch (error) {
    console.error('Error in GET /api/db/projects:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

// POST /api/db/projects
export async function POST(req: NextRequest) {
  try {
    const rateLimitResponse = await rateLimit()(req, NextResponse.next());
    if (rateLimitResponse.status === 429) {
      return rateLimitResponse;
    }

    const body = await req.json() as ProjectInput;
    const client = supabaseAdminService.getClient();
    
    const { data: project, error } = await client
      .from('projects')
      .insert(body)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/db/projects:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

// PUT /api/db/projects
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
        { error: 'Project ID is required' },
        { status: 400 }
      );
    }

    const client = supabaseAdminService.getClient();
    const { data: project, error } = await client
      .from('projects')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(project);
  } catch (error) {
    console.error('Error in PUT /api/db/projects:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

// DELETE /api/db/projects
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
        { error: 'Project ID is required' },
        { status: 400 }
      );
    }

    const client = supabaseAdminService.getClient();

    // First, delete all requirements associated with this project
    const { error: requirementsError } = await client
      .from('requirements')
      .delete()
      .eq('project_id', id);

    if (requirementsError) {
      throw requirementsError;
    }

    // Then delete the project itself
    const { error: projectError } = await client
      .from('projects')
      .delete()
      .eq('id', id);
      
    if (projectError) throw projectError;
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error in DELETE /api/db/projects:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
