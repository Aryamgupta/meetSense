import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

const SYSTEM_PROMPT = `You are analyzing a meeting transcript. Return ONLY valid JSON matching this exact schema, with no markdown formatting, no code fences, and no extra commentary:
{
  "summary": "string, 2-3 sentences summarizing the meeting",
  "decisions": ["string", "string"],
  "action_items": [
    { "task": "string", "owner": "string or null", "deadline": "YYYY-MM-DD or null" }
  ]
}`

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
      .select('raw_transcript, user_id')
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


    // 2. Call Gemini
    const model = genAI.getGenerativeModel({
      model: 'gemini-3.5-flash-lite',
      generationConfig: {
        responseMimeType: "application/json"
      }
    })

    const prompt = `${SYSTEM_PROMPT}\n\nTranscript:\n${meeting.raw_transcript}`
    const result = await model.generateContent(prompt)
    const responseText = result.response.text()

    let extractedData
    try {
      extractedData = JSON.parse(responseText)
    } catch (e) {
      throw new Error("Gemini returned invalid JSON")
    }

    // 3. Update meeting summary & status
    const { error: updateError } = await supabase
      .from('meetings')
      .update({
        summary: extractedData.summary,
        status: 'completed'
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

    // 5. Insert action items
    const actionItems = extractedData.action_items ?? []
    if (actionItems.length > 0) {
      const actionItemInserts = actionItems.map((item: any) => ({
        meeting_id: id,
        task: item.task,
        owner: item.owner || null,
        deadline: item.deadline || null,
        status: 'pending'
      }))
      await supabase.from('action_items').insert(actionItemInserts)
    }

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
