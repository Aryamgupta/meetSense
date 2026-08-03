Design a clean, modern web app called "MeetSense" — an AI meeting assistant
that turns meeting recordings/transcripts into structured summaries and
action items.

Style: Minimal, professional SaaS aesthetic. Soft neutral background
(off-white/light gray), one confident accent color (indigo or teal),
generous whitespace, rounded corners (8-12px), subtle shadows. Clean
sans-serif typography (Inter or similar). Should feel like a modern
productivity tool (think Linear, Notion, or Superhuman) — not playful or
colorful, but calm and trustworthy since it's a work tool.

Screens needed:

1. Landing page
   - Hero section: headline "Turn every meeting into action" + subheadline
   - CTA button: "Try it free"
   - Below hero: 3-step visual (Upload → AI Extracts → Track Action Items)
   - Simple nav bar: logo left, "Login" / "Get Started" right

2. Login / Signup page
   - Centered card, email + password fields, Google login button
   - Minimal, no distractions

3. Dashboard (main app, after login)
   - Left sidebar: nav (Dashboard, Meetings, Settings), user avatar at bottom
   - Top bar: "+ New Meeting" primary button, search bar
   - Main area: card grid or list of past meetings, each card shows:
     meeting title, date, one-line AI summary, number of open action items
     (small badge/pill)

4. New Meeting / Upload screen
   - Two tabs: "Upload Audio" and "Paste Transcript"
   - Upload tab: drag-and-drop zone with icon
   - Paste tab: large textarea
   - "Analyze Meeting" primary button, loading state showing
     "Transcribing..." → "Extracting insights..." progress steps

5. Meeting Detail page
   - Header: meeting title, date, edit/delete icons
   - Summary card at top (highlighted box)
   - Two-column layout below:
     - Left: "Decisions" list (bullet points in a card)
     - Right: "Action Items" list — each item is a row with checkbox,
       task text, owner tag (small colored pill), deadline date, and a
       status toggle
   - Collapsible "View Full Transcript" section at the bottom

6. Empty states
   - Empty dashboard: friendly illustration + "No meetings yet — upload
     your first one" with CTA button

Component style: cards with 1px light border + subtle shadow on hover,
buttons with rounded corners and clear primary/secondary hierarchy,
status pills (pending = amber, done = green), consistent 8px spacing grid.

Generate: Landing page, Login page, Dashboard, New Meeting upload screen,
and Meeting Detail page as separate screens in one cohesive design system.
