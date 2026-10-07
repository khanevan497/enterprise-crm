import { useState } from 'react'
import { aiApi } from '@/services/api'
import { Bot, Send, Loader2, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'

type Message = { role: 'user' | 'ai'; content: string }

const SUGGESTED = [
  "What are the highest value deals at risk?",
  "Who are our top customers this quarter?",
  "What deals should I follow up on today?",
  "Summarize recent activity across all contacts",
  "Which deals are most likely to close this month?",
]

export function AIPage() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'ai', content: "Hello! I'm your CRM AI assistant. I can help you analyze customer data, identify risks in your pipeline, and suggest next actions. What would you like to know?" }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)

  const sendMessage = async (text?: string) => {
    const msg = (text || input).trim()
    if (!msg || loading) return
    setInput('')
    setMessages(m => [...m, { role: 'user', content: msg }])
    setLoading(true)
    try {
      const res = await aiApi.chat(msg, {})
      setMessages(m => [...m, { role: 'ai', content: res.data.data?.reply || "I analyzed the CRM data and here's what I found..." }])
    } catch {
      setMessages(m => [...m, { role: 'ai', content: "I'm having trouble connecting to the AI service. Please try again." }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto h-full flex flex-col">
      <div className="mb-6 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center">
          <Bot size={20} className="text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">AI Assistant</h1>
          <p className="text-gray-500 text-sm">Powered by your CRM data — not a general chatbot</p>
        </div>
      </div>

      {/* Suggestions */}
      {messages.length <= 1 && (
        <div className="mb-5">
          <p className="text-xs font-semibold text-gray-500 uppercase mb-3 flex items-center gap-2">
            <Sparkles size={12} /> Suggested questions
          </p>
          <div className="flex flex-wrap gap-2">
            {SUGGESTED.map(s => (
              <button
                key={s}
                onClick={() => sendMessage(s)}
                className="text-sm px-3 py-1.5 border border-gray-200 rounded-lg text-gray-600 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 transition-colors text-left"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Chat */}
      <div className="flex-1 bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col min-h-[400px]">
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'ai' && (
                <div className="w-7 h-7 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0 mr-2.5 mt-0.5">
                  <Bot size={14} className="text-purple-600" />
                </div>
              )}
              <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white rounded-br-md'
                  : 'bg-gray-100 text-gray-800 rounded-bl-md'
              }`}>
                {msg.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                <Bot size={14} className="text-purple-600" />
              </div>
              <div className="bg-gray-100 px-4 py-3 rounded-2xl rounded-bl-md flex items-center gap-2">
                <Loader2 size={13} className="animate-spin text-gray-400" />
                <span className="text-sm text-gray-500">Analyzing CRM data...</span>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="px-4 pb-4 pt-3 border-t border-gray-100">
          <div className="flex gap-2">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }}
              placeholder="Ask about your customers, pipeline, or next steps..."
              className="flex-1 text-sm px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 focus:bg-white transition-colors"
            />
            <Button
              onClick={() => sendMessage()}
              disabled={!input.trim() || loading}
              className="px-4"
            >
              <Send size={15} />
            </Button>
          </div>
          <p className="text-xs text-gray-400 mt-2">AI only uses data from your CRM — never general knowledge</p>
        </div>
      </div>
    </div>
  )
}
