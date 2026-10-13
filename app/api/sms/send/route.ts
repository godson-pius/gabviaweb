import { NextRequest, NextResponse } from 'next/server';
import { sendServerSms } from '@/lib/sms';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json().catch(() => ({}))) as {
      to?: string | string[];
      message?: string;
      senderId?: string;
      provider?: 'yoola' | 'twilio' | 'termii' | 'mock';
    };

    if (!body.to) {
      return NextResponse.json(
        { ok: false, error: 'Recipient phone number(s) `to` is required.' },
        { status: 400 }
      );
    }

    if (!body.message || !body.message.trim()) {
      return NextResponse.json(
        { ok: false, error: 'Message content `message` is required.' },
        { status: 400 }
      );
    }

    const result = await sendServerSms({
      to: body.to,
      message: body.message,
      senderId: body.senderId,
      provider: body.provider,
    });

    if (!result.ok) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (err: any) {
    console.error('[SMS API Route] Exception occurred:', err);
    return NextResponse.json(
      { ok: false, error: err?.message || 'Internal server error while sending SMS.' },
      { status: 500 }
    );
  }
}
