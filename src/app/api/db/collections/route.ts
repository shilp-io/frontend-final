import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdminService } from '@/lib/services/supabaseAdmin';
import { rateLimit } from '@/lib/middleware/rateLimit';
import type { Tables } from '@/types/supabase';

type Collection = Tables<'collections'>;
type CollectionInput = Pick<Collection, 'name' | 'description' | 'parent_id' | 'access_level' | 'metadata'>;

// GET /api/db/collections
export async function GET(req: NextRequest) {
  try {
    const rateLimitResponse = await rateLimit()(req, NextResponse.next());
    if (rateLimitResponse.status === 429) {
      return rateLimitResponse;
    }

    const searchParams = req.nextUrl.searchParams;
    const id = searchParams.get('id');
    const parentId = searchParams.get('parentId');

    const client = supabaseAdminService.getClient();

    if (id) {
      const { data, error } = await client
        .from('collections')
        .select('*')
        .eq('id', id)
        .single();
        
      if (error) throw error;
      return NextResponse.json(data);
    }

    if (parentId) {
      const { data, error } = await client
        .from('collections')
        .select('*')
        .eq('parent_id', parentId);
        
      if (error) throw error;
      return NextResponse.json(data);
    }

    const { data, error } = await client
      .from('collections')
      .select('*');
      
    if (error) throw error;
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in GET /api/db/collections:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

// POST /api/db/collections
export async function POST(req: NextRequest) {
  try {
    const rateLimitResponse = await rateLimit()(req, NextResponse.next());
    if (rateLimitResponse.status === 429) {
      return rateLimitResponse;
    }

    const body = await req.json() as CollectionInput;
    
    if (!body.name) {
      return NextResponse.json(
        { error: 'Collection name is required' },
        { status: 400 }
      );
    }

    const client = supabaseAdminService.getClient();
    const { data: collection, error } = await client
      .from('collections')
      .insert(body)
      .select()
      .single();
      
    if (error) throw error;
    return NextResponse.json(collection, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/db/collections:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

// PUT /api/db/collections
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
        { error: 'Collection ID is required' },
        { status: 400 }
      );
    }

    const client = supabaseAdminService.getClient();
    const { data: collection, error } = await client
      .from('collections')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
      
    if (error) throw error;
    return NextResponse.json(collection);
  } catch (error) {
    console.error('Error in PUT /api/db/collections:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

// DELETE /api/db/collections
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
        { error: 'Collection ID is required' },
        { status: 400 }
      );
    }

    const client = supabaseAdminService.getClient();
    const { error } = await client
      .from('collections')
      .delete()
      .eq('id', id);
      
    if (error) throw error;
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error in DELETE /api/db/collections:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
