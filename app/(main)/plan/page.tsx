import { Check } from 'lucide-react';
import { Card } from '@/components/ui/card';
import SubscribeButton from '@/components/main/subscription-btn';

export default function PlanPage() {
  const plans = [
    {
      name: 'Free',
      id: 'free',
      price: '¥0',
      description: '個人での利用に最適',
      features: [
        '主要リーグの試合スケジュール',
        '基本的なカレンダー同期',
        '1チームのみお気に入り登録可能',
        '広告あり',
      ],
      buttonText: '無料で始める',
      popular: false,
    },
    {
      name: 'Pro',
      id: 'pro',
      price: '¥350',
      period: '/月',
      description: 'サッカーファン向けの完全版',
      features: [
        '全世界のリーグ・カップ戦に対応',
        'リアルタイムスコア通知',
        '無制限のチームお気に入り',
        '試合予測機能',
        '広告なし',
        'カスタムカレンダー色分け',
        '試合統計データ',
        '優先サポート',
        '無制限の追加機能アップデート',
      ],
      buttonText: 'Proを始める',
      popular: true,
    },
  ];

  return (
    <div className='h-[calc(100vh-3.5rem)] bg-gradient-to-b from-gray-50 to-gray-100'>
      <div className='h-full max-w-7xl mx-auto px-4 py-8 overflow-y-auto'>
        <div className='text-center mb-8'>
          <h1 className='text-3xl font-bold text-gray-900 mb-3'>
            シンプルな料金プラン
          </h1>
          <p className='text-lg text-gray-600'>
            あなたのニーズに合わせて選択できる2つのプラン
          </p>
        </div>

        <div className='grid md:grid-cols-2 gap-6 max-w-5xl mx-auto'>
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={`relative p-6 rounded-2xl flex flex-col ${
                plan.popular
                  ? 'border-2 border-primary shadow-xl'
                  : 'border border-gray-200'
              }`}
            >
              {plan.popular && (
                <div className='absolute -top-4 left-1/2 transform -translate-x-1/2'>
                  <span className='bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-semibold'>
                    人気プラン
                  </span>
                </div>
              )}
              <div className='text-center mb-6'>
                <h2 className='text-2xl font-bold mb-2'>{plan.name}</h2>
                <p className='text-gray-600 mb-3'>{plan.description}</p>
                <div className='flex items-end justify-center gap-1'>
                  <span className='text-4xl font-bold'>{plan.price}</span>
                  {plan.period && (
                    <span className='text-gray-600 mb-1'>{plan.period}</span>
                  )}
                </div>
              </div>
              <ul className='space-y-3 flex-grow'>
                {plan.features.map((feature) => (
                  <li key={feature} className='flex items-start gap-2'>
                    <Check className='h-5 w-5 text-green-500 mt-0.5 flex-shrink-0' />
                    <span className='text-gray-700 text-sm'>{feature}</span>
                  </li>
                ))}
              </ul>
              <SubscribeButton plan={plan.id} />
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
