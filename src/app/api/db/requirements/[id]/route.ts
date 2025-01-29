import { NextRequest, NextResponse } from "next/server";
import { supabaseAdminService } from "@/lib/services/supabaseAdmin";
import { rateLimit } from "@/lib/middleware/rateLimit";

// GET /api/db/requirements/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const rateLimitResponse = await rateLimit()(request, NextResponse.next());
    if (rateLimitResponse.status === 429) {
      return rateLimitResponse;
    }

    const { id } = await params;
    const client = supabaseAdminService.getClient();
    const { data, error } = await client
      .from("requirements")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in GET /api/db/requirements/[id]:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
      },
      { status: 500 },
    );
  }
}

// PUT /api/db/requirements/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const rateLimitResponse = await rateLimit()(request, NextResponse.next());
    if (rateLimitResponse.status === 429) {
      return rateLimitResponse;
    }

    const { id } = await params;
    const updates = await request.json();
    const client = supabaseAdminService.getClient();
    const { data: requirement, error } = await client
      .from("requirements")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(requirement);
  } catch (error) {
    console.error("Error in PUT /api/db/requirements/[id]:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
      },
      { status: 500 },
    );
  }
}

// DELETE /api/db/requirements/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const rateLimitResponse = await rateLimit()(request, NextResponse.next());
    if (rateLimitResponse.status === 429) {
      return rateLimitResponse;
    }

    const { id } = await params;
    const client = supabaseAdminService.getClient();
    const { error } = await client.from("requirements").delete().eq("id", id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in DELETE /api/db/requirements/[id]:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
      },
      { status: 500 },
    );
  }
}
