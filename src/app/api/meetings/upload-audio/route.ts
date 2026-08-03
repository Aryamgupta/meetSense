import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const title = formData.get('title') as string

    if (!file) {
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 })
    }

    const supabase = await createClient()
    const { data: userData, error: authError } = await supabase.auth.getUser()
    
    if (authError || !userData?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 1. Upload to Supabase Storage
    const fileExt = file.name.split('.').pop()
    const fileName = `${userData.user.id}-${Date.now()}.${fileExt}`
    const { data: storageData, error: storageError } = await supabase.storage
      .from('audio-uploads')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (storageError) {
      console.error('Storage error:', storageError)
      return NextResponse.json({ error: 'Failed to upload audio to storage' }, { status: 500 })
    }

    const { data: publicUrlData } = supabase.storage
      .from('audio-uploads')
      .getPublicUrl(fileName)

    const audioUrl = publicUrlData.publicUrl

    // 2. Transcribe with Groq Whisper
    const groqFormData = new FormData()
    groqFormData.append('file', file)
    groqFormData.append('model', 'whisper-large-v3-turbo')
    groqFormData.append('response_format', 'json')
    groqFormData.append('language', 'en')

    const groqResponse = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: groqFormData
    })

    if (!groqResponse.ok) {
      const errorText = await groqResponse.text()
      console.error('Groq API error:', errorText)
      return NextResponse.json({ error: 'Failed to transcribe audio' }, { status: 500 })
    }

    const groqData = await groqResponse.json()
    const rawTranscript = groqData.text

    // 3. Save to database
    const { data: meetingData, error: dbError } = await supabase
      .from('meetings')
      .insert({
        user_id: userData.user.id,
        title: title || 'Audio Meeting',
        raw_transcript: rawTranscript,
        audio_url: audioUrl,
        status: 'processing',
      })
      .select('id')
      .single()

    if (dbError) {
      console.error('Database error:', dbError)
      throw dbError
    }

    return NextResponse.json({ meetingId: meetingData.id })
  } catch (error: any) {
    console.error('Upload Audio API Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
