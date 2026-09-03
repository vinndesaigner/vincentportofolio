'use client';

import { useState, useRef, useEffect } from 'react';

interface Message {
  sender: 'user' | 'ai';
  text: string;
}

export default function AIChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'ai',
      text: '⚡ **CTF WINGMAN AI WEB EDITION IS ONLINE!**\nPaste ciphertext ROT13/Base64 atau ketik nanya kategori CTF (Crypto, DFIR, PWN, Web).',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userText = input;
    setInput('');
    setMessages((prev) => [...prev, { sender: 'user', text: userText }]);
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userText }),
      });

      if (res.ok) {
        const data = await res.json();
        setMessages((prev) => [...prev, { sender: 'ai', text: data.reply }]);
      }
    } catch {
      setMessages((prev) => [...prev, { sender: 'ai', text: '❌ Error: Gagal terhubung ke AI Engine.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-emerald-400 font-mono">
      {/* Header */}
      <header className="p-4 bg-slate-900/80 border-b border-emerald-500/30 backdrop-blur flex justify-between items-center shadow-lg">
        <div className="flex items-center gap-3">
          <span className="w-3 h-3 bg-emerald-500 rounded-full animate-ping"></span>
          <h1 className="text-lg font-bold tracking-wider text-emerald-300">CYBER WINGMAN AI // CTF COPILOT</h1>
        </div>
        <span className="text-xs text-slate-400 bg-slate-800 px-3 py-1 rounded-full border border-slate-700">
          STATUS: ACTIVE
        </span>
      </header>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 max-w-4xl w-full mx-auto">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] p-4 rounded-2xl whitespace-pre-wrap text-sm leading-relaxed shadow-xl ${
                msg.sender === 'user'
                  ? 'bg-emerald-600/20 border border-emerald-500/40 text-emerald-200 rounded-tr-none'
                  : 'bg-slate-900 border border-emerald-500/30 text-emerald-400 rounded-tl-none'
              }`}
            >
              <div className="text-[10px] text-slate-500 mb-1 font-bold">
                {msg.sender === 'user' ? 'USER // VINCENT' : 'AI // CTF COPILOT'}
              </div>
              {msg.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-slate-900 border border-emerald-500/30 p-3 rounded-2xl text-xs animate-pulse text-emerald-500">
              🤖 AI sedang menganalisis payload / query...
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input Form */}
      <div className="p-4 bg-slate-900 border-t border-emerald-500/30">
        <div className="max-w-4xl mx-auto flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Ketik pertanyaan atau paste ciphertext (ROT13, Base64, Hash)..."
            className="flex-1 bg-slate-950 border border-emerald-500/40 rounded-xl px-4 py-3 text-sm text-emerald-300 placeholder-slate-600 focus:outline-none focus:border-emerald-400 shadow-inner"
          />
          <button
            onClick={sendMessage}
            disabled={loading}
            className="bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold px-6 py-3 rounded-xl transition-all shadow-lg active:scale-95 disabled:opacity-50"
          >
            SEND
          </button>
        </div>
      </div>
    </div>
  );
}