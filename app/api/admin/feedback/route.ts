import { createSign, randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function encodeBase64Url(value: string | Buffer) {
  return Buffer.from(value).toString("base64url");
}

async function authorizeAdmin(request: NextRequest) {
  const apiKey = process.env.FIREBASE_API_KEY;
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!apiKey || !token) throw new Error("Sign in is required.");
  const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken: token }),
    cache: "no-store",
  });
  const payload = (await response.json()) as { users?: Array<{ email?: string }> };
  const email = payload.users?.[0]?.email?.toLowerCase();
  const allowedEmails = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);
  if (!response.ok || !email) throw new Error("Your session is invalid or expired.");
  if (!allowedEmails.length || !allowedEmails.includes(email)) {
    throw new Error("This account is not on the Gabvia admin allowlist.");
  }
  const roleEntries = (process.env.ADMIN_ROLES ?? "").split(",").map((entry) => entry.trim()).filter(Boolean);
  const roleEntry = roleEntries.find(
    (entry) => entry.toLowerCase().startsWith(`${email}=`) || entry.toLowerCase().startsWith(`${email}:`)
  );
  return { email, role: roleEntry?.split(/[=:]/)[1]?.trim().toLowerCase() || "owner", idToken: token };
}

function firestoreString(value: string) {
  return { stringValue: value };
}

function requestMetadata(request: NextRequest) {
  const userAgent = request.headers.get("user-agent") ?? "";
  const forwardedFor = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const ipAddress = forwardedFor || request.headers.get("x-real-ip") || "Unknown";
  const country = request.headers.get("x-vercel-ip-country") || request.headers.get("cf-ipcountry") || "Unknown";
  const region = request.headers.get("x-vercel-ip-country-region") || "";
  const city = request.headers.get("x-vercel-ip-city") || "";
  const location = [city, region, country].filter(Boolean).join(", ") || "Unknown";
  const operatingSystem = /Windows/i.test(userAgent)
    ? "Windows"
    : /Android/i.test(userAgent)
    ? "Android"
    : /iPhone|iPad|iPod/i.test(userAgent)
    ? "iOS"
    : /Mac OS X|Macintosh/i.test(userAgent)
    ? "macOS"
    : /Linux/i.test(userAgent)
    ? "Linux"
    : "Unknown";
  const browser = /Edg\//i.test(userAgent)
    ? "Microsoft Edge"
    : /Chrome\//i.test(userAgent)
    ? "Google Chrome"
    : /Firefox\//i.test(userAgent)
    ? "Mozilla Firefox"
    : /Safari\//i.test(userAgent)
    ? "Safari"
    : "Unknown";
  return { ipAddress, location, operatingSystem, browser, userAgent };
}

async function writeAuditLog(
  projectId: string,
  accessToken: string,
  entry: {
    adminEmail: string;
    action: string;
    userId: string;
    metadata: ReturnType<typeof requestMetadata>;
    details?: string;
  }
) {
  const fields: Record<string, unknown> = {
    admin_email: firestoreString(entry.adminEmail),
    action: firestoreString(entry.action),
    user_id: firestoreString(entry.userId),
    ip_address: firestoreString(entry.metadata.ipAddress),
    location: firestoreString(entry.metadata.location),
    operating_system: firestoreString(entry.metadata.operatingSystem),
    browser: firestoreString(entry.metadata.browser),
    user_agent: firestoreString(entry.metadata.userAgent),
    created_at: { timestampValue: new Date().toISOString() },
  };
  if (entry.details) {
    fields.details = firestoreString(entry.details);
  }
  await fetch(
    `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/admin_audit_logs?documentId=${randomUUID()}`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
      body: JSON.stringify({ fields }),
      cache: "no-store",
    }
  ).catch((err) => {
    console.warn("[Admin Feedback] Failed to write audit log:", err);
  });
}

async function getGoogleAccessToken() {
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n");
  if (!clientEmail || !privateKey) return null;
  const now = Math.floor(Date.now() / 1000);
  const unsignedToken = `${encodeBase64Url(JSON.stringify({ alg: "RS256", typ: "JWT" }))}.${encodeBase64Url(
    JSON.stringify({
      iss: clientEmail,
      scope: "https://www.googleapis.com/auth/cloud-platform",
      aud: "https://oauth2.googleapis.com/token",
      iat: now,
      exp: now + 3600,
    })
  )}`;
  const signer = createSign("RSA-SHA256");
  signer.update(unsignedToken);
  const assertion = `${unsignedToken}.${encodeBase64Url(signer.sign(privateKey))}`;
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion }),
    cache: "no-store",
  });
  const payload = (await response.json()) as { access_token?: string; error_description?: string };
  if (!response.ok || !payload.access_token) return null;
  return payload.access_token;
}

