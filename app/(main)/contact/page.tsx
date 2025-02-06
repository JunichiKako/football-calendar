'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useFormStatus } from 'react-dom';
import { sendContactEmail } from '@/actions/contact';

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type='submit'
      disabled={pending}
      className='w-full rounded-lg bg-blue-600 px-4 py-3 text-white font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors duration-200'
    >
      {pending ? '送信中...' : '送信する'}
    </button>
  );
}

export default function ContactForm() {
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit(formData: FormData) {
    setError(null);

    const result = await sendContactEmail(formData);

    if (result.success) {
      alert('お問い合わせを受け付けました');
      router.push('/');
    } else {
      setError(result.error || 'エラーが発生しました');
    }
  }

  return (
    <div className='max-w-xl h-[calc(100vh-3.5rem)] mt-8 mx-auto px-4 py-8'>
      <div className='bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8'>
        <h1 className='text-3xl font-bold text-gray-900 dark:text-white mb-4'>
          お問い合わせ
        </h1>
        <form action={handleSubmit} className='space-y-6'>
          <div>
            <label className='block text-sm font-medium text-gray-700 dark:text-gray-200'>
              お名前
            </label>
            <input
              type='text'
              name='name'
              required
              className='mt-1 block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500'
            />
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 dark:text-gray-200'>
              メールアドレス
            </label>
            <input
              type='email'
              name='email'
              required
              className='mt-1 block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500'
            />
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 dark:text-gray-200'>
              お問い合わせ内容
            </label>
            <textarea
              name='message'
              rows={6}
              required
              className='mt-1 block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500'
            />
          </div>

          {error && (
            <div className='text-red-600 dark:text-red-400'>{error}</div>
          )}

          <SubmitButton />
        </form>
      </div>
    </div>
  );
}
