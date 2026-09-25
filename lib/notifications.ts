export type PushNotificationItem = {
  to: string;
  sound?: string;
  channelId?: string;
  title: string;
  body: string;
  data?: Record<string, any>;
};

export async function sendPushNotifications(messages: PushNotificationItem[]): Promise<any> {
  if (!messages || messages.length === 0) return;

  // 1. Try server-side route handler first
  try {
    const res = await fetch("/api/notifications/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages }),
    });

    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn("[Push] Internal route /api/notifications/send failed, trying direct endpoint...", err);
  }

  // 2. Direct client fallback
  try {
    const directRes = await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Accept-encoding": "gzip, deflate",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(messages),
    });
    return await directRes.json();
  } catch (err) {
    console.warn("[Push] Direct dispatch to exp.host failed:", err);
  }
}
