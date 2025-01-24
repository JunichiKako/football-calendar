'use client';
import { useState } from 'react';

export default function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  return (
    <div className='max-w-xl h-[calc(100vh-3.5rem)] mt-8 mx-auto px-4 py-8'>
      <div className='bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8'>
        <h1 className='text-3xl font-bold text-gray-900 dark:text-white mb-4'>
          お問い合わせ
        </h1>
        <p className='text-gray-600 dark:text-gray-300 mb-8'>
          お問い合わせはこちらのフォームからお願いします
        </p>

        <form
          action='https://getform.io/f/bpjjqreb'
          method='POST'
          className='space-y-6'
          onSubmit={() => setIsSubmitting(true)}
        >
          <input
            type='hidden'
            name='_gotcha'
            style={{ display: 'none !important' }}
          />

          <div>
            <label
              htmlFor='name'
              className='block text-sm font-medium text-gray-700 dark:text-gray-200'
            >
              お名前
            </label>
            <input
              type='text'
              name='name'
              id='name'
              required
              className='mt-1 block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500'
            />
          </div>

          <div>
            <label
              htmlFor='email'
              className='block text-sm font-medium text-gray-700 dark:text-gray-200'
            >
              メールアドレス
            </label>
            <input
              type='email'
              name='email'
              id='email'
              required
              className='mt-1 block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500'
            />
          </div>

          <div>
            <label
              htmlFor='message'
              className='block text-sm font-medium text-gray-700 dark:text-gray-200'
            >
              お問い合わせ内容
            </label>
            <textarea
              id='message'
              name='message'
              rows={6}
              required
              className='mt-1 block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500'
            />
          </div>

          <div className='pt-4'>
            <button
              type='submit'
              disabled={isSubmitting}
              className='w-full rounded-lg bg-blue-600 px-4 py-3 text-white font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors duration-200'
            >
              {isSubmitting ? '送信中...' : '送信する'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
