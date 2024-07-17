import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent, UserJSON } from "@clerk/nextjs/server";
import { createClerkSupabaseClient } from "@/lib/supabase/clerk";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;

export async function POST(req: Request) {
  console.log("Webhook handler invoked");

  if (!webhookSecret) {
    console.error("Missing webhook secret");
    throw new Error("Please add WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local");
  }

  // Get the headers
  const headerPayload = headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    console.error("Missing svix headers");
    return new Response("Error occurred -- no svix headers", {
      status: 400,
    });
  }

  // Get the body
  let payload;
  try {
    payload = await req.json();
    console.log("Payload received:", payload);
  } catch (err) {
    console.error("Error parsing payload:", err);
    return new Response("Error occurred while parsing payload", {
      status: 400,
    });
  }

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
    console.log("Webhook verified:", evt);
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
    try {
      const { data: existingUser, error: fetchError } = await supabase
        .from("users")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (fetchError && fetchError.code !== "PGRST116") {
        console.error("Error fetching user:", fetchError);
        throw fetchError;
      }

      if (!existingUser) {
        const fullName = `${user.first_name || ""} ${user.last_name || ""}`.trim();
        const { error } = await supabase
          .from("users")
          .insert([{ user_id: user.id, name: fullName || "No Name" }]);

        if (error) {
          console.error("Error inserting user:", error);
          throw error;
        }

        console.log("User inserted successfully");
      } else {
        console.log("User already exists");
      }
    } catch (error) {
      console.error("Error processing user.created event:", error);
    }
  } else if (eventType === "user.deleted") {
    try {
      const { error } = await supabase.from("users").delete().eq("user_id", user.id);

      if (error) {
        console.error("Error deleting user:", error);
        throw error;
      }

      console.log("User deleted successfully");
    } catch (error) {
      console.error("Error processing user.deleted event:", error);
    }
  }

  return new Response("", { status: 200 });
}
