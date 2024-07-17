import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { createClerkSupabaseClient } from '@/lib/supabase/clerk';

export async function POST(req: Request) {
  console.log("Webhook handler invoked");

  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    console.error('Missing webhook secret');
    throw new Error('Please add WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local');
  }

  const headerPayload = headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  console.log("Headers received:", { svix_id, svix_timestamp, svix_signature });

  if (!svix_id || !svix_timestamp || !svix_signature) {
    console.error('Missing svix headers:', { svix_id, svix_timestamp, svix_signature });
    return new Response('Error occurred -- no svix headers', {
      status: 400
    });
  }

  let payload;
  try {
    payload = await req.json();
    console.log("Payload received:", payload);
  } catch (err) {
    console.error('Error parsing payload:', err);
    return new Response('Error occurred while parsing payload', {
      status: 400
    });
  }

  const body = JSON.stringify(payload);
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;

  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
    console.log("Webhook verified:", evt);
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return new Response('Error occurred during verification', {
      status: 400
    });
  }

  const eventType = evt.type;
  const { id } = evt.data;
  console.log(`Webhook received with event type: ${eventType}, ID: ${id}`);

  // Supabaseへのデータ保存のログを追加
  const supabase = await createClerkSupabaseClient();

  if (eventType === 'user.created') {
    try {
      const { data: existingUser, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('user_id', id)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }

      if (!existingUser) {
        const fullName = `${evt.data.first_name || ''} ${evt.data.last_name || ''}`.trim();
        const { error } = await supabase
          .from('users')
          .insert([{ user_id: id, name: fullName || 'No Name' }]);

        if (error) {
          throw error;
        }

        console.log('User inserted successfully');
      } else {
        console.log('User already exists');
      }
    } catch (error) {
      console.error('Error inserting user into Supabase:', error);
    }
  } else if (eventType === 'user.deleted') {
    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('user_id', id);

      if (error) {
        throw error;
      }

      console.log('User deleted successfully');
    } catch (error) {
      console.error('Error deleting user from Supabase:', error);
    }
  }

  return new Response('Webhook processed successfully', { status: 200 });
}
