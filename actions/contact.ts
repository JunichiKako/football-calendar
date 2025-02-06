'use server';

import { z } from 'zod';
import { Resend } from 'resend';

const contactSchema = z.object({
  name: z.string().min(1, '名前を入力してください'),
  email: z.string().email('有効なメールアドレスを入力してください'),
  message: z.string().min(10, 'メッセージは10文字以上で入力してください'),
});

if (!process.env.RESEND_API_KEY || !process.env.CONTACT_EMAIL) {
  throw new Error('Required environment variables are not set');
}

const CONTACT_EMAIL = process.env.CONTACT_EMAIL;
const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendContactEmail(formData: FormData) {
  try {
    const validatedData = contactSchema.parse({
      name: formData.get('name'),
      email: formData.get('email'),
      message: formData.get('message'),
    });

    await resend.emails.send({
      from: 'Football Table <onboarding@resend.dev>',
      to: CONTACT_EMAIL,
      subject: `[お問い合わせ] ${validatedData.name}様より`,
      html: `
        <h3>お問い合わせ内容</h3>
        <p><strong>名前:</strong> ${validatedData.name}</p>
        <p><strong>メールアドレス:</strong> ${validatedData.email}</p>
        <p><strong>内容:</strong></p>
        <p>${validatedData.message.replace(/\n/g, '<br>')}</p>
      `,
    });

    return { success: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    console.error('Resend Error:', error);
    return { success: false, error: 'メールの送信に失敗しました' };
  }
}
