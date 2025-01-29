import { ArrowLeft, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function SuccessPage() {
  return (
    <div className='h-[calc(100vh-3.5rem)] bg-gradient-to-b flex items-center justify-center p-4'>
      <div className='max-w-md w-full  rounded-2xl shadow-lg p-8 border border-gray-200'>
        <div className='text-center'>
          <div className='flex justify-center mb-4'>
            <CheckCircle className='w-16 h-16 text-blue-500' />
          </div>
          <h1 className='text-2xl font-bold text-primary mb-2'>
            決済が完了しました
          </h1>
          <p className='text-primary mb-8'>
            右上のGoogleアイコンからサブスクリプション管理から状況を確認できます
          </p>

          <Link
            href='/?view=league'
            className='inline-flex items-center justify-center w-full px-6 py-3 text-base font-medium text-white bg-blue-600 border border-transparent rounded-lg shadow-sm hover:opacity-70 focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors'
          >
            <ArrowLeft className='w-5 h-5 mr-2' />
            カレンダー選択に戻る
          </Link>
        </div>
      </div>
    </div>
  );
}
