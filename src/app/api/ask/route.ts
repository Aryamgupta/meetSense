import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { generateEmbedding } from '@/lib/embeddings'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

export async function POST(request: Request) {
  try {
    const { question, conversationHistory = [], project_id } = await request.json()

    if (!question || typeof question !== 'string') {
      return NextResponse.json({ error: 'Valid question is required' }, { status: 400 })
    }

    const supabase = await createClient()
    const { data: userData, error: authError } = await supabase.auth.getUser()

    if (authError || !userData?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 1. Generate embedding for the question (768-dim, matches stored vectors)
    const queryEmbedding = await generateEmbedding(question)

    // 2. Retrieve top relevant chunks via match_meeting_embeddings
    const { data: matches, error: rpcError } = await supabase.rpc('match_meeting_embeddings', {
      query_embedding: `[${queryEmbedding.join(',')}]`,
      match_user_id: userData.user.id,
      match_threshold: 0.65,
      match_count: 15,
      match_project_id: project_id || null
    })

    if (rpcError) {
      console.error('RPC Error:', rpcError)
      throw new Error('Failed to retrieve context for chat')
    }

    // 3. Fetch meeting details to build citations
    const meetingIds = [...new Set(matches?.map((m: any) => m.meeting_id) || [])]
    let meetingDetails: any[] = []
    if (meetingIds.length > 0) {
      const { data: meetings } = await supabase
        .from('meetings')
        .select('id, title, created_at')
        .in('id', meetingIds)
      if (meetings) meetingDetails = meetings
    }

    // 4. Build the context string AND a citation map keyed by source index,
    // so every [Source N] the model cites is traceable to a specific meeting.
    let contextString = ''
    const citations: Record<string, { meeting_id: string; meeting_title: string; meeting_date: string }> = {}
    const sourcesSummary: { meeting_id: string; meeting_title: string; meeting_date: string; indices: number[] }[] = []

    if (matches && matches.length > 0) {
      matches.forEach((match: any, i: number) => {
        const index = i + 1
        const meetingInfo = meetingDetails.find((m) => m.id === match.meeting_id)
        const title = meetingInfo?.title || 'Unknown Meeting'
        const date = meetingInfo?.created_at
          ? new Date(meetingInfo.created_at).toLocaleDateString()
          : 'Unknown Date'

        contextString += `[Source ${index}: Meeting "${title}" on ${date}]\n${match.content_text}\n\n`

        citations[index] = { meeting_id: match.meeting_id, meeting_title: title, meeting_date: date }

        const existing = sourcesSummary.find((s) => s.meeting_id === match.meeting_id)
        if (existing) {
          existing.indices.push(index)
        } else {
          sourcesSummary.push({
            meeting_id: match.meeting_id,
            meeting_title: title,
            meeting_date: date,
            indices: [index]
          })
        }
      })
    }

    // 5. Build prompt and call Gemini for generation
    const model = genAI.getGenerativeModel({ model: 'gemini-3.5-flash-lite' })

    const formattedHistory = conversationHistory.map((msg: any) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }))

    const finalPrompt = `You are "MeetSense", an AI assistant that answers questions based strictly on the user's past meeting notes and transcripts.

Here are relevant excerpts from the user's past meetings to help you answer the current question:
---
${contextString || '(No relevant excerpts found for this specific query)'}
---

Instructions:
1. Answer the user's question based ONLY on the excerpts provided above.
2. If you don't have enough information in the excerpts to answer, politely say so. Do not invent or hallucinate answers.
3. Format your answer using markdown (use **bold** for emphasis and bullet lists where helpful).
4. When you state a fact, cite it using the exact format [Source N] where N is the source number from the excerpts above. Cite each source individually, e.g. "[Source 1] [Source 3]" rather than grouping them like "[Source 1, 3]".

Question: ${question}`

    const chat = model.startChat({ history: formattedHistory })
    const chatResult = await chat.sendMessage(finalPrompt)
    const answer = chatResult.response.text()

    return NextResponse.json({
      answer,
      citations,
      sources: contextString ? sourcesSummary : []
    })

  } catch (error: any) {
    console.error('Chat API Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
