import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type Gateway = "monnify" | "flutterwave";

async function authorizePayment(request: NextRequest, userUid: string) {
  const apiKey = process.env.FIREBASE_API_KEY;
  const idToken = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!apiKey || !idToken) throw new Error("Sign in is required.");
  const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ idToken }), cache: "no-store" });
  const payload = await response.json() as { users?: Array<{ localId?: string }> };
  if (!response.ok || payload.users?.[0]?.localId !== userUid) throw new Error("Your payment session is invalid or expired.");
}

function baseUrl(value?: string) {
  return (value ?? "").replace(/\/$/, "");
}

async function initializeFlutterwave(amount: number, customerName: string, customerEmail: string, paymentReference: string) {
  const response = await fetch(`${baseUrl(process.env.FLUTTERWAVE_BASE_URL)}/payments`, { method: "POST", headers: { Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`, "Content-Type": "application/json" }, body: JSON.stringify({ tx_ref: paymentReference, amount: String(amount), currency: "NGN", payment_options: "card, mobilemoney, ussd, banktransfer, opay", redirect_url: process.env.PAYMENT_REDIRECT_URL ?? "https://gabvia.app/payment-status", customer: { email: customerEmail, name: customerName }, customizations: { title: "Gabvia GAB POINTS", description: "GAB POINTS purchase", logo: "https://gabvia.app/logo.png" } }), cache: "no-store" });
  const payload = await response.json() as { status?: string; message?: string; data?: { link?: string; id?: string | number } };
  if (!response.ok || payload.status !== "success" || !payload.data?.link) throw new Error(payload.message ?? "Flutterwave initialization failed.");
  return { requestSuccessful: true, responseBody: { checkoutUrl: payload.data.link, transactionReference: String(payload.data.id ?? paymentReference) } };
}

async function getMonnifyToken() {
  const credentials = Buffer.from(`${process.env.MONNIFY_API_KEY}:${process.env.MONNIFY_SECRET_KEY}`).toString("base64");
  const response = await fetch(`${baseUrl(process.env.MONNIFY_BASE_URL)}/auth/login`, { method: "POST", headers: { Authorization: `Basic ${credentials}`, Accept: "application/json" }, cache: "no-store" });
  const payload = await response.json() as { responseBody?: { accessToken?: string }; responseMessage?: string };
  if (!response.ok || !payload.responseBody?.accessToken) throw new Error(payload.responseMessage ?? "Monnify authentication failed.");
  return payload.responseBody.accessToken;
}

async function initializeMonnify(amount: number, customerName: string, customerEmail: string, paymentReference: string) {
  const token = await getMonnifyToken();
  const response = await fetch(`${baseUrl(process.env.MONNIFY_BASE_URL)}/merchant/transactions/init-transaction`, { method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, body: JSON.stringify({ amount, customerName, customerEmail, paymentReference, paymentDescription: "GAB POINTS purchase", currencyCode: "NGN", contractCode: process.env.MONNIFY_CONTRACT_CODE, redirectUrl: process.env.PAYMENT_REDIRECT_URL ?? "https://gabvia.app/payment-status", paymentMethods: ["CARD", "ACCOUNT_TRANSFER"] }), cache: "no-store" });
  const payload = await response.json() as { requestSuccessful?: boolean; responseBody?: { checkoutUrl?: string; transactionReference?: string }; responseMessage?: string };
  if (!response.ok || !payload.requestSuccessful || !payload.responseBody?.checkoutUrl) throw new Error(payload.responseMessage ?? "Monnify initialization failed.");
  return payload;
}

async function verifyFlutterwave(reference: string) {
  const response = await fetch(`${baseUrl(process.env.FLUTTERWAVE_BASE_URL)}/transactions/verify_by_reference?tx_ref=${encodeURIComponent(reference)}`, { headers: { Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}` }, cache: "no-store" });
  const payload = await response.json() as { status?: string; data?: { status?: string; amount?: number; currency?: string } };
  const paid = payload.status === "success" && payload.data?.status === "successful";
  return { requestSuccessful: true, responseBody: { paymentStatus: paid ? "PAID" : payload.data?.status ?? "FAILED", amount: Number(payload.data?.amount ?? 0), currency: payload.data?.currency ?? "NGN" } };
}

async function verifyMonnify(reference: string) {
  const token = await getMonnifyToken();
  const response = await fetch(`${baseUrl(process.env.MONNIFY_BASE_URL)}/merchant/transactions/query?transactionReference=${encodeURIComponent(reference)}`, { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" });
  const payload = await response.json() as { requestSuccessful?: boolean; responseBody?: { paymentStatus?: string; amountPaid?: number; amount?: number; currencyCode?: string } };
  const status = String(payload.responseBody?.paymentStatus ?? "").toUpperCase();
  return { requestSuccessful: Boolean(payload.requestSuccessful), responseBody: { paymentStatus: status === "PAID" ? "PAID" : status || "FAILED", amount: Number(payload.responseBody?.amountPaid ?? payload.responseBody?.amount ?? 0), currency: payload.responseBody?.currencyCode ?? "NGN" } };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { action?: "initialize" | "verify"; gateway?: Gateway; userUid?: string; amount?: number; points?: number; customerName?: string; customerEmail?: string; reference?: string };
    if (!body.gateway || !["monnify", "flutterwave"].includes(body.gateway) || !body.userUid) return NextResponse.json({ ok: false, error: "A valid gateway and user are required." }, { status: 400 });
    await authorizePayment(request, body.userUid);
    if (body.action === "initialize") {
      const expectedAmount = Math.round((Math.max(200, Math.floor(body.points || 0)) / 200) * 500);
      if (!body.amount || body.amount !== expectedAmount || !body.points || body.points < 200 || !body.customerEmail || !body.reference || !body.reference.startsWith(`POINTS_${Math.floor(body.points)}_${body.userUid}_`)) return NextResponse.json({ ok: false, error: "Payment details failed server validation." }, { status: 400 });
      const result = body.gateway === "flutterwave" ? await initializeFlutterwave(body.amount, body.customerName ?? "Gabvia user", body.customerEmail, body.reference) : await initializeMonnify(body.amount, body.customerName ?? "Gabvia user", body.customerEmail, body.reference);
      return NextResponse.json(result);
    }
    if (body.action === "verify" && body.reference) {
      const referenceParts = body.reference.match(/^POINTS_(\d+)_([^_]+)_/);
      if (!referenceParts || referenceParts[2] !== body.userUid) return NextResponse.json({ ok: false, error: "Payment reference does not belong to this account." }, { status: 400 });
      const result = body.gateway === "flutterwave" ? await verifyFlutterwave(body.reference) : await verifyMonnify(body.reference);
      return NextResponse.json({ ...result, responseBody: { ...result.responseBody, points: Number(referenceParts[1]) } });
    }
    return NextResponse.json({ ok: false, error: "A valid payment action and reference are required." }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : "Payment request failed." }, { status: 500 });
  }
}
