'use client'

import { useState, useRef, useEffect } from 'react'
import { Send } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

const SUGGESTED = [
  'What does my HRV trend mean?',
  'Why has my energy been low this week?',
  'What patterns are affecting my sleep?',
  'How does my blood work look compared to last time?',
  'What should I focus on to improve my health score?',
]

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function send(text: string) {
    if (!text.trim() || loading) return

    const userMsg: Message = { role: 'user', content: text.trim() }
    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text.trim(), history: messages.slice(-10) }),
      })
      const data = await res.json()
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: data.reply ?? 'I encountered an issue. Please try again.' },
      ])
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Connection error. Please try again.' },
      ])
    } finally {
      setLoading(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send(input)
    }
  }

  return (
    <div className="max-w-2xl mx-auto flex flex-col h-[calc(100vh-80px)] pt-4">
      {/* Header */}
      <div className="mb-4 flex-shrink-0">
        <div className="text-[10.5px] font-bold tracking-[0.1em] uppercase text-t3 mb-1">
          AI Health Co-pilot
        </div>
        <h1 className="font-serif text-[22px] font-bold text-t1 tracking-[-0.02em]">
          Ask Anything
        </h1>
        <p className="text-[12px] text-t3 mt-0.5">
          Powered by your data · Educational insights only · Not medical advice
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pb-4">
        {messages.length === 0 && (
          <div className="space-y-4">
            {/* Intro card */}
            <div
              className="rounded-2xl p-5"
              style={{
                background: 'rgba(77,200,140,0.04)',
                border: '1px solid rgba(77,200,140,0.12)',
              }}
            >
              <div className="text-[13.5px] font-semibold text-t1 mb-2">
                Your AI health co-pilot is ready 🧬
              </div>
              <p className="text-[12.5px] text-t2 leading-[1.75]">
                Ask me anything about your health data. I have access to your recent check-ins,
                blood results, wearable data, and patterns to give you personalised educational
                insights.
              </p>
            </div>

            {/* Suggestions */}
            <div>
              <div className="text-[10.5px] font-bold tracking-[0.1em] uppercase text-t3 mb-2">
                Try asking
              </div>
              <div className="flex flex-wrap gap-2">
                {SUGGESTED.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="text-[12px] px-3 py-1.5 rounded-full text-t2 hover:text-t1 hover:border-[var(--b1)] transition-all"
                    style={{ background: '#111a16', border: '1px solid rgba(255,255,255,0.055)' }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <div
            key={i}
            className={cn('flex', m.role === 'user' ? 'justify-end' : 'justify-start')}
          >
            <div
              className={cn(
                'max-w-[85%] px-4 py-3 rounded-2xl text-[13px] leading-[1.75]',
                m.role === 'user'
                  ? 'text-bg font-medium'
                  : 'text-t1',
              )}
              style={
                m.role === 'user'
                  ? { background: '#4dc88c' }
                  : { background: '#111a16', border: '1px solid rgba(255,255,255,0.055)' }
              }
            >
              {m.content.split('\n').map((line, j) => (
                <span key={j}>
                  {line}
                  {j < m.content.split('\n').length - 1 && <br />}
                </span>
              ))}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div
              className="px-4 py-3 rounded-2xl flex items-center gap-1.5"
              style={{ background: '#111a16', border: '1px solid rgba(255,255,255,0.055)' }}
            >
              {[0, 0.15, 0.3].map((delay) => (
                <span
                  key={delay}
                  className="w-1.5 h-1.5 rounded-full bg-t3 animate-blink"
                  style={{ animationDelay: `${delay}s` }}
                />
              ))}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div
        className="flex-shrink-0 flex items-end gap-3 rounded-2xl p-3"
        style={{ background: '#0c1210', border: '1px solid rgba(255,255,255,0.09)' }}
      >
        <textarea
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask about your health data…"
          rows={1}
          className="flex-1 bg-transparent text-t1 text-[13px] placeholder:text-t4 outline-none resize-none leading-relaxed"
          style={{ maxHeight: '120px' }}
        />
        <button
          onClick={() => send(input)}
          disabled={!input.trim() || loading}
          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all disabled:opacity-30"
          style={{ background: '#4dc88c' }}
        >
          <Send className="w-4 h-4 text-bg" />
        </button>
      </div>
      <p className="text-[10px] text-t4 text-center mt-2">
        Educational insights only — not medical advice
      </p>
    </div>
  )
}
