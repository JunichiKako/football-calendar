'use client';

import { useState, useLayoutEffect } from 'react';
import { Button } from '@/components/ui/button';
import * as Dialog from '@radix-ui/react-dialog';
import { AlertDialogHeader } from '../ui/alert-dialog';
import { createClientClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export function OnboardingModal({ isOpen }: { isOpen: boolean }) {
  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState(1);
  const supabase = createClientClient();
  const router = useRouter();

  useLayoutEffect(() => {
    setMounted(true);
  }, []);

  const totalSteps = 3;
  const steps = [
    { title: 'Step 1', description: 'Description for step 1' },
    { title: 'Step 2', description: 'Description for step 2' },
    { title: 'Step 3', description: 'Description for step 3' },
  ];

  const handleNext = async () => {
    if (step === totalSteps) {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.user.id) return;

      await supabase
        .from('users')
        .update({ onboarding_completed: true })
        .eq('user_id', session.user.id);

      // ページを更新してモーダルを閉じる
      router.refresh();
    } else {
      setStep(step + 1);
    }
  };

  if (!mounted) return null;

  return (
    <Dialog.Root open={isOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className='fixed inset-0 bg-black/50' />
        <Dialog.Content className='fixed inset-0 flex items-center justify-center'>
          <div className='w-full max-w-2xl mx-4 p-6 bg-white rounded-lg shadow-xl'>
            <div className='space-y-8'>
              {/* ステップインジケーター */}
              <div className='flex justify-center space-x-2'>
                {steps.map((_, index) => (
                  <div
                    key={index}
                    className={`h-2 w-2 rounded-full ${
                      index + 1 <= step ? 'bg-primary' : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>

              {/* コンテンツ */}
              <AlertDialogHeader>
                <Dialog.Title className='text-2xl font-bold text-center'>
                  {steps[step - 1].title}
                </Dialog.Title>
                <Dialog.Description className='text-center text-gray-600 mt-2'>
                  {steps[step - 1].description}
                </Dialog.Description>
              </AlertDialogHeader>

              {/* ボタン */}
              <div className='flex justify-center'>
                <Button onClick={handleNext} className='w-full max-w-sm'>
                  {step === totalSteps ? '完了' : '次へ'}
                </Button>
              </div>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
