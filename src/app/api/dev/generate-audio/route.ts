import { NextResponse } from 'next/server'
import * as googleTTS from 'google-tts-api'

export async function POST(request: Request) {
  // Security check: Only allow in development
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  try {
    const { text } = await request.json()

    if (!text) {
      return NextResponse.json({ error: 'No text provided' }, { status: 400 })
    }

    // Split text into chunks and get base64 audio for each chunk
    const results = await googleTTS.getAllAudioBase64(text, {
      lang: 'en',
      slow: false,
      host: 'https://translate.google.com',
      splitPunct: ',.?!',
    })

    // Convert each base64 string to a Buffer and concatenate them
    const buffers = results.map(result => Buffer.from(result.base64, 'base64'))
    const combinedBuffer = Buffer.concat(buffers)

    // Return the combined audio as a downloadable file
    return new NextResponse(combinedBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Disposition': 'attachment; filename="generated_meeting.mp3"',
        'Content-Length': combinedBuffer.length.toString(),
      },
    })
  } catch (error: any) {
    console.error('Dev Audio Generation Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
