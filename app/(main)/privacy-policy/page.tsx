import Link from 'next/link';

export default function PrivacyPolicy() {
  return (
    <div className='min-h-screen'>
      <div className='max-w-4xl mx-auto p-8'>
        <h1 className='text-3xl font-bold mb-8'>プライバシーポリシー</h1>

        <section className='mb-8'>
          <h2 className='text-2xl font-bold mb-4'>1. 収集する情報</h2>
          <p className='mb-4'>当サービスは、以下の情報を収集します：</p>
          <ul className='list-disc ml-6 space-y-2'>
            <li>アカウント情報（メールアドレス、パスワード）</li>
            <li>支払い情報（クレジットカード情報等）</li>
            <li>Googleカレンダーへのアクセス権限</li>
            <li>サービス利用ログ（アクセス日時、IPアドレス等）</li>
          </ul>
        </section>

        <section className='mb-8'>
          <h2 className='text-2xl font-bold mb-4'>2. 情報の利用目的</h2>
          <p className='mb-4'>収集した情報は、以下の目的で利用します：</p>
          <ul className='list-disc ml-6 space-y-2'>
            <li>ユーザー認証とアカウント管理</li>
            <li>サービスの提供と機能の実行</li>
            <li>Stripeを通じた課金処理の実行</li>
            <li>サービスの改善と新機能の開発</li>
            <li>カスタマーサポートの提供</li>
            <li>法令順守のための利用</li>
          </ul>
        </section>

        <section className='mb-8'>
          <h2 className='text-2xl font-bold mb-4'>2.1 Stripeによる決済処理</h2>
          <p className='mb-4'>
            当サービスは、決済処理にStripe決済システムを使用しています：
          </p>
          <ul className='list-disc ml-6 space-y-2'>
            <li>
              クレジットカード情報は当サービスのサーバーには保存されず、すべてStripeのセキュアな環境で処理されます
            </li>
            <li>
              決済情報は、Stripeのプライバシーポリシーに基づいて管理されます
            </li>
            <li>
              定期購読の管理やキャンセルはStripeの決済システムを通じて行われます
            </li>
          </ul>
        </section>

        <section className='mb-8'>
          <h2 className='text-2xl font-bold mb-4'>3. 情報の管理と保護</h2>
          <ul className='list-disc ml-6 space-y-2'>
            <li>収集した個人情報は、適切な安全管理措置を講じて管理します</li>
            <li>個人情報は日本国内のサーバーで保管されます</li>
            <li>法令で定められた場合を除き、第三者への提供は行いません</li>
          </ul>
        </section>

        <section className='mb-8'>
          <h2 className='text-2xl font-bold mb-4'>
            4. Googleカレンダーの連携について
          </h2>
          <ul className='list-disc ml-6 space-y-2'>
            <li>
              当サービスは、ユーザーの許可を得てGoogleカレンダーにアクセスします
            </li>
            <li>アクセス権限は、予定の追加のみに限定されます</li>
            <li>ユーザーはいつでも連携を解除することができます</li>
          </ul>
        </section>

        <section className='mb-8'>
          <h2 className='text-2xl font-bold mb-4'>5. Cookieの使用について</h2>
          <p className='mb-4'>
            当サービスでは、ログイン状態の維持や利用状況の分析のためにCookieを使用しています。
            ブラウザの設定でCookieを無効にすることも可能ですが、その場合一部のサービス機能がご利用いただけない場合があります。
          </p>
        </section>

        <div className='mt-8'>
          <Link
            href='/'
            className='text-blue-600 hover:text-blue-800 underline'
          >
            ホームに戻る
          </Link>
        </div>
      </div>
    </div>
  );
}
