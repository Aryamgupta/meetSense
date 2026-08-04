import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { generateEmbedding } from '@/lib/embeddings'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

const SYSTEM_PROMPT = `You are analyzing a meeting transcript. The transcript may be in multiple languages or contain code-switched languages (e.g., Hinglish). Please analyze the content and return ONLY valid JSON matching this exact schema in English, with no markdown formatting, no code fences, and no extra commentary:
{
  "summary": "string, 2-3 sentences summarizing the meeting",
  "decisions": ["string", "string"],
  "action_items": [
    { "task": "string", "owner": "string or null", "deadline": "YYYY-MM-DD or null" }
  ],
  "suggested_next_agenda": ["string", "string"],
  "tone": "neutral | positive | tense | mixed"
}

IMPORTANT INSTRUCTIONS:
- Speaker Attribution: If the transcript includes speaker labels, prefer the speaker who explicitly agreed to own an action item (e.g., 'Yes, I'll do that') over the person who merely suggested the task.
- Suggested Agenda: Based on unresolved action items and decisions, suggest 2-3 short agenda items for the next meeting.
- Tone: Provide a high-level sentiment flag for the meeting.`

function chunkText(text: string, maxTokens: number = 500): string[] {
  const maxChars = maxTokens * 4; // Rough approximation
  const chunks: string[] = [];
  let currentChunk = '';
  const words = text.split(/\s+/);
  
  for (const word of words) {
    if ((currentChunk.length + word.length + 1) > maxChars) {
      chunks.push(currentChunk.trim());
      currentChunk = word + ' ';
    } else {
      currentChunk += word + ' ';
    }
  }
  if (currentChunk.trim().length > 0) {
    chunks.push(currentChunk.trim());
  }
  return chunks;
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()

    const { data: userData, error: authError } = await supabase.auth.getUser()
    if (authError || !userData?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 1. Fetch meeting
    const { data: meeting, error: fetchError } = await supabase
      .from('meetings')
      .select('raw_transcript, user_id, project_id, series_id')
      .eq('id', id)
      .single()

    if (fetchError || !meeting) {
      return NextResponse.json({ error: 'Meeting not found' }, { status: 404 })
    }

    if (meeting.user_id !== userData.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const trimmedTranscript = meeting.raw_transcript?.trim() ?? ''

    if (trimmedTranscript.length < 20) {
      await supabase
        .from('meetings')
        .update({
          summary: 'No meaningful content was detected in this recording.',
          status: 'completed'
        })
        .eq('id', id)

      return NextResponse.json({
        summary: 'No meaningful content was detected in this recording.',
        decisions: [],
        action_items: []
      })
    }


    // 1.5 Phase G: Meeting-Series Memory
    let previousContextString = ''
    if (meeting.series_id) {
      const { data: pastMeetings } = await supabase
        .from('meetings')
        .select('title, summary, created_at')
        .eq('series_id', meeting.series_id)
        .eq('status', 'completed')
        .neq('id', id)
        .order('created_at', { ascending: false })
        .limit(3)

      if (pastMeetings && pastMeetings.length > 0) {
        previousContextString = "PREVIOUS MEETING CONTEXT (For your reference to track progression):\n"
        pastMeetings.reverse().forEach((m: any) => {
           previousContextString += `- ${m.title} (${new Date(m.created_at).toLocaleDateString()}): ${m.summary}\n`
        })
      }
    }

    // 2. Call Gemini
    const model = genAI.getGenerativeModel({
      model: 'gemini-3.5-flash-lite',
      generationConfig: {
        responseMimeType: "application/json"
      }
    })

    const prompt = `${SYSTEM_PROMPT}\n\n${previousContextString ? previousContextString + '\n\n' : ''}Transcript:\n${meeting.raw_transcript}`
    const result = await model.generateContent(prompt)
    const responseText = result.response.text()

    let extractedData
    try {
      extractedData = JSON.parse(responseText)
    } catch (e) {
      throw new Error("Gemini returned invalid JSON")
    }

    // 3. Update meeting summary, status, tone, and agenda
    const { error: updateError } = await supabase
      .from('meetings')
      .update({
        summary: extractedData.summary,
        status: 'completed',
        tone: extractedData.tone || 'neutral',
        suggested_next_agenda: extractedData.suggested_next_agenda || []
      })
      .eq('id', id)

    if (updateError) throw updateError

    // 4. Insert decisions
    const decisions = extractedData.decisions ?? []
    if (decisions.length > 0) {
      const decisionInserts = decisions.map((text: string) => ({
        meeting_id: id,
        decision_text: text
      }))
      await supabase.from('decisions').insert(decisionInserts)
    }

    // 5. Insert action items (with AI Deduplication)
    const actionItems = extractedData.action_items ?? []
    const embeddingsToInsert: any[] = []

    if (actionItems.length > 0) {
      for (const item of actionItems) {
        if (!item.task) continue;

        let finalActionItemId = null;
        let embeddingStr = null;

        if (generateEmbedding) {
          try {
            const taskEmbedding = await generateEmbedding(item.task)
            embeddingStr = `[${taskEmbedding.join(',')}]`

            // Check for duplicates
            const { data: matches } = await supabase.rpc('match_open_action_items', {
              query_embedding: embeddingStr,
              match_user_id: userData.user.id,
              match_threshold: 0.85 // High threshold for exact/near-exact conceptual match
            })

            if (matches && matches.length > 0) {
              finalActionItemId = matches[0].id
              // Increment mention count
              await supabase.rpc('increment_action_item_mention', { item_id: finalActionItemId })
            }
          } catch (e) {
            console.error("Deduplication check failed for task", e)
          }
        }

        if (!finalActionItemId) {
          // Insert new
          const { data: newAi } = await supabase.from('action_items').insert({
            meeting_id: id,
            task: item.task,
            owner: item.owner || null,
            deadline: item.deadline || null,
            status: 'pending'
          }).select('id').single()
          
          if (newAi) finalActionItemId = newAi.id
        }

        if (finalActionItemId) {
          // Record mention
          await supabase.from('action_item_mentions').insert({
            action_item_id: finalActionItemId,
            meeting_id: id
          })
        }

        if (embeddingStr) {
          embeddingsToInsert.push({
            meeting_id: id,
            user_id: userData.user.id,
            content_type: 'action_item',
            content_text: item.task,
            chunk_index: 0,
            embedding: embeddingStr
          })
        }
      }
    }
    // --- PHASE A: GENERATE AND STORE EMBEDDINGS ---
    try {
      if (generateEmbedding) {
        // 1. Summary Embedding
        if (extractedData.summary) {
          embeddingsToInsert.push({
            meeting_id: id,
            user_id: userData.user.id,
            content_type: 'summary',
            content_text: extractedData.summary,
            chunk_index: 0,
            embedding: `[${(await generateEmbedding(extractedData.summary)).join(',')}]`
          })
        }

      // 3. Transcript Chunks Embeddings (with batching)
      const transcriptChunks = chunkText(trimmedTranscript, 500)
      const batchSize = 5;
      
      for (let i = 0; i < transcriptChunks.length; i += batchSize) {
        const batch = transcriptChunks.slice(i, i + batchSize)
        const batchPromises = batch.map(async (chunkText, batchIdx) => {
          const globalIdx = i + batchIdx
          const embeddingValues = await generateEmbedding(chunkText)
          return {
            meeting_id: id,
            user_id: userData.user.id,
            content_type: 'transcript_chunk',
            content_text: chunkText,
            chunk_index: globalIdx,
            embedding: `[${embeddingValues.join(',')}]`
          }
        })
        
        const batchResults = await Promise.all(batchPromises)
        embeddingsToInsert.push(...batchResults)
      }

      // Insert all embeddings into the database
      if (embeddingsToInsert.length > 0) {
        const { error: embedError } = await supabase.from('meeting_embeddings').insert(embeddingsToInsert)
        if (embedError) {
          console.error("Error inserting embeddings:", embedError)
        }
      }
      }
    } catch (embedProcessError) {
      console.error("Embedding generation failed, but extraction succeeded:", embedProcessError)
      // We don't throw here because the main extraction succeeded and we want to return the data to the user.
    }
    // --- END PHASE A ---

    return NextResponse.json(extractedData)
  } catch (error: any) {
    // Attempt to set status to failed if something goes wrong
    try {
      const { id } = await params
      const supabase = await createClient()
      await supabase.from('meetings').update({ status: 'failed' }).eq('id', id)
    } catch (e) { }

    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
