'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/utils/supabase/client'
import toast from 'react-hot-toast'

export default function NewMeetingPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  
  const [activeTab, setActiveTab] = useState<'upload' | 'paste'>('upload')
  const [title, setTitle] = useState('')
  const [transcript, setTranscript] = useState('')
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [projectId, setProjectId] = useState<string>('')
  const [seriesId, setSeriesId] = useState<string>('')
  const supabase = createClient()

  const { data: projects } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const { data } = await supabase.from('projects').select('*').order('created_at', { ascending: false })
      return data || []
    }
  })

  const { data: seriesList } = useQuery({
    queryKey: ['series'],
    queryFn: async () => {
      const { data } = await supabase.from('meeting_series').select('*').order('created_at', { ascending: false })
      return data || []
    }
  })
  
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
      if (projectId) formData.append('project_id', projectId)
      if (seriesId) formData.append('series_id', seriesId)

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
      toast.success('Meeting analyzed successfully!')
      setTimeout(() => {
        router.push(`/dashboard/meetings/${meetingId}`)
      }, 500)
    },
    onError: (error) => {
      console.error(error)
      setUploadState('idle')
      toast.error('Failed to process meeting: ' + error.message)
    }
  })

  const processTextMutation = useMutation({
    mutationFn: async () => {
      setUploadState('extracting')
      const uploadRes = await fetch('/api/meetings/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, transcript, project_id: projectId || undefined, series_id: seriesId || undefined })
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
      toast.success('Meeting analyzed successfully!')
      setTimeout(() => {
        router.push(`/dashboard/meetings/${meetingId}`)
      }, 500)
    },
    onError: (error) => {
      console.error(error)
      setUploadState('idle')
      toast.error('Failed to process text: ' + error.message)
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
      toast.success('Generated MP3 loaded!')
    } catch (error: any) {
      toast.error(error.message)
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
    <div className="bg-transparent text-on-surface h-full flex flex-col relative overflow-hidden">
      {/* Decorative background blur */}
      <div className="absolute top-[0%] left-[10%] w-[50%] h-[50%] bg-primary/20 rounded-full blur-[120px] pointer-events-none -z-10"></div>
      <div className="absolute bottom-[20%] right-[10%] w-[40%] h-[40%] bg-secondary/20 rounded-full blur-[100px] pointer-events-none -z-10"></div>

      <main className="max-w-3xl mx-auto px-4 md:px-0 py-12 w-full relative z-10">
        
        <div className="flex items-center gap-3 mb-8">
          <span className="material-symbols-outlined text-primary text-[32px]">add_circle</span>
          <h1 className="text-display font-display font-bold gradient-text">New Meeting</h1>
        </div>

        <div className="glass-panel border border-outline-variant/30 rounded-3xl shadow-premium p-8 mb-8 animate-in fade-in slide-in-from-bottom-4">
          <div className="flex flex-col gap-6">
            <input 
              type="text" 
              placeholder="Meeting Title (Optional)" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-transparent text-headline-md font-display text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-0 border-b border-outline-variant/50 focus:border-primary px-2 py-4 transition-colors"
            />
            <div className="flex flex-col sm:flex-row gap-4 w-full">
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="flex-1 glass-input border border-outline-variant/50 text-on-surface text-body-md rounded-xl px-4 py-4 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none cursor-pointer"
              >
                <option value="">No Project</option>
                {projects?.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
              <select
                value={seriesId}
                onChange={(e) => setSeriesId(e.target.value)}
                className="flex-1 glass-input border border-outline-variant/50 text-on-surface text-body-md rounded-xl px-4 py-4 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none cursor-pointer"
              >
                <option value="">Not a Series</option>
                {seriesList?.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
          </div>
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
          <div className="space-y-stack-lg transition-all duration-300 animate-in fade-in">
            <div 
              className="glass-panel border-2 border-dashed border-primary/30 rounded-3xl p-12 flex flex-col items-center justify-center text-center transition-all hover:border-primary hover:bg-white/20 group shadow-sm hover:shadow-md cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept="audio/*" 
                className="hidden" 
              />
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                <span className="material-symbols-outlined text-primary text-4xl" data-icon="cloud_upload">
                  {audioFile ? 'audio_file' : 'cloud_upload'}
                </span>
              </div>
              <h2 className="text-headline-sm font-bold text-on-surface mb-2">
                {audioFile ? audioFile.name : 'Upload audio file'}
              </h2>
              <p className="text-body-md text-on-surface-variant mb-8 max-w-md">
                {audioFile 
                  ? `${(audioFile.size / 1024 / 1024).toFixed(2)} MB` 
                  : 'Supported formats: MP3, WAV, M4A. Maximum file size 25MB (Groq Limit).'
                }
              </p>
              <button className="bg-white/50 border border-outline-variant/30 text-on-surface font-semibold px-6 py-2.5 rounded-full hover:bg-white/70 transition-all shadow-sm">
                {audioFile ? 'Change file' : 'Browse files'}
              </button>
            </div>
          </div>
        )}

        {activeTab === 'paste' && (
          <div className="space-y-stack-lg transition-all duration-300 animate-in fade-in">
            <div className="glass-panel border border-outline-variant/30 rounded-3xl p-6 shadow-premium">
              <label className="block text-label-md font-semibold text-on-surface-variant mb-3">Paste your meeting transcript here</label>
              <textarea 
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                className="w-full h-80 glass-input border border-outline-variant/30 rounded-2xl p-6 text-body-md focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none transition-all placeholder:text-outline-variant text-on-surface" 
                placeholder="Speaker 1: Hi everyone, let's start the sync..."
              />
              
              {process.env.NODE_ENV === 'development' && (
                <div className="mt-4 flex justify-end">
                  <button 
                    onClick={generateDevAudio}
                    disabled={!transcript || isGenerating}
                    className="flex items-center gap-2 bg-secondary-container text-on-secondary-container px-4 py-2 rounded-full font-semibold hover:bg-secondary-fixed-dim transition-colors disabled:opacity-50 shadow-sm"
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
          <div className="mt-12 flex flex-col items-center pb-20">
            <button 
              onClick={handleProcess}
              disabled={activeTab === 'upload' ? !audioFile : !transcript}
              className="w-full md:w-auto min-w-[280px] bg-gradient-to-r from-primary to-secondary text-white font-bold text-lg px-8 py-4 rounded-full shadow-premium hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transition-all flex items-center justify-center gap-3 hover:scale-105"
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
