"use client";
import { useState, useRef, useEffect } from "react";

interface Message {
  role: "user" | "assistant";
  text: string;
}

const SYSTEM_CONTEXT = `You are CeloTasks AI assistant. CeloTasks is a decentralized micro-task marketplace on the Celo blockchain where workers complete tasks and get paid instantly in cUSD. Help users with: finding tasks, posting tasks, understanding payments, wallet setup (MiniPay/MetaMask), reputation system, and general platform questions. Be concise and helpful.`;

export default function AiChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", text: "Hi! I'm your CeloTasks AI assistant. Ask me anything about tasks, payments, or the platform! 🚀" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  async function send() {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    const next: Message[] = [...messages, { role: "user", text }];
    setMessages(next);
    setLoading(true);

    try {
      const history = next.map((m) => ({
        role: m.role === "user" ? "user" : "model",
        parts: [{ text: m.text }],
      }));
      const contents = [
        { role: "user", parts: [{ text: SYSTEM_CONTEXT }] },
        { role: "model", parts: [{ text: "Understood. I'm ready to help CeloTasks users." }] },
        ...history,
      ];

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents }),
      });
      const data = await res.json();
      setMessages([...next, { role: "assistant", text: data.text }]);
    } catch {
      setMessages([...next, { role: "assistant", text: "Network error. Please try again." }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Open AI Chat"
        className="fixed bottom-24 right-4 md:bottom-6 md:right-6 z-50 w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-transform hover:scale-105 active:scale-95"
        style={{ background: "linear-gradient(135deg, #35D07F, #1a9e5c)" }}
      >
        {open ? (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            <circle cx="9" cy="10" r="1" fill="white" /><circle cx="12" cy="10" r="1" fill="white" /><circle cx="15" cy="10" r="1" fill="white" />
          </svg>
        )}
      </button>

      {/* Chat modal */}
      {open && (
        <div
          className="fixed bottom-40 right-4 md:bottom-24 md:right-6 z-50 flex flex-col rounded-2xl shadow-2xl overflow-hidden"
          style={{ width: "min(360px, calc(100vw - 2rem))", height: "min(480px, calc(100vh - 12rem))", background: "#131920", border: "1px solid #1e2a35" }}
        >
          {/* Header */}
          <div className="flex items-center gap-2 px-4 py-3" style={{ background: "#0d1117", borderBottom: "1px solid #1e2a35" }}>
            <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "linear-gradient(135deg, #35D07F, #1a9e5c)" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2a10 10 0 1 0 10 10" /><path d="M12 8v4l3 3" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold" style={{ color: "#f1f5f9" }}>CeloTasks AI</p>
              <p className="text-xs" style={{ color: "#35D07F" }}>● Online</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3" style={{ scrollbarWidth: "thin" }}>
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className="max-w-[80%] rounded-2xl px-3 py-2 text-sm leading-relaxed whitespace-pre-wrap"
                  style={
                    m.role === "user"
                      ? { background: "#35D07F", color: "#0b0f14", borderBottomRightRadius: 4 }
                      : { background: "#1e2a35", color: "#e2e8f0", borderBottomLeftRadius: 4 }
                  }
                >
                  {m.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="rounded-2xl px-4 py-2 text-sm" style={{ background: "#1e2a35", color: "#94a3b8", borderBottomLeftRadius: 4 }}>
                  <span className="animate-pulse">Thinking…</span>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="px-3 py-3 flex gap-2" style={{ borderTop: "1px solid #1e2a35" }}>
            <input
              className="flex-1 rounded-xl px-3 py-2 text-sm outline-none"
              style={{ background: "#1e2a35", color: "#f1f5f9", border: "1px solid #2d3f50" }}
              placeholder="Ask anything…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send()}
              disabled={loading}
            />
            <button
              onClick={send}
              disabled={loading || !input.trim()}
              className="w-9 h-9 rounded-xl flex items-center justify-center transition-opacity disabled:opacity-40"
              style={{ background: "#35D07F", flexShrink: 0 }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0b0f14" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
