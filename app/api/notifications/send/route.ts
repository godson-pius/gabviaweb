import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const rawMessages = body.messages || body;

    const messages = Array.isArray(rawMessages) ? rawMessages : [rawMessages];

    // Filter valid push notification messages
    const validMessages = messages.filter(
      (m: any) =>
        m &&
        typeof m.to === "string" &&
        (m.to.startsWith("ExponentPushToken[") || m.to.startsWith("ExpoPushToken["))
    );

    if (validMessages.length === 0) {
      return NextResponse.json({
        ok: true,
        count: 0,
        message: "No valid Expo push tokens found",
      });
    }

    const response = await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Accept-encoding": "gzip, deflate",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(validMessages),
    });

    const data = await response.json();

    if (!response.ok) {
      console.warn("[Notifications API] Expo Push Service error response:", data);
      return NextResponse.json(
        { ok: false, error: "Expo Push Service rejected request", data },
        { status: response.status }
      );
    }

    return NextResponse.json({ ok: true, count: validMessages.length, data });
  } catch (error: any) {
    console.error("[Notifications API] Exception in push dispatch:", error);
    return NextResponse.json(
      { ok: false, error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
