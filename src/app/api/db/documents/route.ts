import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdminService } from '@/lib/services/supabaseAdmin';
import { rateLimit } from '@/lib/middleware/rateLimit';
import type { Tables } from '@/types/supabase';

type Document = Tables<'external_docs'>;
type DocumentInput = Pick<Document, 'title' | 'url' | 'type' | 'collection_id' | 'status' | 'metadata' | 'last_verified_date'>;

// GET /api/db/documents
export async function GET(req: NextRequest) {
  try {
    const rateLimitResponse = await rateLimit()(req, NextResponse.next());
    if (rateLimitResponse.status === 429) {
      return rateLimitResponse;
    }

    const searchParams = req.nextUrl.searchParams;
    const id = searchParams.get('id');
    const collectionId = searchParams.get('collectionId');
    const type = searchParams.get('type');

    const client = supabaseAdminService.getClient();

    if (id) {
      const { data: document, error } = await client
        .from('external_docs')
        .select()
        .eq('id', id)
        .single();
        
      if (error) throw error;
      return NextResponse.json(document);
    }

    let query = client
      .from('external_docs')
      .select();
     
    if (collectionId) query = query.eq('collection_id', collectionId);
    if (type) query = query.eq('type', type);
     
    const { data: documents, error } = await query;
    if (error) throw error;

    return NextResponse.json(documents);
  } catch (error) {
    console.error('Error in GET /api/db/documents:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

// POST /api/db/documents
export async function POST(req: NextRequest) {
  try {
    const rateLimitResponse = await rateLimit()(req, NextResponse.next());
    if (rateLimitResponse.status === 429) {
      return rateLimitResponse;
    }

    const body = await req.json() as DocumentInput;
    
    if (!body.title || !body.url || !body.type) {
      return NextResponse.json(
        { error: 'Title, URL, and type are required' },
        { status: 400 }
      );
    }

    if (!body.status) body.status = 'active';
    if (!body.last_verified_date) body.last_verified_date = new Date().toISOString();

    const client = supabaseAdminService.getClient();
    const { data: document, error } = await client
      .from('external_docs')
      .insert(body)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(document, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/db/documents:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

// PUT /api/db/documents
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
        { error: 'Document ID is required' },
        { status: 400 }
      );
    }

    if (updates.url) {
      updates.last_verified_date = new Date().toISOString();
    }

    const client = supabaseAdminService.getClient();
    const { data: document, error } = await client
      .from('external_docs')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(document);
  } catch (error) {
    console.error('Error in PUT /api/db/documents:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

// DELETE /api/db/documents
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
        { error: 'Document ID is required' },
        { status: 400 }
      );
    }

    const client = supabaseAdminService.getClient();
    const { error } = await client
      .from('external_docs')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error in DELETE /api/db/documents:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
