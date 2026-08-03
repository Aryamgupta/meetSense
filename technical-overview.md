PROJECT: MeetSense — AI Meeting Notes & Action Item Extractor

### PRODUCT SUMMARY
MeetSense is a web application that lets a user upload a meeting recording
(audio file) or paste a raw transcript, and automatically generates:
1. A short AI-written summary of the meeting
2. A list of key decisions made
3. A list of action items, each with an owner and deadline (if mentioned)

Users can then track those action items (mark done/pending) from a
dashboard. This is a single-user-per-account SaaS tool (no team features
in v1) targeting professionals who want to stop manually writing meeting
notes.

### TECH STACK (all free-tier friendly)
- Frontend: Next.js 14 (App Router), TypeScript, Tailwind CSS
- Backend: Next.js API Routes (no separate backend server)
- Database: Supabase (Postgres)
- Auth: Supabase Auth (email/password + Google OAuth)
- File storage: Supabase Storage (for uploaded audio files)
- Transcription: Groq API, model "whisper-large-v3"
- AI extraction: Google Gemini API (gemini-1.5-flash or gemini-2.0-flash),
  using structured JSON output mode
- Hosting: Vercel
- State/data fetching on frontend: TanStack Query (React Query)

### ENVIRONMENT VARIABLES NEEDED
GROQ_API_KEY=
GEMINI_API_KEY=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

### DATABASE SCHEMA (Supabase Postgres)

table: meetings
- id: uuid, primary key, default gen_random_uuid()
- user_id: uuid, references auth.users(id)
- title: text
- raw_transcript: text
- audio_url: text, nullable (Supabase Storage path if audio was uploaded)
- summary: text, nullable
- status: text, default 'processing'  -- processing | completed | failed
- created_at: timestamp, default now()

table: action_items
- id: uuid, primary key, default gen_random_uuid()
- meeting_id: uuid, references meetings(id) on delete cascade
- task: text, not null
- owner: text, nullable
- deadline: date, nullable
- status: text, default 'pending'  -- pending | done

table: decisions
- id: uuid, primary key, default gen_random_uuid()
- meeting_id: uuid, references meetings(id) on delete cascade
- decision_text: text

Enable Row Level Security on all tables. Policy: users can only
select/insert/update/delete rows where user_id matches their own auth
uid (for meetings), and via join through meeting_id for action_items and
decisions.

### APPLICATION FLOW (end to end)
1. User logs in (Supabase Auth)
2. User clicks "New Meeting" → chooses Upload Audio or Paste Transcript
3. On submit:
   a. If audio: upload file to Supabase Storage, then send file to Groq
      Whisper API for transcription, get transcript text back
   b. If pasted text: use directly as transcript
4. Insert a new row into `meetings` with status 'processing' and the
   raw_transcript
5. Send transcript to Gemini with a structured extraction prompt (see
   below), requesting JSON output matching a defined schema
6. Parse the JSON response:
   - Update `meetings.summary` and set status to 'completed'
   - Insert rows into `action_items` for each extracted action item
   - Insert rows into `decisions` for each extracted decision
7. Redirect user to the Meeting Detail page showing everything
8. On the dashboard, user can see all meetings, click into any one, and
   toggle action items between pending/done

### API ROUTES TO IMPLEMENT

POST /api/meetings/upload
  - Accepts multipart form data (audio file) OR JSON body with raw text
  - If audio: upload to Supabase Storage bucket "meeting-audio", call
    Groq Whisper API with the file, return transcript
  - If text: pass through directly
  - Creates a `meetings` row with status 'processing'
  - Returns { meetingId }

POST /api/meetings/[id]/extract
  - Fetches the meeting's raw_transcript from DB
  - Calls Gemini API with the extraction prompt (below)
  - Parses JSON response
  - Updates meetings.summary + status='completed'
  - Bulk inserts into action_items and decisions
  - Returns the full structured result

GET /api/meetings
  - Returns list of meetings for the logged-in user (id, title, created_at,
    summary, count of pending action items)

GET /api/meetings/[id]
  - Returns full meeting detail: meeting row + its action_items + decisions

PATCH /api/action-items/[id]
  - Body: { status: 'done' | 'pending' }
  - Updates the action item status

DELETE /api/meetings/[id]
  - Deletes a meeting and cascades to action_items/decisions

### GEMINI EXTRACTION PROMPT (use exactly this structure)

System/user prompt to send to Gemini:

"You are analyzing a meeting transcript. Return ONLY valid JSON matching
this exact schema, with no markdown formatting, no code fences, and no
extra commentary:

{
  "summary": "string, 2-3 sentences summarizing the meeting",
  "decisions": ["string", "string"],
  "action_items": [
    { "task": "string", "owner": "string or null", "deadline": "YYYY-MM-DD or null" }
  ]
}

Transcript:
<insert transcript text here>"

Use Gemini's responseMimeType: "application/json" config option if
available in the SDK version being used, to enforce valid JSON output.

### FRONTEND PAGES TO BUILD
- /login — Supabase auth UI (email/password + Google)
- /dashboard — list of meetings, "+ New Meeting" button, search bar
- /dashboard/new — tabbed upload (Audio | Paste Transcript) with a
  multi-step loading indicator (Uploading → Transcribing → Extracting)
- /dashboard/meetings/[id] — meeting detail: summary card, decisions list,
  action items list (checkbox to toggle status), collapsible full
  transcript at the bottom
- Global layout: sidebar nav (Dashboard, Settings, Logout)

### BUILD PHASES (please implement in this order, confirming after each
phase before moving to the next)

Phase 1 — Foundation
- Scaffold Next.js + TypeScript + Tailwind project
- Set up Supabase client, auth (login/signup pages), and protected routes
- Create the database schema + RLS policies via Supabase migration/SQL

Phase 2 — Core pipeline (text-only, no audio yet)
- Build /api/meetings/upload accepting only pasted text
- Build /api/meetings/[id]/extract calling Gemini and saving structured
  results
- Build a minimal dashboard + meeting detail page to verify the full
  pipeline works end to end with plain text input

Phase 3 — Dashboard polish
- Full meeting list UI with summary cards and action item badges
- Meeting detail page with decisions/action items sections, status
  toggles, collapsible transcript

Phase 4 — Audio support
- Add audio upload to Supabase Storage
- Integrate Groq Whisper transcription into the upload route
- Add multi-step loading UI (Uploading → Transcribing → Extracting)

Phase 5 — Deploy
- Deploy to Vercel, set environment variables, verify Supabase Storage
  bucket policies allow authenticated uploads

Please ask before proceeding if any environment variable, API key, or
schema decision is ambiguous, but otherwise implement each phase fully
before moving to the next.
