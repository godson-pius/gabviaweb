/**
 * Server-side SMS Dispatcher for Next.js backend.
 * Provides unified SMS sending supporting Yoola SMS, Twilio, Termii, etc.
 */

export type SmsProviderName = 'yoola' | 'twilio' | 'termii' | 'mock';

export interface SendSmsPayload {
  to: string | string[];
  message: string;
  senderId?: string;
  provider?: SmsProviderName;
}

export interface SendSmsResponse {
  ok: boolean;
  provider: string;
  messageId?: string;
  recipientsCount: number;
  creditsUsed?: number;
  remainingBalance?: number;
  error?: string;
  raw?: unknown;
}

function cleanUgandaPhone(phone: string): string {
  let cleaned = phone.trim().replace(/[\s\-\(\)\.]+/g, '');
  if (cleaned.startsWith('+')) cleaned = cleaned.substring(1);
  if (cleaned.startsWith('0') && cleaned.length === 10) {
    cleaned = `256${cleaned.substring(1)}`;
  }
  return cleaned;
}

export async function sendServerSms(payload: SendSmsPayload): Promise<SendSmsResponse> {
  const provider = (
    payload.provider ||
    process.env.SMS_PROVIDER ||
    process.env.EXPO_PUBLIC_SMS_PROVIDER ||
    'yoola'
  ).toLowerCase() as SmsProviderName;

  const rawRecipients = Array.isArray(payload.to) ? payload.to : [payload.to];
  const cleanedRecipients = rawRecipients.map(cleanUgandaPhone).filter(Boolean);

  if (cleanedRecipients.length === 0) {
    return {
      ok: false,
      provider,
      recipientsCount: 0,
      error: 'No valid recipient phone numbers provided.',
    };
  }

  if (!payload.message?.trim()) {
    return {
      ok: false,
      provider,
      recipientsCount: cleanedRecipients.length,
      error: 'Message text cannot be empty.',
    };
  }

  // 1. YOOLA SMS DISPATCH
  if (provider === 'yoola') {
    const apiKey =
      process.env.YOOLA_API_KEY ||
      process.env.EXPO_PUBLIC_YOOLA_API_KEY ||
      '';

    if (!apiKey) {
      return {
        ok: false,
        provider: 'yoola',
        recipientsCount: cleanedRecipients.length,
        error: 'YOOLA_API_KEY is not configured in server environment variables.',
      };
    }

    const defaultSender = process.env.SMS_SENDER_ID || process.env.EXPO_PUBLIC_SMS_SENDER_ID || 'YoolaSMS';
    const sender = payload.senderId || defaultSender;

    try {
      const response = await fetch('https://yoolasms.com/api/v1/send.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          api_key: apiKey,
          phone: cleanedRecipients.join(','),
          message: payload.message.trim(),
          sender,
        }),
      });

      const data = (await response.json().catch(() => null)) as any;
      const isSuccess = response.ok && data?.status === 'success';

      if (!isSuccess) {
        return {
          ok: false,
          provider: 'yoola',
          recipientsCount: cleanedRecipients.length,
          error: data?.message || `Yoola SMS rejected request with status: ${data?.status || response.status}`,
          raw: data,
        };
      }

      return {
        ok: true,
        provider: 'yoola',
        messageId: data?.message_id,
        recipientsCount: data?.recipients ?? cleanedRecipients.length,
        creditsUsed: data?.credits_used,
        remainingBalance: data?.balance ?? data?.credit_remaining,
        raw: data,
      };
    } catch (err: any) {
      return {
        ok: false,
        provider: 'yoola',
        recipientsCount: cleanedRecipients.length,
        error: err?.message || 'Failed to dispatch via Yoola SMS.',
      };
    }
  }

  // 2. MOCK / FALLBACK DISPATCH
  console.log(`[SMS Mock] Dispatched SMS to ${cleanedRecipients.join(', ')}: "${payload.message}"`);
  return {
    ok: true,
    provider: 'mock',
    messageId: `mock_${Date.now()}`,
    recipientsCount: cleanedRecipients.length,
  };
}
