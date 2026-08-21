import { createSign, randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const BULK_ACTION_LIMIT = 50;
type AccountAction = "suspend" | "restore" | "delete";

function encodeBase64Url(value: string | Buffer) {
  return Buffer.from(value).toString("base64url");
}

async function authorizeAdmin(request: NextRequest) {
  const apiKey = process.env.FIREBASE_API_KEY;
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!apiKey || !token) throw new Error("Sign in is required.");
  const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ idToken: token }), cache: "no-store" });
  const payload = await response.json() as { users?: Array<{ email?: string }> };
  const email = payload.users?.[0]?.email?.toLowerCase();
  const allowedEmails = (process.env.ADMIN_EMAILS ?? "").split(",").map((value) => value.trim().toLowerCase()).filter(Boolean);
  if (!response.ok || !email) throw new Error("Your session is invalid or expired.");
  if (!allowedEmails.length || !allowedEmails.includes(email)) throw new Error("This account is not on the Gabvia admin allowlist.");
  const roleEntries = (process.env.ADMIN_ROLES ?? "").split(",").map((entry) => entry.trim()).filter(Boolean);
  const roleEntry = roleEntries.find((entry) => entry.toLowerCase().startsWith(`${email}=`) || entry.toLowerCase().startsWith(`${email}:`));
  return { email, role: roleEntry?.split(/[=:]/)[1]?.trim().toLowerCase() || "owner" };
}

function firestoreString(value: string) {
  return { stringValue: value };
}

