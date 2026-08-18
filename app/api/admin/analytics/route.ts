import { createSign } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type FirestoreDocument = {
  name?: string;
  createTime?: string;
  fields?: Record<string, Record<string, unknown>>;
};

type FirestoreRecord = Record<string, unknown> & { __id?: string; __createTime?: string; __path?: string };

type RevenueTransaction = {
  id: string;
  provider: "Flutterwave" | "Monnify";
  amount: number;
  settledAmount: number;
  currency: string;
  status: string;
  createdAt: string;
  customer: string;
  reference: string;
};

type PaymentLedgerTransaction = {
  id: string;
  provider: "Flutterwave" | "Monnify";
  amount: number;
  settledAmount: number;
  currency: string;
  status: string;
  createdAt: string;
  customer: string;
  reference: string;
};

const DAY = 24 * 60 * 60 * 1000;

function encodeBase64Url(value: string | Buffer) {
  return Buffer.from(value).toString("base64url");
}

async function getGoogleAccessToken() {
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n");
  if (!clientEmail || !privateKey) throw new Error("Service account is not configured.");
  const now = Math.floor(Date.now() / 1000);
  const unsignedToken = `${encodeBase64Url(JSON.stringify({ alg: "RS256", typ: "JWT" }))}.${encodeBase64Url(JSON.stringify({ iss: clientEmail, scope: "https://www.googleapis.com/auth/cloud-platform", aud: "https://oauth2.googleapis.com/token", iat: now, exp: now + 3600 }))}`;
  const signer = createSign("RSA-SHA256");
  signer.update(unsignedToken);
  const assertion = `${unsignedToken}.${encodeBase64Url(signer.sign(privateKey))}`;
  const response = await fetch("https://oauth2.googleapis.com/token", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion }), cache: "no-store" });
  const payload = await response.json() as { access_token?: string; error_description?: string };
  if (!response.ok || !payload.access_token) throw new Error(payload.error_description ?? "Could not authenticate service account.");
  return payload.access_token;
}

function decodeFirestoreValue(value: Record<string, unknown> | undefined): unknown {
  if (!value) return null;
  if ("nullValue" in value) return null;
  if ("stringValue" in value) return value.stringValue;
  if ("booleanValue" in value) return value.booleanValue;
  if ("integerValue" in value) return Number(value.integerValue);
  if ("doubleValue" in value) return Number(value.doubleValue);
  if ("timestampValue" in value) return value.timestampValue;
  if ("referenceValue" in value) return value.referenceValue;
  if ("arrayValue" in value) {
    const arrayValue = value.arrayValue as { values?: Record<string, unknown>[] };
    return (arrayValue.values ?? []).map(decodeFirestoreValue);
  }
  if ("mapValue" in value) {
    const mapValue = value.mapValue as { fields?: Record<string, Record<string, unknown>> };
    return decodeFirestoreFields(mapValue.fields ?? {});
  }
  return null;
}

function decodeFirestoreFields(fields: Record<string, Record<string, unknown>>): FirestoreRecord {
  return Object.fromEntries(Object.entries(fields).map(([key, value]) => [key, decodeFirestoreValue(value)]));
}

function decodeDocuments(rows: Array<{ document?: FirestoreDocument }>): FirestoreRecord[] {
  return rows.flatMap((row) => {
    if (!row.document) return [];
    const name = row.document.name ?? "";
    return [{
      ...decodeFirestoreFields(row.document.fields ?? {}),
      __id: name.split("/").pop(),
      __createTime: row.document.createTime,
      __path: name,
    }];
  });
}

