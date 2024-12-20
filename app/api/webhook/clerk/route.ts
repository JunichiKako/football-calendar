// app/api/webhook/clerk/route.ts
import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  // Webhook Secretの検証
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;
  if (!WEBHOOK_SECRET) {
    throw new Error("Missing CLERK_WEBHOOK_SECRET");
  }

  // ヘッダーの検証
  const headerPayload = headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return NextResponse.json(
      { error: "Missing svix headers" },
      { status: 400 }
    );
  }

  // リクエストボディの取得と検証
  const payload = await req.json();
  const body = JSON.stringify(payload);

  const webhook = new Webhook(WEBHOOK_SECRET);
  let evt: WebhookEvent;

  try {
    evt = webhook.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return NextResponse.json(
      { error: "Error verifying webhook" },
      { status: 400 }
    );
  }

  const supabase = createClient();

  // イベントタイプに基づく処理
  switch (evt.type) {
    case "user.created":
    case "user.updated":
      const { id: clerk_id } = evt.data;

      try {
        await supabase.from("users").upsert({
          clerk_id,
          updated_at: new Date().toISOString(),
        });

        return NextResponse.json(
          { message: "User created/updated" },
          { status: 200 }
        );
      } catch (err) {
        console.error("Error upserting user:", err);
        return NextResponse.json(
          { error: "Error upserting user" },
          { status: 400 }
        );
      }

    case "user.deleted":
      try {
        await supabase.from("users").delete().eq("clerk_id", evt.data.id);

        return NextResponse.json({ message: "User deleted" }, { status: 200 });
      } catch (err) {
        console.error("Error deleting user:", err);
        return NextResponse.json(
          { error: "Error deleting user" },
          { status: 400 }
        );
      }

    default:
      return NextResponse.json(
        { error: "Unhandled event type" },
        { status: 400 }
      );
  }
}
