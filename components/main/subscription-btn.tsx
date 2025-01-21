'use client';

import { handleSubscribe } from '@/actions/stripe';
import { Button } from '@/components/ui/button';

interface SubscribeButtonProps {
  plan: string;
}

export default function SubscribeButton({ plan }: SubscribeButtonProps) {
  return (
    <form action={handleSubscribe}>
      <input type='hidden' name='planId' value={plan} />
      <Button
        type='submit'
        className={`w-full mt-6 ${
          plan === 'pro'
            ? 'bg-primary hover:bg-primary/90'
            : 'bg-secondary hover:bg-secondary/90 text-black'
        }`}
      >
        {plan === 'pro' ? 'Proを始める' : '無料で始める'}
      </Button>
    </form>
  );
}
