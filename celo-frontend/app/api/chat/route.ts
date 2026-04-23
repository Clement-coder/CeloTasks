import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { contents } = await req.json();

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents }),
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
