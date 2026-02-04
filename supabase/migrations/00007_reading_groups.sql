-- supabase/migrations/00007_reading_groups.sql
-- Reading Groups: Groupes de lecture biblique avec défis

-- Role enum for group members
CREATE TYPE group_role AS ENUM ('owner', 'admin', 'member');

-- Challenge status enum
CREATE TYPE challenge_status AS ENUM ('active', 'completed', 'cancelled');

-- Reading groups table
CREATE TABLE public.reading_groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  cover_color TEXT DEFAULT '#6366F1',
  creator_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  invite_code TEXT UNIQUE DEFAULT encode(gen_random_bytes(4), 'hex'),
  max_members INTEGER DEFAULT 20,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Group members table
CREATE TABLE public.group_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID NOT NULL REFERENCES public.reading_groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  role group_role NOT NULL DEFAULT 'member',
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(group_id, user_id)
);

-- Reading challenges (assigned by owner/admin)
CREATE TABLE public.reading_challenges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID NOT NULL REFERENCES public.reading_groups(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  book_name TEXT NOT NULL,
  chapter_start INTEGER NOT NULL,
  verse_start INTEGER DEFAULT 1,
  chapter_end INTEGER,
  verse_end INTEGER,
  deadline TIMESTAMPTZ NOT NULL,
  status challenge_status DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Individual progress on challenges
CREATE TABLE public.challenge_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  challenge_id UUID NOT NULL REFERENCES public.reading_challenges(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  notes TEXT,
  UNIQUE(challenge_id, user_id)
);

-- Indexes
CREATE INDEX idx_group_members_group ON public.group_members(group_id);
CREATE INDEX idx_group_members_user ON public.group_members(user_id);
CREATE INDEX idx_reading_challenges_group ON public.reading_challenges(group_id);
CREATE INDEX idx_reading_challenges_deadline ON public.reading_challenges(deadline);
CREATE INDEX idx_challenge_progress_challenge ON public.challenge_progress(challenge_id);
CREATE INDEX idx_challenge_progress_user ON public.challenge_progress(user_id);

-- Enable RLS
ALTER TABLE public.reading_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reading_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_progress ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Members can view their groups" ON public.reading_groups
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.group_members
      WHERE group_members.group_id = reading_groups.id
      AND group_members.user_id = auth.uid()
    )
    OR is_public = true
  );

CREATE POLICY "Authenticated users can create groups" ON public.reading_groups
  FOR INSERT WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Creator can update group" ON public.reading_groups
  FOR UPDATE USING (auth.uid() = creator_id);

CREATE POLICY "Creator can delete group" ON public.reading_groups
  FOR DELETE USING (auth.uid() = creator_id);

CREATE POLICY "Members can view group members" ON public.group_members
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.group_members gm
      WHERE gm.group_id = group_members.group_id
      AND gm.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can join groups" ON public.group_members
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Owner/admin can remove members" ON public.group_members
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.group_members gm
      WHERE gm.group_id = group_members.group_id
      AND gm.user_id = auth.uid()
      AND gm.role IN ('owner', 'admin')
    )
    OR auth.uid() = user_id
  );

CREATE POLICY "Members can view challenges" ON public.reading_challenges
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.group_members
      WHERE group_members.group_id = reading_challenges.group_id
      AND group_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Owner/admin can create challenges" ON public.reading_challenges
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.group_members
      WHERE group_members.group_id = reading_challenges.group_id
      AND group_members.user_id = auth.uid()
      AND group_members.role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Creator can update challenge" ON public.reading_challenges
  FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Creator can delete challenge" ON public.reading_challenges
  FOR DELETE USING (auth.uid() = created_by);

CREATE POLICY "Members can view challenge progress" ON public.challenge_progress
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.reading_challenges rc
      JOIN public.group_members gm ON gm.group_id = rc.group_id
      WHERE rc.id = challenge_progress.challenge_id
      AND gm.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create their progress" ON public.challenge_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their progress" ON public.challenge_progress
  FOR UPDATE USING (auth.uid() = user_id);

-- Function to auto-add creator as owner
CREATE OR REPLACE FUNCTION add_group_creator_as_owner()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.group_members (group_id, user_id, role)
  VALUES (NEW.id, NEW.creator_id, 'owner');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_group_created
  AFTER INSERT ON public.reading_groups
  FOR EACH ROW EXECUTE FUNCTION add_group_creator_as_owner();
