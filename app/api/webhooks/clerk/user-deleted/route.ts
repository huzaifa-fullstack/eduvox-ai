import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { headers } from "next/headers";
import { Webhook } from "svix";

// Webhook to handle user deletion from Clerk
export async function POST(request: NextRequest) {
  try {
    // Get the headers for webhook verification
    const headerPayload = await headers();
    const svix_id = headerPayload.get("svix-id");
    const svix_timestamp = headerPayload.get("svix-timestamp");
    const svix_signature = headerPayload.get("svix-signature");

    // If there are no headers, error out
    if (!svix_id || !svix_timestamp || !svix_signature) {
      return new Response("Error occurred -- no svix headers", {
        status: 400,
      });
    }

    // Get the body
    const payload = await request.json();
    const body = JSON.stringify(payload);

    // Create a new Svix instance with your webhook secret
    const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET || "");

    let evt;

    // Verify the payload with the headers
    try {
      evt = wh.verify(body, {
        "svix-id": svix_id,
        "svix-timestamp": svix_timestamp,
        "svix-signature": svix_signature,
      }) as any;
    } catch (err) {
      console.error("Error verifying webhook:", err);
      return new Response("Error occurred", {
        status: 400,
      });
    }

    // Handle the webhook
    const eventType = evt.type;

    if (eventType === "user.deleted") {
      const userId = evt.data.id;

      if (!userId) {
        return NextResponse.json(
          { error: "No user ID provided" },
          { status: 400 }
        );
      }

      // Create Supabase client with service role key for admin operations
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!, // This needs to be added to your .env
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false,
          },
        }
      );

      console.log(`🗑️ Cleaning up data for deleted user: ${userId}`);

      // Delete all user data from Supabase
      const deletionResults = await Promise.allSettled([
        supabase.from("user_lifetime_stats").delete().eq("user_id", userId),
        supabase.from("companions").delete().eq("author", userId),
        supabase.from("session_history").delete().eq("user_id", userId),
        supabase.from("bookmarks").delete().eq("user_id", userId),
      ]);

      // Log results
      deletionResults.forEach((result, index) => {
        const tables = [
          "user_lifetime_stats",
          "companions",
          "session_history",
          "bookmarks",
        ];
        if (result.status === "fulfilled") {
          console.log(`✅ Deleted from ${tables[index]}`);
        } else {
          console.error(
            `❌ Failed to delete from ${tables[index]}:`,
            result.reason
          );
        }
      });

      console.log(`✅ Successfully processed deletion for user: ${userId}`);

      return NextResponse.json(
        {
          message: "User data successfully processed for deletion",
          userId,
        },
        { status: 200 }
      );
    }

    return NextResponse.json({ message: "Event not handled" }, { status: 200 });
  } catch (error) {
    console.error("❌ Error in user deletion webhook:", error);
    return NextResponse.json(
      { error: "Failed to process user deletion webhook" },
      { status: 500 }
    );
  }
}

// Only allow POST requests
export async function GET() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}
