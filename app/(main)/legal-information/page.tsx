import Link from 'next/link';

export default function LegalPage() {
  return (
    <div className='min-h-screen'>
      <div className='max-w-4xl mx-auto p-8'>
        <h1 className='text-3xl font-bold mb-8'>特定商取引法に基づく表記</h1>

        <div className='space-y-6'>
          <div className='border-b pb-4'>
            <h2 className='font-bold mb-2'>事業者の名称</h2>
            <p>Football Table</p>
          </div>

          <div className='border-b pb-4'>
            <h2 className='font-bold mb-2'>運営責任者</h2>
            <p>サービス担当者</p>
          </div>

          <div className='border-b pb-4'>
            <h2 className='font-bold mb-2'>所在地</h2>
            <p>非公開（お問い合わせはメールにてご連絡ください）</p>
          </div>

          <div className='border-b pb-4'>
            <h2 className='font-bold mb-2'>連絡先</h2>
            <p>http://localhost:3000/contact</p>
            <p className='text-sm text-gray-600 mt-2'>
              ※個人情報保護の観点から、お問い合わせはフォームよりお願いいたします。
            </p>
          </div>

          <div className='border-b pb-4'>
            <h2 className='font-bold mb-2'>サービス価格</h2>
            <ul className='list-disc ml-6 space-y-2'>
              <li>フリープラン：0円</li>
              <li>プレミアムプラン：350円/月（税込）</li>
            </ul>
          </div>

          <div className='border-b pb-4'>
            <h2 className='font-bold mb-2'>支払方法</h2>
            <p>クレジットカード（Stripe決済）</p>
          </div>

          <div className='border-b pb-4'>
            <h2 className='font-bold mb-2'>サービス提供時期</h2>
            <p>お支払い完了後、即時にご利用いただけます</p>
          </div>

          <div className='border-b pb-4'>
            <h2 className='font-bold mb-2'>キャンセル・解約</h2>
            <ul className='list-disc ml-6 space-y-2'>
              <li>契約期間中いつでも解約可能</li>
              <li>解約後は契約期間終了まで使用可能</li>
              <li>解約後の自動更新なし</li>
            </ul>
          </div>

          <div className='border-b pb-4'>
            <h2 className='font-bold mb-2'>返金</h2>
            <p>課金開始から7日以内の場合に限り返金対応可能</p>
          </div>

          <div className='border-b pb-4'>
            <h2 className='font-bold mb-2'>その他の費用</h2>
            <p>支払いに関する手数料はお客様負担となります</p>
          </div>
        </div>

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
