import { NextResponse } from "next/server";
import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent, UserJSON } from "@clerk/nextjs/server";
import { createClerkSupabaseClient } from "@/lib/supabase/clerk";


// Disable body parsing for this route
export const dynamic = "force-dynamic";
export const revalidate = 0;

const webhookSecret = process.env.WEBHOOK_SECRET;

export async function POST(req: Request) {
  if (!webhookSecret) {
    throw new Error("Please add WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local");
  }

  // Get the headers
  const headerPayload = headers();
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
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your secret.
  const wh = new Webhook(webhookSecret);

  let evt: WebhookEvent;

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return new Response("Error occurred", {
      status: 400,
    });
  }

  // Process the webhook event
  const eventType = evt.type;
  const user = evt.data as UserJSON;

  console.log(`Webhook received with event type: ${eventType}`);

  const supabase = await createClerkSupabaseClient();

  if (eventType === "user.created") {
    const { data: existingUser, error: fetchError } = await supabase
      .from("user")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (fetchError && fetchError.code !== "PGRST116") {
      throw fetchError;
    }

    if (!existingUser) {
      const fullName = `${user.first_name || ""} ${user.last_name || ""}`.trim();
      const { error } = await supabase
        .from("user")
        .insert([{ user_id: user.id, name: fullName || "No Name" }]);

      if (error) {
        throw error;
      }

      console.log("User inserted successfully");
    } else {
      console.log("User already exists");
    }
  } else if (eventType === "user.deleted") {
    const { error } = await supabase.from("user").delete().eq("user_id", user.id);

    if (error) {
      throw error;
    }

    console.log("User deleted successfully");
  }

  return new Response("", { status: 200 });
}
