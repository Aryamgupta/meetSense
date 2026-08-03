'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useMutation, useQueryClient } from '@tanstack/react-query'

export default function NewMeetingPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  
  const [activeTab, setActiveTab] = useState<'upload' | 'paste'>('upload')
  const [title, setTitle] = useState('')
  const [transcript, setTranscript] = useState('')
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  
  // Loading state
  const [uploadState, setUploadState] = useState<'idle' | 'transcribing' | 'extracting' | 'done'>('idle')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAudioFile(e.target.files[0])
    }
  }

  const processAudioMutation = useMutation({
    mutationFn: async () => {
      setUploadState('transcribing')
      const formData = new FormData()
      formData.append('file', audioFile as Blob)
      formData.append('title', title)

      const uploadRes = await fetch('/api/meetings/upload-audio', {
        method: 'POST',
        body: formData
      })
      if (!uploadRes.ok) throw new Error('Audio upload or transcription failed')
      const { meetingId } = await uploadRes.json()

      setUploadState('extracting')
      const extractRes = await fetch(`/api/meetings/${meetingId}/extract`, {
        method: 'POST'
      })
      if (!extractRes.ok) throw new Error('Extraction failed')
      return meetingId
    },
    onSuccess: (meetingId) => {
      setUploadState('done')
      queryClient.invalidateQueries({ queryKey: ['meetings'] })
      setTimeout(() => {
        router.push(`/dashboard/meetings/${meetingId}`)
      }, 500)
    },
    onError: (error) => {
      console.error(error)
      setUploadState('idle')
      alert('Failed to process meeting: ' + error.message)
    }
  })

  const processTextMutation = useMutation({
    mutationFn: async () => {
      setUploadState('extracting')
      const uploadRes = await fetch('/api/meetings/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, transcript })
      })
      if (!uploadRes.ok) throw new Error('Upload failed')
      const { meetingId } = await uploadRes.json()

      const extractRes = await fetch(`/api/meetings/${meetingId}/extract`, {
        method: 'POST'
      })
      if (!extractRes.ok) throw new Error('Extraction failed')
      return meetingId
    },
    onSuccess: (meetingId) => {
      setUploadState('done')
      queryClient.invalidateQueries({ queryKey: ['meetings'] })
      setTimeout(() => {
        router.push(`/dashboard/meetings/${meetingId}`)
      }, 500)
    },
    onError: (error) => {
      console.error(error)
      setUploadState('idle')
      alert('Failed to process text: ' + error.message)
    }
  })

  const generateDevAudio = async () => {
    if (!transcript) return
    setIsGenerating(true)
    try {
      const res = await fetch('/api/dev/generate-audio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: transcript })
      })
      if (!res.ok) throw new Error('Failed to generate audio')
      
      const blob = await res.blob()
      const file = new File([blob], 'generated_meeting.mp3', { type: 'audio/mpeg' })
      setAudioFile(file)
      setActiveTab('upload')
    } catch (error: any) {
      alert(error.message)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleProcess = () => {
    if (activeTab === 'upload' && audioFile) {
      processAudioMutation.mutate()
    } else if (activeTab === 'paste' && transcript) {
      processTextMutation.mutate()
    }
  }

  return (
    <div className="bg-background-page text-on-surface min-h-screen">
      <header className="w-full sticky top-0 bg-surface-container-lowest border-b border-outline-variant z-40">
        <div className="flex justify-between items-center px-4 md:px-margin-desktop py-4 w-full max-w-full mx-auto">
          <div className="flex items-center gap-4">
            <button onClick={() => router.push('/dashboard')} className="flex items-center justify-center p-2 rounded-lg hover:bg-surface-container-low transition-all cursor-pointer">
              <span className="material-symbols-outlined text-on-surface-variant">arrow_back</span>
            </button>
            <h1 className="text-headline-sm font-headline-sm font-bold text-primary">New Meeting</h1>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 md:px-0 py-12">
        <div className="mb-8">
          <input 
            type="text" 
            placeholder="Meeting Title (Optional)" 
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-transparent text-display font-display text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-0 border-none px-0"
          />
        </div>

        <div className="flex gap-8 mb-8 border-b border-outline-variant">
          <button 
            className={`pb-4 text-label-md font-label-md transition-all ${activeTab === 'upload' ? 'text-primary border-b-2 border-primary' : 'text-on-surface-variant hover:text-on-surface'}`}
            onClick={() => setActiveTab('upload')}
          >
            Upload Audio
          </button>
          <button 
            className={`pb-4 text-label-md font-label-md transition-all ${activeTab === 'paste' ? 'text-primary border-b-2 border-primary' : 'text-on-surface-variant hover:text-on-surface'}`}
            onClick={() => setActiveTab('paste')}
          >
            Paste Transcript
          </button>
        </div>

        {activeTab === 'upload' && (
          <div className="space-y-stack-lg transition-all duration-300">
            <div 
              className="bg-surface-container-lowest border-2 border-dashed border-outline-variant rounded-xl p-12 flex flex-col items-center justify-center text-center transition-all hover:border-primary-container group shadow-sm hover:shadow-md cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept="audio/*" 
                className="hidden" 
              />
              <div className="w-16 h-16 bg-surface-container-low rounded-full flex items-center justify-center mb-6 group-hover:bg-primary-fixed transition-colors">
                <span className="material-symbols-outlined text-primary text-4xl" data-icon="cloud_upload">
                  {audioFile ? 'audio_file' : 'cloud_upload'}
                </span>
              </div>
              <h2 className="text-headline-sm font-headline-sm mb-2">
                {audioFile ? audioFile.name : 'Upload audio file'}
              </h2>
              <p className="text-body-md text-on-surface-variant mb-8 max-w-md">
                {audioFile 
                  ? `${(audioFile.size / 1024 / 1024).toFixed(2)} MB` 
                  : 'Supported formats: MP3, WAV, M4A. Maximum file size 25MB (Groq Limit).'
                }
              </p>
              <button className="bg-surface-container-lowest border border-outline-variant text-primary font-label-md px-6 py-2.5 rounded-lg hover:bg-surface-container-low transition-all">
                {audioFile ? 'Change file' : 'Browse files'}
              </button>
            </div>
          </div>
        )}

        {activeTab === 'paste' && (
          <div className="space-y-stack-lg transition-all duration-300">
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm">
              <label className="block text-label-md font-label-md text-on-surface-variant mb-3">Paste your meeting transcript here</label>
              <textarea 
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                className="w-full h-80 bg-surface-container-lowest border border-outline-variant rounded-lg p-4 text-body-md focus:ring-2 focus:ring-primary focus:outline-none transition-all placeholder:text-outline-variant text-on-surface" 
                placeholder="Speaker 1: Hi everyone, let's start the sync..."
              />
              
              {process.env.NODE_ENV === 'development' && (
                <div className="mt-4 flex justify-end">
                  <button 
                    onClick={generateDevAudio}
                    disabled={!transcript || isGenerating}
                    className="flex items-center gap-2 bg-secondary-container text-on-secondary-container px-4 py-2 rounded-lg font-label-md hover:bg-secondary-fixed-dim transition-colors disabled:opacity-50"
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {isGenerating ? 'hourglass_empty' : 'graphic_eq'}
                    </span>
                    {isGenerating ? 'Generating MP3...' : 'Generate Audio (Dev Only)'}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {uploadState !== 'idle' ? (
          <div className="mt-12 w-full max-w-sm mx-auto bg-surface-container-lowest border border-outline-variant p-6 rounded-xl shadow-sm">
            <div className="space-y-6">
              {activeTab === 'upload' && (
                <div className="flex items-center gap-4 group">
                  <div className="relative flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center z-10 ${uploadState === 'transcribing' ? 'bg-primary-fixed-dim text-primary animate-pulse' : 'bg-status-success text-on-primary'}`}>
                      {uploadState === 'transcribing' ? (
                        <span className="material-symbols-outlined text-sm animate-spin">sync</span>
                      ) : (
                        <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>
                      )}
                    </div>
                    {uploadState !== 'transcribing' && <div className="absolute h-10 w-0.5 bg-status-success top-8"></div>}
                  </div>
                  <div className="flex flex-col">
                    <span className={`text-label-md font-label-md ${uploadState === 'transcribing' ? 'text-primary' : 'text-on-surface'}`}>Transcribing...</span>
                    <span className="text-label-sm text-on-surface-variant">Converting audio to text with Groq Whisper</span>
                  </div>
                </div>
              )}

              <div className={`flex items-center gap-4 ${activeTab === 'paste' || uploadState !== 'transcribing' ? '' : 'opacity-40'}`}>
                <div className="relative flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center z-10 ${uploadState === 'extracting' ? 'bg-primary-fixed-dim text-primary animate-pulse' : uploadState === 'done' ? 'bg-status-success text-on-primary' : 'bg-surface-container-highest text-on-surface-variant'}`}>
                    {uploadState === 'extracting' ? (
                      <span className="material-symbols-outlined text-sm animate-spin">sync</span>
                    ) : uploadState === 'done' ? (
                      <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>
                    ) : (
                      <span className="text-[10px] font-bold">02</span>
                    )}
                  </div>
                </div>
                <div className="flex flex-col">
                  <span className={`text-label-md font-label-md ${uploadState === 'extracting' ? 'text-primary' : uploadState === 'done' ? 'text-on-surface' : 'text-on-surface-variant'}`}>Extracting insights...</span>
                  <span className="text-label-sm text-on-surface-variant">AI is identifying key decisions and action items</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-12 flex flex-col items-center">
            <button 
              onClick={handleProcess}
              disabled={activeTab === 'upload' ? !audioFile : !transcript}
              className="w-full md:w-auto min-w-[240px] bg-primary text-on-primary font-label-md text-lg px-8 py-4 rounded-xl shadow-lg hover:bg-primary-container disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] transition-all flex items-center justify-center gap-3"
            >
              Analyze Meeting
              <span className="material-symbols-outlined">auto_awesome</span>
            </button>
          </div>
        )}
      </main>
    </div>
  )
}
