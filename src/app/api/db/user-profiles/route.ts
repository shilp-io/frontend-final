import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdminService } from '@/lib/services/supabaseAdmin';
import { rateLimit } from '@/lib/middleware/rateLimit';
import type { Tables } from '@/types/supabase';

type UserProfile = Tables<'user_profiles'>;

// GET /api/db/user-profiles
export async function GET(req: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResponse = await rateLimit()(req, NextResponse.next());
    if (rateLimitResponse.status === 429) {
      return rateLimitResponse;
    }

    const searchParams = req.nextUrl.searchParams;
    const id = searchParams.get('id');
    const firebaseUid = searchParams.get('firebaseUid');
    const supabaseUid = searchParams.get('supabaseUid');

    const supabase = supabaseAdminService.getClient();

    if (id) {
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', id)
        .single();
        
      if (error) throw error;
      return NextResponse.json(profile);
    }

    if (firebaseUid) {
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('firebase_uid', firebaseUid)
        .single();
        
      if (error) throw error;
      return NextResponse.json(profile);
    }

    if (supabaseUid) {
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('supabase_uid', supabaseUid)
        .single();
        
      if (error) throw error;
      return NextResponse.json(profile);
    }

    // List all profiles using admin access
    const { data: profiles, error } = await supabase
      .from('user_profiles')
      .select('*');
      
    if (error) throw error;
    return NextResponse.json(profiles);
  } catch (error) {
    console.error('Error in GET /api/db/user-profiles:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

// POST /api/db/user-profiles
export async function POST(req: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResponse = await rateLimit()(req, NextResponse.next());
    if (rateLimitResponse.status === 429) {
      return rateLimitResponse;
    }

    const data = await req.json();
    
    // Validate required fields
    if (!data.firebase_uid) {
      return NextResponse.json(
        { error: 'Firebase UID is required' },
        { status: 400 }
      );
    }

    // Set default values
    if (data.email_notifications === undefined) {
      data.email_notifications = true;
    }

    const supabase = supabaseAdminService.getClient();
    
    // Insert directly with admin client to bypass RLS
    const { data: profile, error } = await supabase
      .from('user_profiles')
      .insert({
        id: crypto.randomUUID(),
        firebase_uid: data.firebase_uid,
        display_name: data.display_name || data.email?.split('@')[0] || null,
        email: data.email || null,
        avatar_url: data.avatar_url || null,
        email_notifications: data.email_notifications ?? true,
        theme: 'system',
        notification_preferences: 'important',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();
      
    if (error) throw error;
    return NextResponse.json(profile, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/db/user-profiles:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

// PUT /api/db/user-profiles
export async function PUT(req: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResponse = await rateLimit()(req, NextResponse.next());
    if (rateLimitResponse.status === 429) {
      return rateLimitResponse;
    }

    const data = await req.json();
    const { id, ...updates } = data;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Profile ID is required' },
        { status: 400 }
      );
    }

    const supabase = supabaseAdminService.getClient();
    const { data: profile, error } = await supabase
      .from('user_profiles')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
      
    if (error) throw error;
    return NextResponse.json(profile);
  } catch (error) {
    console.error('Error in PUT /api/db/user-profiles:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

// DELETE /api/db/user-profiles
export async function DELETE(req: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResponse = await rateLimit()(req, NextResponse.next());
    if (rateLimitResponse.status === 429) {
      return rateLimitResponse;
    }

    const searchParams = req.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Profile ID is required' },
        { status: 400 }
      );
    }

    const supabase = supabaseAdminService.getClient();
    const { error } = await supabase
      .from('user_profiles')
      .delete()
      .eq('id', id);
      
    if (error) throw error;
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error in DELETE /api/db/user-profiles:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An unexpected error occurred' },
      { status: 500 }
    );
  }
} 