export async function PATCH(request: NextRequest) {
  try {
    const admin = await authorizeAdmin(request);
    const body = (await request.json().catch(() => null)) as {
      id?: string;
      ticketId?: string;
      status?: string;
      notes?: string;
    } | null;

    if (!body || (!body.id && !body.ticketId) || !body.status) {
      return NextResponse.json({ ok: false, error: "Feedback ID and status are required." }, { status: 400 });
    }

    const docId = (body.ticketId || body.id || "").trim();
    const status = body.status.trim().toLowerCase();
    const validStatuses = ["new", "in_progress", "resolved", "archived"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ ok: false, error: "Invalid status value." }, { status: 400 });
    }

    const projectId = process.env.FIREBASE_PROJECT_ID;
    const apiKey = process.env.FIREBASE_API_KEY;
    if (!projectId || !apiKey) {
      return NextResponse.json({ ok: false, error: "Firebase configuration is missing." }, { status: 500 });
    }

    const serverAccessToken = await getGoogleAccessToken();
    const tokenToUse = serverAccessToken || admin.idToken;

    const params = new URLSearchParams();
    params.append("updateMask.fieldPaths", "status");
    params.append("updateMask.fieldPaths", "updated_at");
    if (body.notes) {
      params.append("updateMask.fieldPaths", "admin_notes");
    }

    const fields: Record<string, unknown> = {
      status: { stringValue: status },
      updated_at: { timestampValue: new Date().toISOString() },
    };
    if (body.notes) {
      fields.admin_notes = { stringValue: body.notes.trim() };
    }

    // Try support_queries collection first, then feedback collection
    const urlPrimary = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/support_queries/${encodeURIComponent(
      docId
    )}?${params.toString()}&key=${apiKey}`;

    let patchResponse = await fetch(urlPrimary, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${tokenToUse}`, "Content-Type": "application/json" },
      body: JSON.stringify({ fields }),
      cache: "no-store",
    });

    if (!patchResponse.ok) {
      const urlSecondary = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/feedback/${encodeURIComponent(
        docId
      )}?${params.toString()}&key=${apiKey}`;
      patchResponse = await fetch(urlSecondary, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${tokenToUse}`, "Content-Type": "application/json" },
        body: JSON.stringify({ fields }),
        cache: "no-store",
      });
    }

    if (!patchResponse.ok) {
      const errPayload = await patchResponse.json().catch(() => null);
      throw new Error(errPayload?.error?.message ?? `Failed to update feedback status (HTTP ${patchResponse.status}).`);
    }

    await writeAuditLog(projectId, tokenToUse, {
      adminEmail: admin.email,
      action: `update_feedback_status:${status}`,
      userId: docId,
      metadata: requestMetadata(request),
      details: `Status set to ${status}${body.notes ? `: ${body.notes}` : ""}`,
    });

    return NextResponse.json({ ok: true, id: docId, status });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not update feedback status.";
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const admin = await authorizeAdmin(request);
    const body = (await request.json().catch(() => null)) as { id?: string; ticketId?: string } | null;

    if (!body || (!body.id && !body.ticketId)) {
      return NextResponse.json({ ok: false, error: "Feedback ID is required." }, { status: 400 });
    }

    const docId = (body.ticketId || body.id || "").trim();
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const apiKey = process.env.FIREBASE_API_KEY;
    if (!projectId || !apiKey) {
      return NextResponse.json({ ok: false, error: "Firebase configuration is missing." }, { status: 500 });
    }

    const serverAccessToken = await getGoogleAccessToken();
    const tokenToUse = serverAccessToken || admin.idToken;

    // Try deleting from support_queries
    const urlPrimary = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/support_queries/${encodeURIComponent(
      docId
    )}?key=${apiKey}`;

    let delResponse = await fetch(urlPrimary, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${tokenToUse}` },
      cache: "no-store",
    });

    if (!delResponse.ok) {
      const urlSecondary = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/feedback/${encodeURIComponent(
        docId
      )}?key=${apiKey}`;
      delResponse = await fetch(urlSecondary, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${tokenToUse}` },
        cache: "no-store",
      });
    }

    if (!delResponse.ok) {
      const errPayload = await delResponse.json().catch(() => null);
      throw new Error(errPayload?.error?.message ?? `Failed to delete feedback entry (HTTP ${delResponse.status}).`);
    }

    await writeAuditLog(projectId, tokenToUse, {
      adminEmail: admin.email,
      action: "delete_feedback",
      userId: docId,
      metadata: requestMetadata(request),
    });

    return NextResponse.json({ ok: true, id: docId });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not delete feedback.";
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }
}
