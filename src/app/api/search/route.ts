import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

export async function POST(request: Request) {
  try {
    const { query, project_id } = await request.json()

    if (!query || typeof query !== 'string') {
      return NextResponse.json({ error: 'Valid search query is required' }, { status: 400 })
    }

    const supabase = await createClient()
    const { data: userData, error: authError } = await supabase.auth.getUser()

    if (authError || !userData?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 1. Generate embedding for the search query
    const embeddingModel = genAI.getGenerativeModel({ model: "text-embedding-004" })
    const result = await embeddingModel.embedContent(query)
    const queryEmbedding = result.embedding.values

    // 2. Query Supabase RPC for semantic matches
    const { data: matches, error: rpcError } = await supabase.rpc('match_meeting_embeddings', {
      query_embedding: `[${queryEmbedding.join(',')}]`,
      match_user_id: userData.user.id,
      match_threshold: 0.65, // Lower threshold for general search compared to deduplication
      match_count: 10,
      match_project_id: project_id || null
    })

    if (rpcError) {
      console.error('RPC Error:', rpcError)
      throw new Error('Failed to execute semantic search')
    }

    // 3. Fetch meeting details for the matched embeddings to display titles/dates
    // The RPC returns meeting_id, content_text, content_type, similarity
    // We want to group by meeting_id and fetch the meeting titles
    const meetingIds = [...new Set(matches.map((m: any) => m.meeting_id))]
    
    let meetingDetails: any[] = []
    if (meetingIds.length > 0) {
      const { data: meetings, error: meetingsError } = await supabase
        .from('meetings')
        .select('id, title, created_at')
        .in('id', meetingIds)
      
      if (!meetingsError && meetings) {
        meetingDetails = meetings
      }
    }

    // Merge details back into matches
    const enrichedMatches = matches.map((match: any) => {
      const meetingInfo = meetingDetails.find(m => m.id === match.meeting_id)
      return {
        ...match,
        meeting_title: meetingInfo?.title || 'Unknown Meeting',
        meeting_date: meetingInfo?.created_at || null
      }
    })

    return NextResponse.json({ results: enrichedMatches })
  } catch (error: any) {
    console.error('Search API Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
