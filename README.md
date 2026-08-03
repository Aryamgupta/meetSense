# MeetSense

**AI meeting assistant that turns spoken conversations into structured summaries, decisions, and action items.**

Upload a meeting recording or paste a transcript — MeetSense transcribes it, extracts key decisions and action items with owners and deadlines, and gives you a clean dashboard to track follow-through.

---

## Why

Meeting notes are usually messy, scattered across Slack, or never written at all. MeetSense turns raw conversation into a structured, trackable record — a "ledger" of what was decided and who owns what.

## Features

- 🎙️ **Audio upload** — drop in an MP3/WAV/M4A recording, auto-transcribed via Groq Whisper
- 📝 **Paste transcript** — skip transcription entirely if you already have text
- 🤖 **AI extraction** — Gemini generates a summary, decisions list, and action items (owner + deadline) as structured JSON
- ✅ **Action item tracking** — mark items done/pending, filter by status
- 📊 **Dashboard** — searchable list of all past meetings with open-item counts
- 🔒 **Auth & data isolation** — Supabase Auth with Row Level Security, each user only sees their own meetings

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | Next.js 14 (App Router), TypeScript, Tailwind CSS |
| Backend | Next.js API Routes |
| Database | Supabase (Postgres) |
| Auth | Supabase Auth |
| File storage | Supabase Storage |
| Transcription | Groq API (Whisper large-v3-turbo) |
| AI extraction | Google Gemini API (structured JSON output) |
| Data fetching | TanStack Query |
| Hosting | Vercel |

## Architecture

```
User uploads audio/transcript
        │
        ▼
/api/meetings/upload-audio  ──►  Supabase Storage (audio file)
        │                    ──►  Groq Whisper (transcription)
        ▼
/api/meetings/[id]/extract  ──►  Gemini (structured JSON extraction)
        │
        ▼
Supabase Postgres (meetings, action_items, decisions)
        │
        ▼
Dashboard + Meeting Detail UI (Next.js + TanStack Query)
```

## Database Schema

```sql
meetings (id, user_id, title, raw_transcript, audio_url, summary, status, created_at)
action_items (id, meeting_id, task, owner, deadline, status)
decisions (id, meeting_id, decision_text)
```

`status` on `meetings` is one of: `processing` | `completed` | `failed`.
`status` on `action_items` is one of: `pending` | `done`.

Row Level Security is enabled on all tables — users can only access rows tied to their own `auth.uid()`.

## Getting Started

### Prerequisites
- Node.js 18+
- A [Supabase](https://supabase.com) project
- A [Groq](https://console.groq.com) API key (free tier)
- A [Google AI Studio](https://aistudio.google.com) Gemini API key (free tier)

### Setup

```bash
git clone https://github.com/<your-username>/meetsense.git
cd meetsense
npm install
```

Create a `.env.local` file:

```
GROQ_API_KEY=
GEMINI_API_KEY=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

Run the database migration (see `/supabase/schema.sql`) in your Supabase SQL editor to create the tables and RLS policies.

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Status

🚧 In active development.

- [x] Auth + database schema
- [x] Text-transcript extraction pipeline
- [x] Dashboard + meeting detail UI
- [x] Audio upload + Groq Whisper transcription
- [ ] Notion/Trello sync
- [ ] Semantic search across meetings
- [ ] Team workspaces

## License

MIT