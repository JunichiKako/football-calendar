import { Check } from 'lucide-react';
import { Card } from '@/components/ui/card';
import SubscribeButton from '@/components/main/subscription-btn';

export default function PlanPage() {
  const plans = [
    {
      name: 'Free',
      id: 'free',
      price: '¥0',
      description: 'たまにでの利用に最適',
      features: [
        '主要リーグの試合スケジュール',
        '基本的なカレンダー閲覧',
        '月に1回のカレンダー追加',
        '月に1回のGoogleカレンダー追加',
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
        '主要リーグの試合スケジュール',
        '基本的なカレンダー閲覧',
        '月に8回のカレンダー追加',
        '月に8回のGoogleカレンダー追加',
      ],
      buttonText: 'Proを始める',
      popular: true,
    },
  ];

  return (
    <div className='h-[calc(100vh-3.5rem)] bg-background'>
      <div className='h-full max-w-7xl mx-auto px-4 py-8 overflow-y-auto'>
        <div className='text-center mb-8'>
          <h1 className='text-3xl font-bold mb-3 mt-10'>料金プラン</h1>
          <p className='text-lg'>
            あなたのニーズに合わせて選択できる2つのプラン
          </p>
        </div>

        <div className='grid md:grid-cols-2 gap-6 max-w-5xl mx-auto mt-20'>
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={`relative p-6 rounded-2xl ${
                plan.popular
                  ? 'border-2 border-primary shadow-xl'
                  : 'border border-gray-200'
              }`}
            >
              <div className='flex flex-col  justify-between'>
                <div>
                  {plan.popular && (
                    <div className='absolute -top-4 left-1/2 transform -translate-x-1/2'>
                      <span className='bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-semibold'>
                        人気プラン
                      </span>
                    </div>
                  )}
                  <div className='text-center mb-6'>
                    <h2 className='text-2xl font-bold mb-2'>{plan.name}</h2>
                    <p className='mb-3'>{plan.description}</p>
                    <div className='flex items-end justify-center gap-1'>
                      <span className='text-4xl font-bold'>{plan.price}</span>
                      {plan.period && (
                        <span className='mb-1'>{plan.period}</span>
                      )}
                    </div>
                  </div>
                  <ul className='space-y-3'>
                    {plan.features.map((feature) => (
                      <li key={feature} className='flex items-start gap-2'>
                        <Check className='h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0' />
                        <span className='text-sm'>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className='mt-6'>
                  <SubscribeButton plan={plan.id} />
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
