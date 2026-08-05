'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/utils/supabase/client'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

type Citation = { meeting_id: string; meeting_title: string; meeting_date: string }
type SourceSummary = { meeting_id: string; meeting_title: string; meeting_date: string; indices: number[] }

type Message = {
  role: 'user' | 'assistant'
  content: string
  citations?: Record<string, Citation>
  sources?: SourceSummary[]
}

// Converts "[Source 1, Source 3]" or "[Source 5]" style groups into
// individual markdown links like "[1](#source-1) [3](#source-3)" so
// react-markdown can render each as a clickable, numbered badge.
function preprocessCitations(text: string): string {
  return text.replace(/\[Source[^\]]*\]/gi, (match) => {
    const numbers = [...match.matchAll(/\d+/g)].map((m) => m[0])
    if (numbers.length === 0) return match
    return numbers.map((n) => `[${n}](#source-${n})`).join(' ')
  })
}

export default function AskMeetSensePage() {
  const router = useRouter()
  const supabase = createClient()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [selectedProjectId, setSelectedProjectId] = useState<string>('')
  const [isScopeDropdownOpen, setIsScopeDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsScopeDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const messagesEndRef = useRef<HTMLDivElement>(null)

  const { data: projects } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const { data } = await supabase.from('projects').select('*').order('created_at', { ascending: false })
      return data || []
    }
  })

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const suggestedQuestions = [
    'What action items are currently overdue?',
    'What decisions were made last week?',
    'Summarize the recent discussions about pricing.'
  ]

  const handleSend = async (question: string) => {
    if (!question.trim() || isLoading) return

    const newMessages = [...messages, { role: 'user' as const, content: question }]
    setMessages(newMessages)
    setInput('')
    setIsLoading(true)

    try {
      const history = messages.map((m) => ({ role: m.role, content: m.content }))

      const res = await fetch('/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question,
          conversationHistory: history,
          project_id: selectedProjectId || undefined
        })
      })

      if (!res.ok) throw new Error('Failed to get answer')

      const data = await res.json()

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: data.answer,
          citations: data.citations || {},
          sources: data.sources || []
        }
      ])
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Sorry, I encountered an error while trying to answer that.' }
      ])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-transparent text-on-surface h-full flex flex-col relative overflow-hidden">
      {/* Decorative background blur */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary/20 rounded-full blur-[120px] pointer-events-none -z-10"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[40%] h-[40%] bg-secondary/20 rounded-full blur-[100px] pointer-events-none -z-10"></div>

      <div className="w-full flex justify-end items-center px-4 py-4 md:px-margin-desktop mb-4 relative z-40">
        <div className="flex items-center gap-3">
          <span className="text-label-sm font-bold text-on-surface-variant hidden sm:inline uppercase tracking-wider">Search Scope</span>
          <div className="relative group" ref={dropdownRef}>
            <button
              onClick={() => setIsScopeDropdownOpen(!isScopeDropdownOpen)}
              className="appearance-none glass-panel pl-11 pr-10 py-2.5 rounded-full text-label-md font-bold text-on-surface hover:shadow-premium transition-all cursor-pointer outline-none focus:ring-2 focus:ring-primary/50 border border-white/40 flex items-center min-w-[200px]"
            >
              <span className="truncate">
                {selectedProjectId === '' 
                  ? 'Global (All Meetings)' 
                  : projects?.find(p => p.id === selectedProjectId)?.name || 'Project'}
              </span>
            </button>
            <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[18px] text-primary pointer-events-none transition-all group-hover:scale-110">
              {selectedProjectId ? 'folder' : 'public'}
            </span>
            <span className={`material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-[18px] text-on-surface-variant pointer-events-none transition-transform duration-300 ${isScopeDropdownOpen ? 'rotate-180 text-primary' : 'group-hover:text-primary'}`}>
              expand_more
            </span>

            {/* Custom Dropdown Options */}
            {isScopeDropdownOpen && (
              <div className="absolute top-full mt-2 right-0 w-64 glass-panel rounded-2xl shadow-premium border border-white/40 overflow-hidden z-50 animate-in fade-in zoom-in-95 origin-top-right py-2">
                <button
                  onClick={() => {
                    setSelectedProjectId('')
                    setIsScopeDropdownOpen(false)
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-white/40 ${selectedProjectId === '' ? 'bg-primary/10 text-primary font-bold' : 'text-on-surface font-medium'}`}
                >
                  <span className="material-symbols-outlined text-[20px]">public</span>
                  Global (All Meetings)
                  {selectedProjectId === '' && <span className="material-symbols-outlined ml-auto text-[18px]">check</span>}
                </button>
                
                {projects && projects.length > 0 && (
                  <div className="px-4 py-2 mt-2 border-t border-outline-variant/30 text-label-sm font-bold text-on-surface-variant uppercase tracking-wider">
                    Projects
                  </div>
                )}
                
                <div className="max-h-60 overflow-y-auto">
                  {projects?.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => {
                        setSelectedProjectId(p.id)
                        setIsScopeDropdownOpen(false)
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-white/40 ${selectedProjectId === p.id ? 'bg-primary/10 text-primary font-bold' : 'text-on-surface font-medium'}`}
                    >
                      <span className="material-symbols-outlined text-[20px]">folder</span>
                      <span className="truncate">{p.name}</span>
                      {selectedProjectId === p.id && <span className="material-symbols-outlined ml-auto text-[18px]">check</span>}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <main className="flex-1 overflow-y-auto px-4 pb-24 md:px-margin-desktop w-full max-w-4xl mx-auto flex flex-col gap-6 relative z-10">
        {messages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center max-w-lg mx-auto">
            <div className="w-20 h-20 bg-gradient-to-br from-primary to-secondary text-white rounded-2xl flex items-center justify-center mb-6 shadow-premium transform -rotate-3 hover:rotate-0 transition-all duration-300">
              <span className="material-symbols-outlined text-3xl">auto_awesome</span>
            </div>
            <h2 className="text-headline-sm font-semibold mb-4">How can I help you today?</h2>
            <p className="text-body-md text-on-surface-variant mb-8">
              Ask MeetSense to search through your past meetings, summarize decisions, or find specific action items.
            </p>
            <div className="flex flex-col gap-3 w-full">
              {suggestedQuestions.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(q)}
                  className="px-5 py-4 glass-panel rounded-2xl text-left text-body-md hover:-translate-y-1 transition-all text-on-surface shadow-sm group"
                >
                  <span className="text-primary group-hover:text-secondary transition-colors font-medium">{q}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-6 pb-20">
            {messages.map((msg, idx) => {
              const processedContent =
                msg.role === 'assistant' ? preprocessCitations(msg.content) : msg.content

              return (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2`}>
                  <div
                    className={`max-w-[85%] sm:max-w-[75%] rounded-3xl p-6 ${
                      msg.role === 'user'
                        ? 'bg-gradient-to-br from-primary to-primary-container text-on-primary rounded-tr-sm shadow-premium'
                        : 'glass-panel text-on-surface rounded-tl-sm'
                    }`}
                  >
                    {msg.role === 'assistant' && (
                      <div className="flex items-center gap-2 mb-3 border-b border-outline-variant/50 pb-2">
                        <span className="material-symbols-outlined text-primary text-[18px]">auto_awesome</span>
                        <span className="text-label-sm font-semibold uppercase tracking-wider text-on-surface-variant">
                          MeetSense AI
                        </span>
                      </div>
                    )}

                    {msg.role === 'assistant' ? (
                      <div className="text-body-md leading-relaxed font-body-md prose prose-sm max-w-none prose-p:my-2 prose-ul:my-2 prose-li:my-0.5 prose-strong:text-on-surface prose-headings:text-on-surface">
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={{
                            a: ({ href, children }) => {
                              if (href?.startsWith('#source-')) {
                                const idx = href.replace('#source-', '')
                                const citation = msg.citations?.[idx]
                                return (
                                  <button
                                    type="button"
                                    onClick={() => citation && router.push(`/dashboard/meetings/${citation.meeting_id}`)}
                                    title={citation ? `${citation.meeting_title} · ${citation.meeting_date}` : `Source ${idx}`}
                                    className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 mx-0.5 rounded-full bg-primary/15 text-primary text-[10px] font-bold hover:bg-primary/25 transition-colors align-middle cursor-pointer"
                                  >
                                    {idx}
                                  </button>
                                )
                              }
                              return (
                                <a href={href} target="_blank" rel="noreferrer" className="underline">
                                  {children}
                                </a>
                              )
                            }
                          }}
                        >
                          {processedContent}
                        </ReactMarkdown>
                      </div>
                    ) : (
                      <div className="whitespace-pre-wrap text-body-md leading-relaxed font-body-md">
                        {msg.content}
                      </div>
                    )}

                    {msg.sources && msg.sources.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-outline-variant/50">
                        <p className="text-label-sm font-semibold text-on-surface-variant mb-2">Sources:</p>
                        <div className="flex flex-wrap gap-2">
                          {msg.sources.map((source, sIdx) => (
                            <button
                              key={sIdx}
                              onClick={() => router.push(`/dashboard/meetings/${source.meeting_id}`)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-surface-container-low hover:bg-surface-container text-on-surface-variant rounded-full text-label-sm transition-colors border border-outline-variant"
                            >
                              <span className="inline-flex items-center justify-center min-w-[16px] h-[16px] rounded-full bg-primary/15 text-primary text-[9px] font-bold">
                                {source.indices[0]}
                              </span>
                              <span className="material-symbols-outlined text-[14px]">description</span>
                              {source.meeting_title}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}

            {isLoading && (
              <div className="flex justify-start animate-in slide-in-from-bottom-2">
                <div className="glass-panel text-on-surface rounded-3xl rounded-tl-sm p-4 px-6 flex items-center gap-2 shadow-sm w-[100px] h-[52px]">
                  <div className="flex gap-1.5 items-center justify-center h-full w-full">
                    <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </main>

      <div className="fixed bottom-6 left-0 w-full md:left-[280px] md:w-[calc(100%-280px)] px-4 z-40 pointer-events-none flex justify-center">
        <div className="w-full max-w-3xl relative pointer-events-auto">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend(input)}
            placeholder="Ask about your meetings..."
            disabled={isLoading}
            className="w-full glass-input rounded-full pl-6 pr-16 py-4 text-body-lg text-on-surface shadow-premium disabled:opacity-50"
          />
          <button
            onClick={() => handleSend(input)}
            disabled={!input.trim() || isLoading}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-12 h-12 bg-gradient-to-r from-primary to-secondary text-white rounded-full flex items-center justify-center disabled:opacity-50 hover:shadow-lg transition-all hover:scale-105"
          >
            <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              send
            </span>
          </button>
        </div>
      </div>
    </div>
  )
}
