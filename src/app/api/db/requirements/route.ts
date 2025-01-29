import { NextRequest, NextResponse } from "next/server";
import { supabaseAdminService } from "@/lib/services/supabaseAdmin";
import { rateLimit } from "@/lib/middleware/rateLimit";
import type { Tables } from "@/types/supabase";

type Requirement = Tables<"requirements">;
type RequirementInput = Pick<
  Requirement,
  | "project_id"
  | "title"
  | "description"
  | "status"
  | "priority"
  | "metadata"
  | "created_by"
>;

// GET /api/db/requirements
export async function GET(req: NextRequest) {
  try {
    const rateLimitResponse = await rateLimit()(req, NextResponse.next());
    if (rateLimitResponse.status === 429) {
      return rateLimitResponse;
    }

    const searchParams = req.nextUrl.searchParams;
    const projectId = searchParams.get("projectId");
    const subscribe = searchParams.get("subscribe") === "true";
    const user_id = searchParams.get("user_id");

    const client = supabaseAdminService.getClient();

    // Handle subscription request
    if (subscribe && projectId) {
      const stream = new TransformStream();
      const writer = stream.writable.getWriter();
      const encoder = new TextEncoder();

      // Set up Supabase real-time subscription
      const subscription = client
        .channel("requirements-changes")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "requirements",
            filter: `project_id=eq.${projectId}`,
          },
          async (payload) => {
            // Send the update to the client
            const data = JSON.stringify({
              eventType: payload.eventType,
              old: payload.old,
              new: payload.new,
            });
            await writer.write(encoder.encode(`data: ${data}\n\n`));
          },
        )
        .subscribe();

      // Clean up subscription when the client disconnects
      req.signal.addEventListener("abort", () => {
        subscription.unsubscribe();
        writer.close();
      });

      return new Response(stream.readable, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      });
    }

    let query = client.from("requirements").select("*");

    if (projectId) {
      query = query.eq("project_id", projectId);
    }

    if (user_id) {
      query = query.eq("created_by", user_id);
    }

    const { data, error } = await query;

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in GET /api/db/requirements:", error);
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

// POST /api/db/requirements
export async function POST(req: NextRequest) {
  try {
    const rateLimitResponse = await rateLimit()(req, NextResponse.next());
    if (rateLimitResponse.status === 429) {
      return rateLimitResponse;
    }

    const body = (await req.json()) as RequirementInput;

    if (!body.project_id) {
      return NextResponse.json(
        { error: "Project ID is required" },
        { status: 400 },
      );
    }

    const client = supabaseAdminService.getClient();
    const { data: requirement, error } = await client
      .from("requirements")
      .insert(body)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(requirement, { status: 201 });
  } catch (error) {
    console.error("Error in POST /api/db/requirements:", error);
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
