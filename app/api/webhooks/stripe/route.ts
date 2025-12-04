// Stripe Webhookは現在停止中のため固定レスポンスのみ返す
import { NextResponse } from 'next/server';

export async function POST() {
  console.log('🔕 Stripe webhook endpoint accessed while disabled');
  return NextResponse.json({
    status: 'disabled',
    message: 'Stripe webhook processing is currently turned off.',
    timestamp: new Date().toISOString(),
  });
}

export async function GET() {
  return NextResponse.json({
    status: 'disabled',
    message: 'Stripe webhook processing is currently turned off.',
    timestamp: new Date().toISOString(),
  });
}
