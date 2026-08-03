-- Create meetings table
CREATE TABLE meetings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  title text,
  raw_transcript text,
  audio_url text,
  summary text,
  status text DEFAULT 'processing',
  created_at timestamp with time zone DEFAULT now()
);

-- Create action_items table
CREATE TABLE action_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id uuid REFERENCES meetings(id) ON DELETE CASCADE,
  task text NOT NULL,
  owner text,
  deadline date,
  status text DEFAULT 'pending'
);

-- Create decisions table
CREATE TABLE decisions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id uuid REFERENCES meetings(id) ON DELETE CASCADE,
  decision_text text
);

-- Enable RLS
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE action_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE decisions ENABLE ROW LEVEL SECURITY;

-- Create policies for meetings
CREATE POLICY "Users can manage their own meetings"
  ON meetings FOR ALL
  USING (auth.uid() = user_id);

-- Create policies for action_items
CREATE POLICY "Users can manage action items for their meetings"
  ON action_items FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM meetings
      WHERE meetings.id = action_items.meeting_id
      AND meetings.user_id = auth.uid()
    )
  );

-- Create policies for decisions
CREATE POLICY "Users can manage decisions for their meetings"
  ON decisions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM meetings
      WHERE meetings.id = decisions.meeting_id
    )
  );

-- Create audio-uploads storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('audio-uploads', 'audio-uploads', true);

-- Create policy for authenticated users to upload files
CREATE POLICY "Users can upload audio"
  ON storage.objects FOR INSERT
  WITH CHECK ( bucket_id = 'audio-uploads' AND auth.uid() = owner );