async function runFirestoreCollection(collectionId: string, allDescendants = false, idToken?: string) {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const apiKey = process.env.FIREBASE_API_KEY;
  if (!projectId || !apiKey) throw new Error("Firebase server configuration is missing.");

  const response = await fetch(
    `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents:runQuery?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(idToken ? { Authorization: `Bearer ${idToken}` } : {}) },
      cache: "no-store",
      body: JSON.stringify({
        structuredQuery: {
          from: [{ collectionId, allDescendants }],
        },
      }),
    },
  );

  const payload = (await response.json()) as Array<{ document?: FirestoreDocument; error?: { message?: string } }>;
  if (!response.ok) throw new Error(payload?.[0]?.error?.message ?? `Could not read ${collectionId}.`);
  return decodeDocuments(payload);
}

function parseDate(value: unknown, fallback?: unknown) {
  if (value instanceof Date) return value;
  if (typeof value === "number") return new Date(value);
  if (typeof value === "string" && value) {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }
  if (typeof fallback === "string" && fallback) {
    const parsed = new Date(fallback);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }
  return null;
}

function dateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function monthKey(date: Date) {
  return date.toISOString().slice(0, 7);
}

function makeDateRange(days: number) {
  const end = new Date();
  const start = new Date(end.getTime() - days * DAY);
  return { start, end };
}

function round(value: number) {
  return Math.round(value * 100) / 100;
}

function trimBaseUrl(value?: string) {
  return (value ?? "").replace(/\/$/, "");
}

async function getFlutterwaveTransactions(from: Date, to: Date): Promise<RevenueTransaction[]> {
  const baseUrl = trimBaseUrl(process.env.FLUTTERWAVE_BASE_URL);
  const secretKey = process.env.FLUTTERWAVE_SECRET_KEY;
  if (!baseUrl || !secretKey) return [];

  const transactions: RevenueTransaction[] = [];
  let page = 1;
  let totalPages = 1;
  do {
    const params = new URLSearchParams({
      from: dateKey(from),
      to: dateKey(to),
      page: String(page),
      status: "successful",
    });
    const response = await fetch(`${baseUrl}/transactions?${params.toString()}`, {
      headers: { Authorization: `Bearer ${secretKey}`, Accept: "application/json" },
      cache: "no-store",
    });
    const payload = await response.json() as { data?: Array<Record<string, unknown>>; meta?: { page_info?: { total_pages?: number } }; message?: string };
    if (!response.ok) throw new Error(payload.message ?? "Flutterwave returned an error.");
    totalPages = Math.min(payload.meta?.page_info?.total_pages ?? 1, 10);
    for (const item of payload.data ?? []) {
      const customer = item.customer as { email?: string; name?: string } | undefined;
      transactions.push({
        id: String(item.id ?? item.tx_ref ?? transactions.length),
        provider: "Flutterwave",
        amount: Number(item.amount ?? 0),
        settledAmount: Number(item.amount_settled ?? item.amount ?? 0),
        currency: String(item.currency ?? "NGN"),
        status: String(item.status ?? "successful"),
        createdAt: String(item.created_at ?? new Date().toISOString()),
        customer: customer?.name || customer?.email || "Customer",
        reference: String(item.tx_ref ?? item.flw_ref ?? "—"),
      });
    }
    page += 1;
  } while (page <= totalPages);
  return transactions;
}

async function getMonnifyTransactions(from: Date, to: Date): Promise<RevenueTransaction[]> {
  const baseUrl = trimBaseUrl(process.env.MONNIFY_BASE_URL);
  const apiKey = process.env.MONNIFY_API_KEY;
  const secretKey = process.env.MONNIFY_SECRET_KEY;
  if (!baseUrl || !apiKey || !secretKey) return [];

  const credentials = Buffer.from(`${apiKey}:${secretKey}`).toString("base64");
  const authResponse = await fetch(`${baseUrl}/auth/login`, {
    method: "POST",
    headers: { Authorization: `Basic ${credentials}`, Accept: "application/json" },
    cache: "no-store",
  });
  const authPayload = await authResponse.json() as { responseBody?: { accessToken?: string }; responseMessage?: string };
  if (!authResponse.ok || !authPayload.responseBody?.accessToken) {
    throw new Error(authPayload.responseMessage ?? "Monnify authentication failed.");
  }

  const transactions: RevenueTransaction[] = [];
  let page = 0;
  let totalPages = 1;
  do {
    const params = new URLSearchParams({
      from: String(from.getTime()),
      to: String(to.getTime()),
      pageSize: "100",
      pageNo: String(page),
    });
    const response = await fetch(`${baseUrl}/merchant/transactions/search?${params.toString()}`, {
      headers: { Authorization: `Bearer ${authPayload.responseBody.accessToken}`, Accept: "application/json" },
      cache: "no-store",
    });
    const payload = await response.json() as { responseBody?: { content?: Array<Record<string, unknown>>; totalPages?: number }; responseMessage?: string };
    if (!response.ok) throw new Error(payload.responseMessage ?? "Monnify returned an error.");
    const body = payload.responseBody ?? {};
    totalPages = Math.min(body.totalPages ?? 1, 10);
    for (const item of body.content ?? []) {
      const status = String(item.paymentStatus ?? item.status ?? "").toUpperCase();
      if (status !== "PAID" && status !== "SUCCESS" && status !== "SUCCESSFUL") continue;
      transactions.push({
        id: String(item.transactionReference ?? item.paymentReference ?? transactions.length),
        provider: "Monnify",
        amount: Number(item.amountPaid ?? item.amount ?? 0),
        settledAmount: Number(item.settlementAmount ?? item.amountPaid ?? item.amount ?? 0),
        currency: String(item.currencyCode ?? "NGN"),
        status,
        createdAt: String(item.transactionDate ?? item.createdOn ?? new Date().toISOString()),
        customer: String(item.customerName ?? item.customerEmail ?? "Customer"),
        reference: String(item.paymentReference ?? item.transactionReference ?? "—"),
      });
    }
    page += 1;
  } while (page < totalPages);
  return transactions;
}

async function authorize(request: NextRequest) {
  const apiKey = process.env.FIREBASE_API_KEY;
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!apiKey || !token) throw new Error("Sign in is required.");

  const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken: token }),
    cache: "no-store",
  });
  const payload = await response.json() as { users?: Array<{ email?: string; emailVerified?: boolean }> };
  const account = payload.users?.[0];
  const allowedEmails = (process.env.ADMIN_EMAILS ?? "").split(",").map((email) => email.trim().toLowerCase()).filter(Boolean);
  if (!response.ok || !account?.email) throw new Error("Your session is invalid or expired.");
  if (allowedEmails.length === 0) throw new Error("Admin access is not configured. Add ADMIN_EMAILS to the web app environment.");
  if (!allowedEmails.includes(account.email.toLowerCase())) throw new Error("This account is not on the Gabvia admin allowlist.");
  const roleEntries = (process.env.ADMIN_ROLES ?? "").split(",").map((entry) => entry.trim()).filter(Boolean);
  const roleEntry = roleEntries.find((entry) => entry.toLowerCase().startsWith(`${account.email?.toLowerCase()}=`) || entry.toLowerCase().startsWith(`${account.email?.toLowerCase()}:`));
  const role = roleEntry?.split(/[=:]/)[1]?.trim().toLowerCase() || "owner";
  return { email: account.email, idToken: token, role };
}

function createMonthlyKeys(count: number) {
  const keys: string[] = [];
  const cursor = new Date();
  cursor.setUTCDate(1);
  cursor.setUTCMonth(cursor.getUTCMonth() - (count - 1));
  for (let index = 0; index < count; index += 1) {
    keys.push(monthKey(cursor));
    cursor.setUTCMonth(cursor.getUTCMonth() + 1);
  }
  return keys;
}

function getMessageIdFromPath(path?: string) {
  if (!path) return "";
  const parts = path.split("/");
  const messageIndex = parts.lastIndexOf("messages");
  return messageIndex >= 0 ? parts[messageIndex + 1] ?? "" : "";
}

function getTranslationMessageIdFromPath(path?: string) {
  if (!path) return "";
  const parts = path.split("/");
  const messageIndex = parts.lastIndexOf("messages");
  return messageIndex >= 0 ? parts[messageIndex + 1] ?? "" : "";
}

export async function GET(request: NextRequest) {
  try {
    const { email: adminEmail, idToken, role: adminRole } = await authorize(request);
    const { start: activityStart, end: activityEnd } = makeDateRange(365);
    const [profiles, conversations, messages, translations, waitlist, revenueResults] = await Promise.all([
      runFirestoreCollection("profiles", false, idToken),
      runFirestoreCollection("conversations", false, idToken),
      runFirestoreCollection("messages", true, idToken),
      runFirestoreCollection("translations", true, idToken),
      runFirestoreCollection("waitlist", false, idToken),
      Promise.allSettled([
        getFlutterwaveTransactions(activityStart, activityEnd),
        getMonnifyTransactions(activityStart, activityEnd),
      ]),
    ]);

    const warnings = revenueResults.flatMap((result, index) => {
      if (result.status === "rejected") return [`${index === 0 ? "Flutterwave" : "Monnify"}: ${result.reason instanceof Error ? result.reason.message : "Could not load transactions."}`];
      return [];
    });
    const providerTransactions = revenueResults.flatMap((result) => result.status === "fulfilled" ? result.value : []);
    const paymentLedgerResult = await Promise.allSettled([runFirestoreCollection("payment_transactions", false, idToken)]);
    let paymentRecords = paymentLedgerResult[0].status === "fulfilled" ? paymentLedgerResult[0].value : [];
    if (paymentLedgerResult[0].status === "rejected" && process.env.FIREBASE_ADMIN_CLIENT_EMAIL && process.env.FIREBASE_ADMIN_PRIVATE_KEY) {
      try {
        paymentRecords = await runFirestoreCollection("payment_transactions", false, await getGoogleAccessToken());
      } catch {
        warnings.push("Payment ledger: Could not load recorded successful payments.");
      }
    } else if (paymentLedgerResult[0].status === "rejected") {
      warnings.push("Payment ledger: Could not load recorded successful payments.");
    }
    const reportsResult = await Promise.allSettled([runFirestoreCollection("reports", false, idToken)]);
    let reportRecords = reportsResult[0].status === "fulfilled" ? reportsResult[0].value : [];
    if (reportsResult[0].status === "rejected" && process.env.FIREBASE_ADMIN_CLIENT_EMAIL && process.env.FIREBASE_ADMIN_PRIVATE_KEY) {
      try {
        reportRecords = await runFirestoreCollection("reports", false, await getGoogleAccessToken());
      } catch {
        reportRecords = [];
      }
    }
    const ledgerTransactions: PaymentLedgerTransaction[] = paymentRecords
      .filter((record) => String(record.status || "successful") === "successful")
      .map((record) => ({
        id: String(record.__id ?? "—"),
        provider: String(record.provider || "Monnify") === "Flutterwave" ? "Flutterwave" : "Monnify",
        amount: Number(record.amount ?? 0),
        settledAmount: Number(record.amount ?? 0),
        currency: String(record.currency || "NGN"),
        status: String(record.status || "successful"),
        createdAt: String(record.created_at || record.__createTime || new Date().toISOString()),
        customer: String(record.user_id || "Gabvia user"),
        reference: String(record.reference || record.__id || "—"),
      }));
    // New verified payments use the ledger. Provider API data remains a legacy
    // fallback until the ledger has its first successful payment.
    const transactions: RevenueTransaction[] = ledgerTransactions.length > 0 ? ledgerTransactions : providerTransactions;
    let auditLogs: FirestoreRecord[] = [];
    if (process.env.FIREBASE_ADMIN_CLIENT_EMAIL && process.env.FIREBASE_ADMIN_PRIVATE_KEY) {
      try {
        const serviceToken = await getGoogleAccessToken();
        auditLogs = await runFirestoreCollection("admin_audit_logs", false, serviceToken);
      } catch (error) {
        warnings.push(`Audit log: ${error instanceof Error ? error.message : "Could not load audit events."}`);
      }
    }

    const now = new Date();
    const todayStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
    const activeSince = new Date(now.getTime() - 30 * DAY);
    const activeUserIds = new Set<string>();
    const dailyUsers = new Map<string, Set<string>>();
    const dailyMessages = new Map<string, number>();
    const monthlyUsers = new Map<string, Set<string>>();
    const monthlyMessages = new Map<string, number>();
    const userActivityDates = new Map<string, Set<string>>();

    for (const message of messages) {
      const date = parseDate(message.created_at, message.__createTime);
      const senderId = typeof message.sender_id === "string" ? message.sender_id : "";
      if (!date || !senderId) continue;
      const day = dateKey(date);
      const month = monthKey(date);
      dailyMessages.set(day, (dailyMessages.get(day) ?? 0) + 1);
      monthlyMessages.set(month, (monthlyMessages.get(month) ?? 0) + 1);
      if (!userActivityDates.has(senderId)) userActivityDates.set(senderId, new Set());
      userActivityDates.get(senderId)?.add(day);
      if (date >= activeSince && date <= now) {
        activeUserIds.add(senderId);
        if (!dailyUsers.has(day)) dailyUsers.set(day, new Set());
        dailyUsers.get(day)?.add(senderId);
      }
      if (!monthlyUsers.has(month)) monthlyUsers.set(month, new Set());
      monthlyUsers.get(month)?.add(senderId);
    }

    const dailyTrend = Array.from({ length: 30 }, (_, index) => {
      const date = new Date(todayStart.getTime() - (29 - index) * DAY);
      const key = dateKey(date);
      return { label: date.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" }), date: key, activeUsers: dailyUsers.get(key)?.size ?? 0, messages: dailyMessages.get(key) ?? 0 };
    });
    const monthlyKeys = createMonthlyKeys(12);
    const monthlyTrend = monthlyKeys.map((key) => ({
      label: new Date(`${key}-01T00:00:00Z`).toLocaleDateString("en-US", { month: "short", timeZone: "UTC" }),
      month: key,
      activeUsers: monthlyUsers.get(key)?.size ?? 0,
      signups: profiles.filter((profile) => { const date = parseDate(profile.created_at, profile.__createTime); return date ? monthKey(date) === key : false; }).length,
      messages: monthlyMessages.get(key) ?? 0,
    }));

    const languageCounts = new Map<string, number>();
    for (const profile of profiles) {
      const language = typeof profile.native_language === "string" && profile.native_language ? profile.native_language : "Unknown";
      languageCounts.set(language, (languageCounts.get(language) ?? 0) + 1);
    }
    const profileById = new Map(profiles.map((profile) => [String(profile.__id ?? profile.id ?? ""), profile]));
    const referralCounts = new Map<string, number>();
    for (const profile of profiles) {
      if (typeof profile.referred_by === "string" && profile.referred_by) referralCounts.set(profile.referred_by, (referralCounts.get(profile.referred_by) ?? 0) + 1);
    }
    const messageOwnerById = new Map<string, string>();
    const userStats = new Map<string, { messages: number; textMessages: number; voiceMessages: number; conversationIds: Set<string>; lastActive: Date | null; translations: number }>();
    for (const message of messages) {
      const userId = typeof message.sender_id === "string" ? message.sender_id : "";
      const messageId = getMessageIdFromPath(message.__path) || String(message.__id ?? "");
      if (messageId && userId) messageOwnerById.set(messageId, userId);
      if (!userId) continue;
      const stats = userStats.get(userId) ?? { messages: 0, textMessages: 0, voiceMessages: 0, conversationIds: new Set<string>(), lastActive: null, translations: 0 };
      stats.messages += 1;
      if (message.type === "voice") stats.voiceMessages += 1;
      else stats.textMessages += 1;
      const pathParts = typeof message.__path === "string" ? message.__path.split("/").filter(Boolean) : [];
      const conversationIndex = pathParts.lastIndexOf("conversations");
      const conversationId = conversationIndex >= 0 ? pathParts[conversationIndex + 1] ?? "" : "";
      if (conversationId) stats.conversationIds.add(conversationId);
      const messageDate = parseDate(message.created_at, message.__createTime);
      if (messageDate && (!stats.lastActive || messageDate > stats.lastActive)) stats.lastActive = messageDate;
      userStats.set(userId, stats);
    }
    for (const translation of translations) {
      const messageId = getTranslationMessageIdFromPath(translation.__path);
      const userId = messageOwnerById.get(messageId);
      if (!userId) continue;
      const stats = userStats.get(userId) ?? { messages: 0, textMessages: 0, voiceMessages: 0, conversationIds: new Set<string>(), lastActive: null, translations: 0 };
      stats.translations += 1;
      userStats.set(userId, stats);
    }
    for (const conversation of conversations) {
      const conversationDate = parseDate(conversation.last_message_at, conversation.__createTime);
      const participants = Array.isArray(conversation.participants) ? conversation.participants.filter((id): id is string => typeof id === "string") : [];
      for (const userId of participants) {
        const stats = userStats.get(userId) ?? { messages: 0, textMessages: 0, voiceMessages: 0, conversationIds: new Set<string>(), lastActive: null, translations: 0 };
        if (conversation.__id) stats.conversationIds.add(conversation.__id);
        if (conversationDate && (!stats.lastActive || conversationDate > stats.lastActive)) stats.lastActive = conversationDate;
        userStats.set(userId, stats);
      }
    }
    const users = profiles
      .map((profile) => {
        const id = String(profile.__id ?? profile.id ?? "—");
        const stats = userStats.get(id) ?? { messages: 0, textMessages: 0, voiceMessages: 0, conversationIds: new Set<string>(), lastActive: null, translations: 0 };
        const referrerId = typeof profile.referred_by === "string" ? profile.referred_by : "";
        const referrer = profileById.get(referrerId);
        return {
          id,
          name: String(profile.full_name || profile.username || "Unnamed user"),
          username: String(profile.username || "—"),
          language: String(profile.native_language || "Unknown"),
          points: Number(profile.gab_points ?? 0),
          status: String(profile.status || "active"),
          createdAt: parseDate(profile.created_at, profile.__createTime)?.toISOString() ?? null,
          updatedAt: parseDate(profile.updated_at)?.toISOString() ?? null,
          lastActive: stats.lastActive?.toISOString() ?? null,
          messages: stats.messages,
          textMessages: stats.textMessages,
          voiceMessages: stats.voiceMessages,
          conversations: stats.conversationIds.size,
          translations: stats.translations,
          referralCode: String(profile.referral_code || "—"),
          referredBy: referrer ? String(referrer.full_name || referrer.username || referrerId) : (referrerId || "—"),
          referredById: referrerId || null,
          referrals: referralCounts.get(id) ?? 0,
          bonusPlan: String(profile.bonus_plan || "—"),
          signupPosition: Number(profile.signup_position ?? 0) || null,
        };
      })
      .sort((left, right) => (right.createdAt ?? "").localeCompare(left.createdAt ?? ""));
    const recentUsers = users.slice(0, 8);

    const grossRevenue = transactions.reduce((sum, transaction) => sum + transaction.amount, 0);
    const settledRevenue = transactions.reduce((sum, transaction) => sum + transaction.settledAmount, 0);
    const revenueByMonth = monthlyKeys.map((month) => {
      const monthTransactions = transactions.filter((transaction) => { const date = parseDate(transaction.createdAt); return date ? monthKey(date) === month : false; });
      return { month, label: new Date(`${month}-01T00:00:00Z`).toLocaleDateString("en-US", { month: "short", timeZone: "UTC" }), gross: round(monthTransactions.reduce((sum, transaction) => sum + transaction.amount, 0)), settled: round(monthTransactions.reduce((sum, transaction) => sum + transaction.settledAmount, 0)), count: monthTransactions.length };
    });
    const waitlistEntries = waitlist
      .map((entry) => ({
        id: String(entry.__id ?? "—"),
        name: String(entry.full_name || "Unnamed"),
        email: String(entry.email || "—"),
        country: String(entry.country || "—"),
        language: String(entry.native_language || "—"),
        useCase: String(entry.use_case || "—"),
        source: String(entry.source || "promotional-site"),
        status: String(entry.status || "waitlisted"),
        createdAt: parseDate(entry.created_at, entry.__createTime)?.toISOString() ?? null,
      }))
      .sort((left, right) => (right.createdAt ?? "").localeCompare(left.createdAt ?? ""));

    const usersWithMessages = new Set(Array.from(userStats.entries()).filter(([, stats]) => stats.messages > 0).map(([id]) => id));
    const usersWithConversations = new Set(Array.from(userStats.entries()).filter(([, stats]) => stats.conversationIds.size > 0).map(([id]) => id));
    const retention = [1, 7, 30].map((days) => {
      const eligible = profiles.filter((profile) => {
        const created = parseDate(profile.created_at, profile.__createTime);
        return created ? created.getTime() <= now.getTime() - days * DAY : false;
      });
      const retained = eligible.filter((profile) => {
        const id = String(profile.__id ?? profile.id ?? "");
        const created = parseDate(profile.created_at, profile.__createTime);
        if (!created) return false;
        const target = dateKey(new Date(created.getTime() + days * DAY));
        return userActivityDates.get(id)?.has(target) ?? false;
      }).length;
      return { label: `D${days}`, retained, eligible: eligible.length, rate: eligible.length ? round((retained / eligible.length) * 100) : 0 };
    });
    const auditLogEntries = auditLogs
      .map((entry) => ({ id: String(entry.__id ?? "—"), action: String(entry.action || "admin action"), adminEmail: String(entry.admin_email || "Admin"), userId: String(entry.user_id || "—"), createdAt: parseDate(entry.created_at, entry.__createTime)?.toISOString() ?? null }))
      .sort((left, right) => (right.createdAt ?? "").localeCompare(left.createdAt ?? ""))
      .slice(0, 30);

    return NextResponse.json({
      ok: true,
      adminEmail,
      adminRole,
      lastUpdated: now.toISOString(),
      warnings,
      metrics: {
        totalUsers: profiles.length,
        dau: dailyUsers.get(dateKey(todayStart))?.size ?? 0,
        mau: activeUserIds.size,
        activeRate: activeUserIds.size ? round(((dailyUsers.get(dateKey(todayStart))?.size ?? 0) / activeUserIds.size) * 100) : 0,
        totalMessages: messages.length,
        messagesThisMonth: messages.filter((message) => { const date = parseDate(message.created_at, message.__createTime); return date ? date >= monthStart : false; }).length,
        totalConversations: conversations.length,
        groupConversations: conversations.filter((conversation) => conversation.type === "group").length,
        directConversations: conversations.filter((conversation) => conversation.type !== "group").length,
        totalTranslations: translations.length,
        referredUsers: profiles.filter((profile) => Boolean(profile.referred_by)).length,
        totalGabPoints: profiles.reduce((sum, profile) => sum + Number(profile.gab_points ?? 0), 0),
        grossRevenue: round(grossRevenue),
        settledRevenue: round(settledRevenue),
        paidTransactions: transactions.length,
        waitlistCount: waitlist.length,
      },
      insights: {
        retention,
        funnel: [
          { label: "Signed up", value: profiles.length },
          { label: "Sent a message", value: usersWithMessages.size },
          { label: "Joined a conversation", value: usersWithConversations.size },
          { label: "Active in 30 days", value: activeUserIds.size },
        ],
        features: [
          { label: "Text messages", value: messages.filter((message) => message.type !== "voice").length },
          { label: "Voice messages", value: messages.filter((message) => message.type === "voice").length },
          { label: "Translations", value: translations.length },
          { label: "Group conversations", value: conversations.filter((conversation) => conversation.type === "group").length },
          { label: "Referral signups", value: profiles.filter((profile) => Boolean(profile.referred_by)).length },
        ],
        moderation: { activeUsers: profiles.filter((profile) => profile.status !== "suspended").length, suspendedUsers: profiles.filter((profile) => profile.status === "suspended").length, reports: reportsResult[0].status === "fulfilled" || reportRecords.length > 0 ? reportRecords.length : null },
        system: { status: warnings.length ? "degraded" : "healthy", profileRecords: profiles.length, messageRecords: messages.length, conversationRecords: conversations.length, translationRecords: translations.length, paymentProviders: [{ name: "Flutterwave", configured: Boolean(process.env.FLUTTERWAVE_BASE_URL && process.env.FLUTTERWAVE_SECRET_KEY) }, { name: "Monnify", configured: Boolean(process.env.MONNIFY_BASE_URL && process.env.MONNIFY_API_KEY && process.env.MONNIFY_SECRET_KEY) }] },
      },
      trends: { daily: dailyTrend, monthly: monthlyTrend, revenue: revenueByMonth },
      breakdowns: {
        languages: Array.from(languageCounts.entries()).sort(([, left], [, right]) => right - left).slice(0, 6).map(([name, users]) => ({ name, users })),
        providers: ["Flutterwave", "Monnify"].map((provider) => {
          const providerTransactions = transactions.filter((transaction) => transaction.provider === provider);
          return { provider, transactions: providerTransactions.length, gross: round(providerTransactions.reduce((sum, transaction) => sum + transaction.amount, 0)), settled: round(providerTransactions.reduce((sum, transaction) => sum + transaction.settledAmount, 0)) };
        }),
      },
      recentUsers,
      users,
      waitlist: waitlistEntries,
      auditLogs: auditLogEntries,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not load admin analytics.";
    const status = message.includes("not configured") || message.includes("allowlist") ? 403 : 401;
    return NextResponse.json({ ok: false, error: message }, { status });
  }
}
