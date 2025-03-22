// Userがログインした時にこのWebhookでSupabaseのusersテーブルにStripeのCustomer IDを保存します。
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { adminClient } from '@/lib/supabase/admin';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
});

export async function POST(request: Request) {
  console.log('🔔 Webhook POST received at:', new Date().toISOString());

  try {
    // リクエスト情報のログ
    console.log('📝 Request URL:', request.url);
    console.log('📝 Request method:', request.method);

    // ヘッダー情報（センシティブ情報に注意）
    const reqHeaders = Object.fromEntries([...request.headers]);
    console.log('📝 Request headers present:', Object.keys(reqHeaders));
    console.log('📝 Content-Type:', reqHeaders['content-type']);
    console.log(
      '📝 Stripe-Signature present:',
      !!reqHeaders['stripe-signature']
    );

    const body = await request.text();
    console.log('📝 Webhook body received, length:', body.length);

    // 簡易的なJSONパース確認（エラーハンドリング付き）
    try {
      const parsedBody = JSON.parse(body);
      console.log(
        '📝 JSON parsed successfully, type property:',
        parsedBody.type
      );
    } catch (parseErr) {
      console.error('❌ Failed to parse JSON:', parseErr);
    }

    const signature = (await headers()).get('stripe-signature');
    console.log(
      '📝 Signature from headers():',
      signature ? `Present (length: ${signature.length})` : 'Missing'
    );

    // 環境変数確認（シークレットの一部のみ表示）
    const secretKeyPrefix = process.env.STRIPE_SECRET_KEY?.substring(0, 4);
    const webhookSecretPrefix = process.env.STRIPE_WEBHOOK_SECRET?.substring(
      0,
      4
    );
    console.log(
      '📝 STRIPE_SECRET_KEY present:',
      !!process.env.STRIPE_SECRET_KEY,
      'prefix:',
      secretKeyPrefix
    );
    console.log(
      '📝 STRIPE_WEBHOOK_SECRET present:',
      !!process.env.STRIPE_WEBHOOK_SECRET,
      'prefix:',
      webhookSecretPrefix
    );

    console.log('🔍 Attempting to verify Stripe event...');
    const event = stripe.webhooks.constructEvent(
      body,
      signature!,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    console.log('✅ Event verified successfully:', event.type);

    switch (event.type) {
      case 'customer.created':
        console.log('🧑 Processing customer.created event');
        const customer = event.data.object as Stripe.Customer;
        console.log('🧑 Customer ID:', customer.id);
        console.log('🧑 Customer metadata:', customer.metadata);

        if (!customer.metadata.supabase_uid) {
          console.error('❌ No supabase_uid in metadata');
          return NextResponse.json(
            { error: 'Missing supabase_uid in metadata' },
            { status: 400 }
          );
        }

        console.log(
          '💾 Attempting Supabase upsert for user_id:',
          customer.metadata.supabase_uid
        );
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
          console.error('❌ Supabase upsert error:', {
            error,
            customer_id: customer.id,
            supabase_uid: customer.metadata.supabase_uid,
          });
          throw error;
        }
        console.log('✅ Supabase upsert successful for customer:', customer.id);
        break;

      case 'customer.subscription.updated':
        console.log('🔄 Processing subscription update event');
        const updatedSubscription = event.data.object as Stripe.Subscription;
        console.log('🔄 Subscription ID:', updatedSubscription.id);
        console.log('🔄 Customer ID:', updatedSubscription.customer);
        console.log('🔄 Subscription status:', updatedSubscription.status);

        // サブスクリプションのステータスをチェック
        if (updatedSubscription.status === 'canceled') {
          console.log('🔄 Subscription canceled, updating to free plan');
          const { error: cancelError } = await adminClient
            .from('users')
            .update({
              subscription_plan: 'free',
              updated_at: new Date().toISOString(),
            })
            .eq('stripe_customer_id', updatedSubscription.customer);

          if (cancelError) {
            console.error('❌ Supabase update error:', cancelError);
            throw cancelError;
          }
          console.log('✅ Updated to free plan successfully');
        } else {
          const planType =
            updatedSubscription.items.data[0].price.lookup_key || 'pro';
          console.log('🔄 Updating subscription plan to:', planType);
          const { error: updateError } = await adminClient
            .from('users')
            .update({
              subscription_plan: planType,
              updated_at: new Date().toISOString(),
            })
            .eq('stripe_customer_id', updatedSubscription.customer);

          if (updateError) {
            console.error('❌ Supabase update error:', updateError);
            throw updateError;
          }
          console.log('✅ Subscription plan updated successfully');
        }
        break;

      case 'customer.subscription.deleted':
        console.log('🗑️ Processing subscription deletion event');
        const cancelledSubscription = event.data.object as Stripe.Subscription;
        console.log('🗑️ Subscription ID:', cancelledSubscription.id);
        console.log('🗑️ Customer ID:', cancelledSubscription.customer);

        const { error: cancelError } = await adminClient
          .from('users')
          .update({
            subscription_plan: 'free',
            updated_at: new Date().toISOString(),
          })
          .eq('stripe_customer_id', cancelledSubscription.customer);

        if (cancelError) {
          console.error('❌ Supabase update error:', cancelError);
          throw cancelError;
        }
        console.log('✅ Updated to free plan after subscription deletion');
        break;

      default:
        console.log('⚠️ Unhandled event type:', event.type);
    }

    console.log('✅ Webhook processing completed successfully');
    return NextResponse.json({ received: true });
  } catch (err: unknown) {
    const error = err as Error;
    console.error('❌ Webhook error:', error.message);
    console.error('❌ Error details:', JSON.stringify(err, null, 2));
    return NextResponse.json(
      { error: error.message || 'An unknown error occurred' },
      { status: 400 }
    );
  }
}

export const runtime = 'nodejs';

// 同じファイルに追加
export async function GET() {
  console.log('GET request to webhook endpoint at:', new Date().toISOString());
  return NextResponse.json({
    status: 'ok',
    message: 'Webhook endpoint is active',
    timestamp: new Date().toISOString(),
  });
}
