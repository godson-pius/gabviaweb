import { NextRequest, NextResponse } from "next/server";
import { createSign } from "node:crypto";
import { collection, getDocs, limit, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";

export const dynamic = "force-dynamic";

function encodeBase64Url(value: string | Buffer) {
  return Buffer.from(value).toString("base64url");
}

function normalizePrivateKey(value: string) {
  let key = value.trim();
  if ((key.startsWith('"') && key.endsWith('"')) || (key.startsWith("'") && key.endsWith("'"))) {
    try {
      const parsed = JSON.parse(key);
      key = typeof parsed === "string" ? parsed : key.slice(1, -1);
    } catch {
      key = key.slice(1, -1);
    }
  }
  return key.replace(/\\+n/g, "\n").replace(/\r\n/g, "\n").trim();
}

async function getGoogleAccessToken(): Promise<string | null> {
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const rawKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;
  if (!clientEmail || !rawKey) return null;

  try {
    const privateKey = normalizePrivateKey(rawKey);
    const now = Math.floor(Date.now() / 1000);
    const unsignedToken = `${encodeBase64Url(
      JSON.stringify({ alg: "RS256", typ: "JWT" })
    )}.${encodeBase64Url(
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

    const res = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
        assertion,
      }),
      cache: "no-store",
    });

    const data = (await res.json()) as { access_token?: string };
    return data.access_token || null;
  } catch (err) {
    console.warn("[ResolveUsername] Error generating admin access token:", err);
    return null;
  }
}

async function queryAdminFirestore(
  token: string,
  field: string,
  value: string
): Promise<string | null> {
  const projectId = process.env.FIREBASE_PROJECT_ID || "gabvia-80b5f";
  try {
    const res = await fetch(
      `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents:runQuery`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          structuredQuery: {
            from: [{ collectionId: "profiles" }],
            where: {
              fieldFilter: {
                field: { fieldPath: field },
                op: "EQUAL",
                value: { stringValue: value },
              },
            },
            limit: 1,
          },
        }),
        cache: "no-store",
      }
    );

    if (!res.ok) return null;
    const results = (await res.json()) as Array<{
      document?: {
        fields?: Record<string, { stringValue?: string }>;
      };
    }>;

    for (const item of results) {
      if (item.document?.fields?.email?.stringValue) {
        return item.document.fields.email.stringValue;
      }
    }
  } catch (err) {
    console.warn(`[ResolveUsername] Admin query on ${field} failed:`, err);
  }
  return null;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json().catch(() => ({}))) as { username?: string };
    const rawInput = body.username?.trim() ?? "";
    const cleanUsername = rawInput.replace(/^@+/, "");

    if (!cleanUsername) {
      return NextResponse.json(
        { ok: false, error: "Please enter a valid username." },
        { status: 400 }
      );
    }

    const lower = cleanUsername.toLowerCase();
    const capitalized = cleanUsername.charAt(0).toUpperCase() + cleanUsername.slice(1);

    // 1. Try Admin Service Account REST API first (bypasses all security rules)
    const adminToken = await getGoogleAccessToken();
    if (adminToken) {
      // 1a. Check username_lower
      let email = await queryAdminFirestore(adminToken, "username_lower", lower);
      if (email) {
        return NextResponse.json({ ok: true, email });
      }

      // 1b. Check exact username as typed
      if (cleanUsername !== lower) {
        email = await queryAdminFirestore(adminToken, "username", cleanUsername);
        if (email) {
          return NextResponse.json({ ok: true, email });
        }
      }

      // 1c. Check lowercase username in username field
      email = await queryAdminFirestore(adminToken, "username", lower);
      if (email) {
        return NextResponse.json({ ok: true, email });
      }

      // 1d. Check capitalized username
      if (capitalized !== lower && capitalized !== cleanUsername) {
        email = await queryAdminFirestore(adminToken, "username", capitalized);
        if (email) {
          return NextResponse.json({ ok: true, email });
        }
      }

      // If admin token was used and no user was found, return 404
      return NextResponse.json(
        { ok: false, error: `No account found with username "${cleanUsername}". Please check the spelling or log in with your email.` },
        { status: 404 }
      );
    }

    // 2. Client SDK Fallback (only if admin credentials are not configured)
    const profilesRef = collection(db, "profiles");

    // 2a. Check username_lower
    let snapshot = await getDocs(query(profilesRef, where("username_lower", "==", lower), limit(1)));

    // 2b. Check exact username as typed
    if (snapshot.empty && cleanUsername !== lower) {
      snapshot = await getDocs(query(profilesRef, where("username", "==", cleanUsername), limit(1)));
    }

    // 2c. Check lowercase in username field
    if (snapshot.empty) {
      snapshot = await getDocs(query(profilesRef, where("username", "==", lower), limit(1)));
    }

    // 2d. Check Capitalized
    if (snapshot.empty && capitalized !== lower && capitalized !== cleanUsername) {
      snapshot = await getDocs(query(profilesRef, where("username", "==", capitalized), limit(1)));
    }

    if (!snapshot.empty) {
      const userDoc = snapshot.docs[0].data();
      const email = userDoc.email;
      if (email) {
        return NextResponse.json({ ok: true, email });
      }
    }

    return NextResponse.json(
      { ok: false, error: `No account found with username "${cleanUsername}". Please check the spelling or log in with your email.` },
      { status: 404 }
    );
  } catch (error: any) {
    console.error("[ResolveUsername] Error:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to resolve username. Please use your email." },
      { status: 500 }
    );
  }
}
