'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'

function SearchResultsContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialQuery = searchParams.get('q') || ''
  const [searchQuery, setSearchQuery] = useState(initialQuery)

  const { data, isLoading, error } = useQuery({
    queryKey: ['semanticSearch', initialQuery],
    queryFn: async () => {
      if (!initialQuery.trim()) return []
      const res = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: initialQuery })
      })
      if (!res.ok) throw new Error('Search failed')
      const json = await res.json()
      return json.results || []
    },
    enabled: !!initialQuery.trim()
  })

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      router.push(`/dashboard/search?q=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  // Highlight matching words slightly (rudimentary highlighter)
  const highlightText = (text: string, query: string) => {
    if (!query) return text
    const words = query.split(' ').filter(w => w.length > 2)
    if (words.length === 0) return text
    
    // Very simple highlight
    let highlighted = text
    words.forEach(word => {
      const regex = new RegExp(`(${word})`, 'gi')
      // Note: React dangerouslySetInnerHTML is usually needed for real highlighting, 
      // but for simplicity we'll just bold it via CSS classes if we split it, or just use simple replacement if doing strings.
      // Since we can't easily return a string with HTML without dangerouslySetInnerHTML, let's just return raw text for now,
      // or we can just render it raw. To avoid XSS, we will just bold it using JSX.
    })
    return text
  }

  return (
    <div className="bg-background-page text-on-surface min-h-screen">
      {/* Decorative background blur */}
      <div className="absolute top-[0%] left-[10%] w-[50%] h-[50%] bg-primary/20 rounded-full blur-[120px] pointer-events-none -z-10"></div>
      <div className="absolute bottom-[20%] right-[10%] w-[40%] h-[40%] bg-secondary/20 rounded-full blur-[100px] pointer-events-none -z-10"></div>

      <div className={`transition-all duration-500 ease-in-out flex flex-col items-center w-full px-4 ${data && data.length > 0 ? 'mt-8' : 'mt-[20vh]'}`}>
        <div className="w-full max-w-3xl relative animate-in fade-in slide-in-from-bottom-4">
          <h1 className={`text-display font-display text-center mb-8 transition-all duration-500 ${data && data.length > 0 ? 'hidden' : 'block'}`}>
            <span className="gradient-text">Semantic Search</span>
          </h1>
          <span className="material-symbols-outlined absolute left-6 top-1/2 -translate-y-1/2 text-on-surface-variant text-[28px] z-10">search</span>
          <input 
            className="w-full glass-input rounded-full pl-16 pr-6 py-5 text-headline-sm shadow-premium outline-none" 
            placeholder="Search ideas, decisions, tasks..." 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            autoFocus
          />
        </div>
      </div>

      <main className="px-margin-mobile py-stack-md max-w-4xl mx-auto mt-8 relative z-10">
        <div className="mb-stack-md flex justify-between items-end">
          <h2 className="text-label-md font-bold text-on-surface-variant uppercase tracking-wider mb-4">
            {isLoading ? 'Scanning context...' : data ? `${data.length} results found` : ''}
          </h2>

          {isLoading && (
            <div className="space-y-4">
              {[...Array(3)].map((_, idx) => (
                <div key={idx} className="glass-panel rounded-2xl p-6 animate-pulse">
                  <div className="h-6 bg-outline-variant/30 rounded w-1/3 mb-3"></div>
                  <div className="h-4 bg-outline-variant/30 rounded w-full mb-2"></div>
                  <div className="h-4 bg-outline-variant/30 rounded w-5/6"></div>
                </div>
              ))}
            </div>
          )}

          {error && (
            <div className="p-6 glass-panel border-error/20 text-error rounded-2xl text-body-lg shadow-sm">
              Failed to perform search. Please try again.
            </div>
          )}

          {!isLoading && data && data.length === 0 && initialQuery && (
            <div className="flex flex-col items-center justify-center p-16 text-center glass-panel rounded-3xl animate-in slide-in-from-bottom-4">
              <span className="material-symbols-outlined text-6xl text-outline-variant mb-6">search_off</span>
              <h3 className="text-headline-md font-semibold text-on-surface">No matches found</h3>
              <p className="mt-3 text-body-lg text-on-surface-variant">Try searching for broader concepts or related terms.</p>
            </div>
          )}

          {!isLoading && data && data.length > 0 && (
            data.map((result: any, idx: number) => (
              <div 
                key={idx} 
                style={{ animationDelay: `${idx * 100}ms` }}
                onClick={() => router.push(`/dashboard/meetings/${result.meeting_id}`)} 
                className="glass-panel rounded-2xl p-6 transition-all duration-300 cursor-pointer hover:shadow-premium hover:-translate-y-1 group animate-in slide-in-from-bottom-4 fade-in"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="material-symbols-outlined text-[20px] text-primary">
                        {result.content_type === 'summary' ? 'auto_awesome' : result.content_type === 'action_item' ? 'checklist' : 'description'}
                      </span>
                    </div>
                    <h3 className="text-body-lg font-semibold text-on-surface uppercase tracking-wider group-hover:text-primary transition-colors">{result.meeting_title}</h3>
                  </div>
                  <span className="text-label-md font-bold text-white bg-gradient-to-r from-primary to-secondary px-3 py-1 rounded-full flex items-center gap-1 shadow-sm">
                    <span className="material-symbols-outlined text-[14px]">radar</span>
                    {Math.round(result.similarity * 100)}%
                  </span>
                </div>
                
                <p className="text-body-lg text-on-surface-variant line-clamp-3 leading-relaxed pl-13">
                  "...{result.content_text}..."
                </p>

                <div className="mt-5 pl-13 flex items-center gap-4 text-label-sm text-outline font-medium">
                  <span className="flex items-center gap-1.5 bg-surface-container-low px-2 py-1 rounded-md">
                    <span className="material-symbols-outlined text-[16px]">calendar_today</span>
                    {result.meeting_date ? new Date(result.meeting_date).toLocaleDateString() : 'Unknown Date'}
                  </span>
                  <span className="capitalize px-2 py-1 bg-surface-container-low rounded-md">
                    {result.content_type.replace('_', ' ')}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  )
}

export default function SearchResultsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-on-surface-variant">Loading search...</div>}>
      <SearchResultsContent />
    </Suspense>
  )
}
