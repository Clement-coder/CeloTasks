import { NextRequest, NextResponse } from "next/server";

// Simple in-memory rate limiter: max 20 requests per IP per minute
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 20;
const WINDOW_MS = 60_000;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  if (entry.count >= RATE_LIMIT) return true;
  entry.count++;
  return false;
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (isRateLimited(ip)) {
    return NextResponse.json({ text: "Too many requests. Please wait a moment." }, { status: 429 });
  }

  // Guard request body size (max 32 KB)
  const contentLength = req.headers.get("content-length");
  if (contentLength && parseInt(contentLength) > 32_768) {
    return NextResponse.json({ text: "Request too large." }, { status: 413 });
  }

  let body: { contents?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ text: "Invalid request." }, { status: 400 });
  }

  if (!body.contents || !Array.isArray(body.contents)) {
    return NextResponse.json({ text: "Invalid request." }, { status: 400 });
  }

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: body.contents }),
      }
    );

    if (!res.ok) {
      const err = await res.text();
      console.error("Gemini API error:", res.status, err);
      return NextResponse.json({ text: "Sorry, I couldn't get a response. Please try again." }, { status: 200 });
    }

    const data = await res.json();
    const text =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ??
      "Sorry, I couldn't get a response. Please try again.";

    return NextResponse.json({ text });
  } catch (e) {
    console.error("Chat route error:", e);
    return NextResponse.json({ text: "Network error. Please try again." }, { status: 200 });
  }
}