async function writeAuditLog(projectId: string, accessToken: string, entry: { adminEmail: string; action: string; userId: string }) {
  const response = await fetch(`https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/admin_audit_logs?documentId=${randomUUID()}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
    body: JSON.stringify({ fields: { admin_email: firestoreString(entry.adminEmail), action: firestoreString(entry.action), user_id: firestoreString(entry.userId), created_at: { timestampValue: new Date().toISOString() } } }),
    cache: "no-store",
  });
  if (!response.ok) throw new Error("Could not write admin audit log.");
}

async function getGoogleAccessToken() {
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n");
  if (!clientEmail || !privateKey) throw new Error("Admin account actions require FIREBASE_ADMIN_CLIENT_EMAIL and FIREBASE_ADMIN_PRIVATE_KEY.");
  const now = Math.floor(Date.now() / 1000);
  const unsignedToken = `${encodeBase64Url(JSON.stringify({ alg: "RS256", typ: "JWT" }))}.${encodeBase64Url(JSON.stringify({ iss: clientEmail, scope: "https://www.googleapis.com/auth/cloud-platform", aud: "https://oauth2.googleapis.com/token", iat: now, exp: now + 3600 }))}`;
  const signer = createSign("RSA-SHA256");
  signer.update(unsignedToken);
  const assertion = `${unsignedToken}.${encodeBase64Url(signer.sign(privateKey))}`;
  const response = await fetch("https://oauth2.googleapis.com/token", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion }), cache: "no-store" });
  const payload = await response.json() as { access_token?: string; error_description?: string };
  if (!response.ok || !payload.access_token) throw new Error(payload.error_description ?? "Could not authenticate the Firebase admin service account.");
  return payload.access_token;
}

async function updateAuthUser(projectId: string, accessToken: string, userId: string, disabled: boolean) {
  const response = await fetch(`https://identitytoolkit.googleapis.com/v1/projects/${projectId}/accounts:update`, { method: "POST", headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" }, body: JSON.stringify({ localId: userId, disableUser: disabled }), cache: "no-store" });
  if (!response.ok) {
    const payload = await response.json().catch(() => null) as { error?: { message?: string } } | null;
    throw new Error(payload?.error?.message ?? "Could not update the Firebase Auth account.");
  }
}

async function updateProfile(projectId: string, accessToken: string, userId: string, suspended: boolean) {
  const now = new Date().toISOString();
  const params = new URLSearchParams();
  ["status", "suspended_at", "updated_at"].forEach((fieldPath) => params.append("updateMask.fieldPaths", fieldPath));
  const response = await fetch(`https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/profiles/${encodeURIComponent(userId)}?${params.toString()}`, { method: "PATCH", headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" }, body: JSON.stringify({ fields: { status: { stringValue: suspended ? "suspended" : "active" }, suspended_at: suspended ? { timestampValue: now } : { nullValue: null }, updated_at: { stringValue: now } } }), cache: "no-store" });
  if (!response.ok) {
    const payload = await response.json().catch(() => null) as { error?: { message?: string } } | null;
    throw new Error(payload?.error?.message ?? "Could not update the user profile.");
  }
}

async function deleteProfile(projectId: string, accessToken: string, userId: string) {
  const response = await fetch(`https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/profiles/${encodeURIComponent(userId)}`, { method: "DELETE", headers: { Authorization: `Bearer ${accessToken}` }, cache: "no-store" });
  if (!response.ok && response.status !== 404) {
    const payload = await response.json().catch(() => null) as { error?: { message?: string } } | null;
    throw new Error(payload?.error?.message ?? "Could not delete the user profile.");
  }
}

async function deleteAuthUser(projectId: string, accessToken: string, userId: string) {
  const response = await fetch(`https://identitytoolkit.googleapis.com/v1/projects/${projectId}/accounts:delete`, { method: "POST", headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" }, body: JSON.stringify({ localId: userId }), cache: "no-store" });
  if (!response.ok) {
    const payload = await response.json().catch(() => null) as { error?: { message?: string } } | null;
    throw new Error(payload?.error?.message ?? "Could not delete the Firebase Auth account.");
  }
}

function normalizeUserIds(userIds: unknown) {
  if (!Array.isArray(userIds)) return [];
  return Array.from(new Set(userIds.filter((value): value is string => typeof value === "string").map((value) => value.trim()).filter(Boolean)));
}

async function runAccountAction(projectId: string, accessToken: string, userId: string, action: AccountAction) {
  if (action === "delete") {
    await deleteAuthUser(projectId, accessToken, userId);
    await deleteProfile(projectId, accessToken, userId);
    return;
  }
  await updateAuthUser(projectId, accessToken, userId, action === "suspend");
  await updateProfile(projectId, accessToken, userId, action === "suspend");
}

async function runBulkActions(projectId: string, accessToken: string, userIds: string[], action: AccountAction, adminEmail: string) {
  const results: Array<{ userId: string; ok: boolean; error?: string }> = [];
  for (const userId of userIds) {
    try {
      await runAccountAction(projectId, accessToken, userId, action);
      try { await writeAuditLog(projectId, accessToken, { adminEmail, action: `bulk_${action}`, userId }); } catch { /* Account action remains successful if audit logging is unavailable. */ }
      results.push({ userId, ok: true });
    } catch (error) {
      results.push({ userId, ok: false, error: error instanceof Error ? error.message : "Could not update this account." });
    }
  }
  return results;
}

export async function PATCH(request: NextRequest) {
  try {
    const { email: adminEmail, role } = await authorizeAdmin(request);
    const body = await request.json() as { userId?: string; userIds?: unknown; action?: "suspend" | "restore" };
    const bulkUserIds = normalizeUserIds(body.userIds);
    if (bulkUserIds.length > 0) {
      if (!body.action || !["suspend", "restore"].includes(body.action)) return NextResponse.json({ ok: false, error: "A valid bulk account action is required." }, { status: 400 });
      if (bulkUserIds.length > BULK_ACTION_LIMIT) return NextResponse.json({ ok: false, error: `You can process up to ${BULK_ACTION_LIMIT} accounts at a time.` }, { status: 400 });
      if (body.action === "suspend" && !["owner", "admin", "moderator"].includes(role)) return NextResponse.json({ ok: false, error: "Your admin role cannot suspend accounts." }, { status: 403 });
      const projectId = process.env.FIREBASE_PROJECT_ID;
      if (!projectId) throw new Error("Firebase project configuration is missing.");
      const results = await runBulkActions(projectId, await getGoogleAccessToken(), bulkUserIds, body.action, adminEmail);
      const succeeded = results.filter((result) => result.ok).length;
      return NextResponse.json({ ok: true, action: body.action, requested: bulkUserIds.length, succeeded, failed: results.length - succeeded, results });
    }
    const userId = body.userId?.trim();
    if (!userId || !body.action) return NextResponse.json({ ok: false, error: "A user and action are required." }, { status: 400 });
    if (body.action === "suspend" && !["owner", "admin", "moderator"].includes(role)) return NextResponse.json({ ok: false, error: "Your admin role cannot suspend accounts." }, { status: 403 });
    const projectId = process.env.FIREBASE_PROJECT_ID;
    if (!projectId) throw new Error("Firebase project configuration is missing.");
    const accessToken = await getGoogleAccessToken();
    await updateAuthUser(projectId, accessToken, userId, body.action === "suspend");
    await updateProfile(projectId, accessToken, userId, body.action === "suspend");
    try { await writeAuditLog(projectId, accessToken, { adminEmail, action: body.action, userId }); } catch { /* Account action remains successful if audit logging is unavailable. */ }
    return NextResponse.json({ ok: true, action: body.action, userId });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : "Could not update the account." }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { email: adminEmail, role } = await authorizeAdmin(request);
    const body = await request.json() as { userId?: string; userIds?: unknown; confirmation?: string };
    const bulkUserIds = normalizeUserIds(body.userIds);
    if (bulkUserIds.length > 0) {
      if (body.confirmation !== "DELETE USERS") return NextResponse.json({ ok: false, error: "Type DELETE USERS to confirm bulk account deletion." }, { status: 400 });
      if (bulkUserIds.length > BULK_ACTION_LIMIT) return NextResponse.json({ ok: false, error: `You can process up to ${BULK_ACTION_LIMIT} accounts at a time.` }, { status: 400 });
      if (!["owner", "admin"].includes(role)) return NextResponse.json({ ok: false, error: "Only owner or admin roles can delete accounts." }, { status: 403 });
      const projectId = process.env.FIREBASE_PROJECT_ID;
      if (!projectId) throw new Error("Firebase project configuration is missing.");
      const results = await runBulkActions(projectId, await getGoogleAccessToken(), bulkUserIds, "delete", adminEmail);
      const succeeded = results.filter((result) => result.ok).length;
      return NextResponse.json({ ok: true, action: "delete", requested: bulkUserIds.length, succeeded, failed: results.length - succeeded, results });
    }
    const userId = body.userId?.trim();
    if (!userId || body.confirmation !== "DELETE") return NextResponse.json({ ok: false, error: "Type DELETE to confirm permanent account deletion." }, { status: 400 });
    if (!["owner", "admin"].includes(role)) return NextResponse.json({ ok: false, error: "Only owner or admin roles can delete accounts." }, { status: 403 });
    const projectId = process.env.FIREBASE_PROJECT_ID;
    if (!projectId) throw new Error("Firebase project configuration is missing.");
    const accessToken = await getGoogleAccessToken();
    await deleteAuthUser(projectId, accessToken, userId);
    await deleteProfile(projectId, accessToken, userId);
    try { await writeAuditLog(projectId, accessToken, { adminEmail, action: "delete", userId }); } catch { /* Account action remains successful if audit logging is unavailable. */ }
    return NextResponse.json({ ok: true, action: "delete", userId });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : "Could not delete the account." }, { status: 500 });
  }
}
