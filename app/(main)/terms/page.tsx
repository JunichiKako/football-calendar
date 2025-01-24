import Link from 'next/link';

export default function TermsPage() {
  return (
    <div className='min-h-screen '>
      <div className='max-w-4xl mx-auto p-8'>
        <h1 className='text-3xl font-bold mb-8'>利用規約</h1>

        <section className='mb-8'>
          <h2 className='text-2xl font-bold mb-4'>1. はじめに</h2>
          <p className='mb-4'>
            この利用規約は、サッカースケジュールをGoogleカレンダーに登録できるサービス（以下「本サービス」）の利用条件を定めるものです。
          </p>
        </section>

        <section className='mb-8'>
          <h2 className='text-2xl font-bold mb-4'>2. アカウントの管理</h2>
          <ul className='list-disc ml-6 space-y-2'>
            <li>ユーザーは自己の責任でアカウントを管理してください</li>
            <li>パスワードの管理は慎重に行ってください</li>
            <li>アカウントの貸与・譲渡はできません</li>
          </ul>
        </section>

        <section className='mb-8'>
          <h2 className='text-2xl font-bold mb-4'>3. 料金と支払い</h2>
          <ul className='list-disc ml-6 space-y-2'>
            <li>料金プランは本サービス上で表示される金額です</li>
            <li>支払いはStripeを通じて処理されます</li>
            <li>サブスクリプションは自動更新されます</li>
            <li>キャンセルは次回更新日までに行ってください</li>
          </ul>
        </section>

        <section className='mb-8'>
          <h2 className='text-2xl font-bold mb-4'>4. 禁止事項</h2>
          <ul className='list-disc ml-6 space-y-2'>
            <li>不正アクセス</li>
            <li>システムに負荷をかける行為</li>
            <li>他のユーザーへの迷惑行為</li>
            <li>商用目的での無断利用</li>
            <li>違法行為</li>
          </ul>
        </section>

        <section className='mb-8'>
          <h2 className='text-2xl font-bold mb-4'>5. サービスの停止・中断</h2>
          <ul className='list-disc ml-6 space-y-2'>
            <li>システムメンテナンス</li>
            <li>重大な障害発生時</li>
            <li>その他運営者が必要と判断した場合</li>
          </ul>
        </section>

        <section className='mb-8'>
          <h2 className='text-2xl font-bold mb-4'>6. 退会</h2>
          <p className='mb-4'>
            退会は本サービスの設定画面から行うことができます。退会後のデータの復旧はできません。
          </p>
        </section>

        <section className='mb-8'>
          <h2 className='text-2xl font-bold mb-4'>7. 免責事項</h2>
          <p className='mb-4'>
            本サービスは、信頼性の高い情報源からサッカースケジュールを提供するよう努めています。ただし、試合日程は諸事情により変更される可能性があります。
          </p>
        </section>

        <section className='mb-8'>
          <h2 className='text-2xl font-bold mb-4'>8. 規約の変更</h2>
          <p className='mb-4'>
            本規約は予告なく変更される場合があります。変更後の利用継続をもって、変更後の規約に同意したものとみなします。
          </p>
        </section>

        <section className='mb-8'>
          <h2 className='text-2xl font-bold mb-4'>9. お問い合わせ</h2>
          <p className='mb-4'>
            ご不明な点がある場合は、[お問い合わせフォーム]からご連絡ください。
          </p>
        </section>

        <section className='mb-8'>
          <h2 className='text-2xl font-bold mb-4'>10. 準拠法</h2>
          <p className='mb-4'>本規約は日本法に準拠します。</p>
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
