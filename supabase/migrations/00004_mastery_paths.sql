-- supabase/migrations/00004_mastery_paths.sql
-- Mastery Paths: Deep learning paths on theological topics

-- Difficulty enum for paths
CREATE TYPE path_difficulty AS ENUM ('beginner', 'intermediate', 'advanced');

-- Milestone types
CREATE TYPE milestone_type AS ENUM ('lesson', 'quiz', 'reading', 'reflection');

-- Mastery paths table
CREATE TABLE public.mastery_paths (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT DEFAULT 'book-open',
  color TEXT DEFAULT '#6B7280',
  cover_image_url TEXT,
  estimated_hours INTEGER DEFAULT 2,
  difficulty path_difficulty DEFAULT 'beginner',
  order_index INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Path milestones (steps in a path)
CREATE TABLE public.path_milestones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  path_id UUID NOT NULL REFERENCES public.mastery_paths(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  milestone_type milestone_type NOT NULL DEFAULT 'lesson',
  content JSONB,
  order_index INTEGER DEFAULT 0,
  xp_reward INTEGER DEFAULT 25,
  coin_reward INTEGER DEFAULT 10,
  required_score INTEGER DEFAULT 70
);

-- Questions for quiz milestones
CREATE TABLE public.milestone_questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  milestone_id UUID NOT NULL REFERENCES public.path_milestones(id) ON DELETE CASCADE,
  type question_type NOT NULL,
  content JSONB NOT NULL,
  difficulty INTEGER DEFAULT 1 CHECK (difficulty >= 1 AND difficulty <= 3),
  order_index INTEGER DEFAULT 0
);

-- User progress on paths
CREATE TABLE public.user_path_progress (
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  path_id UUID NOT NULL REFERENCES public.mastery_paths(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  current_milestone_index INTEGER DEFAULT 0,
  PRIMARY KEY (user_id, path_id)
);

-- User progress on individual milestones
CREATE TABLE public.user_milestone_progress (
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  milestone_id UUID NOT NULL REFERENCES public.path_milestones(id) ON DELETE CASCADE,
  completed BOOLEAN DEFAULT false,
  best_score INTEGER DEFAULT 0,
  attempts INTEGER DEFAULT 0,
  completed_at TIMESTAMPTZ,
  PRIMARY KEY (user_id, milestone_id)
);

-- Indexes for performance
CREATE INDEX idx_path_milestones_path ON public.path_milestones(path_id);
CREATE INDEX idx_milestone_questions_milestone ON public.milestone_questions(milestone_id);
CREATE INDEX idx_user_path_progress_user ON public.user_path_progress(user_id);
CREATE INDEX idx_user_path_progress_path ON public.user_path_progress(path_id);
CREATE INDEX idx_user_milestone_progress_user ON public.user_milestone_progress(user_id);
CREATE INDEX idx_user_milestone_progress_milestone ON public.user_milestone_progress(milestone_id);

-- Enable RLS
ALTER TABLE public.mastery_paths ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.path_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.milestone_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_path_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_milestone_progress ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Mastery paths: public read for published paths
CREATE POLICY "Anyone can view published paths" ON public.mastery_paths
  FOR SELECT USING (is_published = true);

-- Path milestones: public read (if path is published)
CREATE POLICY "Anyone can view milestones of published paths" ON public.path_milestones
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.mastery_paths
      WHERE id = path_milestones.path_id AND is_published = true
    )
  );

-- Milestone questions: public read (if milestone's path is published)
CREATE POLICY "Anyone can view questions of published path milestones" ON public.milestone_questions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.path_milestones pm
      JOIN public.mastery_paths mp ON mp.id = pm.path_id
      WHERE pm.id = milestone_questions.milestone_id AND mp.is_published = true
    )
  );

-- User path progress: users can manage their own
CREATE POLICY "Users can view own path progress" ON public.user_path_progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own path progress" ON public.user_path_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own path progress" ON public.user_path_progress
  FOR UPDATE USING (auth.uid() = user_id);

-- User milestone progress: users can manage their own
CREATE POLICY "Users can view own milestone progress" ON public.user_milestone_progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own milestone progress" ON public.user_milestone_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own milestone progress" ON public.user_milestone_progress
  FOR UPDATE USING (auth.uid() = user_id);
