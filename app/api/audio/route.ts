import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const VERCEL_BLOB_TOKEN =
  process.env.VERCEL_BLOB_TOKEN ||
  process.env.BLOB_STORAGE ||
  process.env.EXPO_PUBLIC_BLOB_STORAGE ||
  "vercel_blob_rw_shptpAAmkG5T7rQn_VtnuQ66eiWKmZjLRIZRtJgsBSIOQzW";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const audioUrl = searchParams.get("url");

    if (!audioUrl) {
      return NextResponse.json({ error: "Missing audio url parameter" }, { status: 400 });
    }

    // Prepare upstream request headers
    const upstreamHeaders: Record<string, string> = {};

    if (VERCEL_BLOB_TOKEN && audioUrl.includes("blob.vercel-storage.com")) {
      upstreamHeaders["Authorization"] = `Bearer ${VERCEL_BLOB_TOKEN}`;
    }

    // Forward byte Range request for audio scrubbing & chunked playback in Safari & Chrome
    const rangeHeader = request.headers.get("range");
    if (rangeHeader) {
      upstreamHeaders["Range"] = rangeHeader;
    }

    const upstreamResponse = await fetch(audioUrl, {
      method: "GET",
      headers: upstreamHeaders,
    });

    if (!upstreamResponse.ok && upstreamResponse.status !== 206) {
      console.warn(
        `[Audio Proxy] Upstream returned status ${upstreamResponse.status} for ${audioUrl}`
      );
      return new Response(`Failed to load audio: ${upstreamResponse.statusText}`, {
        status: upstreamResponse.status,
      });
    }

    // Determine content type
    let contentType = upstreamResponse.headers.get("content-type");
    if (!contentType || contentType === "application/octet-stream") {
      contentType = audioUrl.includes(".mp3")
        ? "audio/mpeg"
        : audioUrl.includes(".ogg")
        ? "audio/ogg"
        : audioUrl.includes(".wav")
        ? "audio/wav"
        : "audio/mp4"; // .m4a standard AAC MIME
    }

    const responseHeaders = new Headers();
    responseHeaders.set("Content-Type", contentType);
    responseHeaders.set("Accept-Ranges", "bytes");
    responseHeaders.set("Cache-Control", "public, max-age=31536000, immutable");

    const contentLength = upstreamResponse.headers.get("content-length");
    if (contentLength) {
      responseHeaders.set("Content-Length", contentLength);
    }

    const contentRange = upstreamResponse.headers.get("content-range");
    if (contentRange) {
      responseHeaders.set("Content-Range", contentRange);
    }

    return new Response(upstreamResponse.body, {
      status: upstreamResponse.status,
      headers: responseHeaders,
    });
  } catch (error: any) {
    console.error("[Audio Proxy] Error proxying audio stream:", error);
    return new Response("Internal Audio Proxy Error", { status: 500 });
  }
}
