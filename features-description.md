MeetSense — Product Spec Pack
1. Full Feature List
Core (MVP — build these first)
Input methods
Paste raw transcript (text)
Upload audio file (mp3/wav/m4a) → auto-transcribed
AI Transcription (Groq Whisper large-v3)
AI Extraction (Gemini Flash, structured JSON output)
Meeting summary (2–3 sentences)
Key decisions list
Action items with owner + deadline
Dashboard
List of all past meetings (title, date, quick summary)
Meeting detail page (full transcript, summary, decisions, action items)
Action item tracking
Mark action item as done/pending
Filter by owner / status
Auth (Supabase Auth — email/password or Google login)
V2 / Stretch Features (add after MVP works)
Speaker-level notes (not full diarization — just "who spoke about what" if speaker labels are provided manually)
Search across meetings (semantic search using embeddings — ties back to your RAG experience)
Export options: PDF summary, Markdown export, copy-to-clipboard formatted notes
Integrations
Sync action items to Notion (Notion API, free)
Sync action items to Trello (Trello API, free)
Slack notification when new action items are extracted
Recurring meeting grouping (tag meetings as part of a series, e.g., "Weekly Standup")
Analytics dashboard: action item completion rate, most common decision owners, meeting frequency trends
Team workspaces (multi-user, shared meetings within an org)
Email digest: weekly summary of open action items sent via email
Deadline reminders (cron job / Supabase Edge Function that emails overdue action items)
Multi-language transcript support (Whisper already supports this — just surface it in UI)
Custom extraction templates (e.g., "Sales Call" template extracts objections/next steps instead of generic action items)
"Wow factor" additions (optional, for demo/portfolio polish)
Upload a sample meeting audio right on the landing page so recruiters can try it without signing up
Animated "before/after" — raw transcript wall of text → clean structured output
Public demo mode with a pre-loaded fake meeting
