// Userがログインした時にこのWebhookでSupabaseのusersテーブルにStripeのCustomer IDを保存します。
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { adminClient } from '@/lib/supabase/admin';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: Request) {
  const body = await request.text();
  const signature = headers().get('stripe-signature')!;

  try {
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    console.log('Event verified:', event.type); // デバッグログ追加

    switch (event.type) {
      case 'customer.created':
        const customer = event.data.object as Stripe.Customer;

        if (!customer.metadata.supabase_uid) {
          console.error('No supabase_uid in metadata');
          return NextResponse.json(
            { error: 'Missing supabase_uid in metadata' },
            { status: 400 }
          );
        }

        const { error } = await adminClient.from('users').upsert(
          {
            user_id: customer.metadata.supabase_uid,
            stripe_customer_id: customer.id,
            subscription_plan: 'free',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: 'user_id',
            ignoreDuplicates: false,
          }
        );

        if (error) {
          console.error('Supabase upsert error:', {
            error,
            customer_id: customer.id,
            supabase_uid: customer.metadata.supabase_uid,
          });
          throw error;
        }
        break;

      case 'customer.subscription.updated':
        const updatedSubscription = event.data.object as Stripe.Subscription;
        console.log(
          'Webhook: Processing subscription update',
          updatedSubscription
        );

        // サブスクリプションのステータスをチェック
        if (updatedSubscription.status === 'canceled') {
          const { error: cancelError } = await adminClient
            .from('users')
            .update({
              subscription_plan: 'free',
              updated_at: new Date().toISOString(),
            })
            .eq('stripe_customer_id', updatedSubscription.customer);

          if (cancelError) {
            console.error('Supabase update error:', cancelError);
            throw cancelError;
          }
        } else {
          const { error: updateError } = await adminClient
            .from('users')
            .update({
              subscription_plan:
                updatedSubscription.items.data[0].price.lookup_key || 'pro',
              updated_at: new Date().toISOString(),
            })
            .eq('stripe_customer_id', updatedSubscription.customer);

          if (updateError) {
            console.error('Supabase update error:', updateError);
            throw updateError;
          }
        }
        break;

      case 'customer.subscription.deleted':
        const cancelledSubscription = event.data.object as Stripe.Subscription;
        console.log(
          'Webhook: Processing subscription cancellation',
          cancelledSubscription
        );

        const { error: cancelError } = await adminClient
          .from('users')
          .update({
            subscription_plan: 'free',
            updated_at: new Date().toISOString(),
          })
          .eq('stripe_customer_id', cancelledSubscription.customer);

        if (cancelError) {
          console.error('Supabase update error:', cancelError);
          throw cancelError;
        }
        break;
    }

    return NextResponse.json({ received: true });
  } catch (err: unknown) {
    const error = err as Error;
    console.error('Webhook error:', error.message);
    return NextResponse.json(
      { error: error.message || 'An unknown error occurred' },
      { status: 400 }
    );
  }
}

export const runtime = 'nodejs';
