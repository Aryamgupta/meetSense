import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function POST(request: Request) {
  try {
    const { transcript, title } = await request.json()
    const supabase = await createClient()

    const { data: userData, error: authError } = await supabase.auth.getUser()
    
    if (authError || !userData?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data, error } = await supabase
      .from('meetings')
      .insert({
        user_id: userData.user.id,
        title: title || 'Untitled Meeting',
        raw_transcript: transcript,
        status: 'processing',
      })
      .select('id')
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json({ meetingId: data.id })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
