-- supabase/migrations/00001_initial_schema.sql

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE user_role AS ENUM ('user', 'admin');
CREATE TYPE question_type AS ENUM ('multiple_choice', 'true_false', 'fill_blank', 'matching', 'ordering', 'typing', 'timed', 'image');
CREATE TYPE cosmetic_type AS ENUM ('avatar', 'frame', 'title', 'theme');
CREATE TYPE unlock_type AS ENUM ('free', 'level', 'coins', 'gems');

-- Users table (extends Supabase auth.users)
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  username TEXT UNIQUE,
  avatar_url TEXT,
  equipped_frame_id UUID,
  equipped_title_id UUID,
  theme TEXT DEFAULT 'default',
  xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  coins INTEGER DEFAULT 0,
  gems INTEGER DEFAULT 0,
  hearts INTEGER DEFAULT 5,
  hearts_updated_at TIMESTAMPTZ DEFAULT NOW(),
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_activity_date DATE,
  role user_role DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Categories
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name_key TEXT NOT NULL UNIQUE,
  icon TEXT NOT NULL,
  color TEXT NOT NULL,
  order_index INTEGER NOT NULL
);

-- Units
CREATE TABLE public.units (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  order_index INTEGER NOT NULL,
  unlock_threshold INTEGER DEFAULT 0,
  image_url TEXT
);

-- Lessons
CREATE TABLE public.lessons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  unit_id UUID NOT NULL REFERENCES public.units(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  order_index INTEGER NOT NULL,
  xp_reward INTEGER DEFAULT 10,
  coin_reward INTEGER DEFAULT 5
);

-- Questions
CREATE TABLE public.questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  type question_type NOT NULL,
  content JSONB NOT NULL,
  difficulty INTEGER DEFAULT 1 CHECK (difficulty >= 1 AND difficulty <= 3),
  is_ai_generated BOOLEAN DEFAULT false,
  is_approved BOOLEAN DEFAULT false
);

-- User Progress
CREATE TABLE public.user_progress (
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  completed BOOLEAN DEFAULT false,
  best_score INTEGER DEFAULT 0,
  attempts INTEGER DEFAULT 0,
  last_attempt_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, lesson_id)
);

-- Achievements
CREATE TABLE public.achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  condition_type TEXT NOT NULL,
  condition_value INTEGER NOT NULL,
  coin_reward INTEGER DEFAULT 0
);

-- User Achievements
CREATE TABLE public.user_achievements (
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  achievement_id UUID NOT NULL REFERENCES public.achievements(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, achievement_id)
);

-- Cosmetics
CREATE TABLE public.cosmetics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type cosmetic_type NOT NULL,
  name TEXT NOT NULL,
  asset_url TEXT,
  unlock_type unlock_type NOT NULL,
  unlock_value INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true
);

-- User Cosmetics
CREATE TABLE public.user_cosmetics (
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  cosmetic_id UUID NOT NULL REFERENCES public.cosmetics(id) ON DELETE CASCADE,
  purchased_at TIMESTAMPTZ DEFAULT NOW(),
  is_equipped BOOLEAN DEFAULT false,
  PRIMARY KEY (user_id, cosmetic_id)
);

-- Bible Verses
CREATE TABLE public.bible_verses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  translation TEXT NOT NULL,
  book TEXT NOT NULL,
  chapter INTEGER NOT NULL,
  verse INTEGER NOT NULL,
  text TEXT NOT NULL,
  UNIQUE (translation, book, chapter, verse)
);

-- Weekly Leaderboard View
CREATE TABLE public.leaderboard_weekly (
  user_id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  username TEXT,
  avatar_url TEXT,
  xp_this_week INTEGER DEFAULT 0,
  rank INTEGER
);

-- Indexes for performance
CREATE INDEX idx_units_category ON public.units(category_id);
CREATE INDEX idx_lessons_unit ON public.lessons(unit_id);
CREATE INDEX idx_questions_lesson ON public.questions(lesson_id);
CREATE INDEX idx_user_progress_user ON public.user_progress(user_id);
CREATE INDEX idx_user_progress_lesson ON public.user_progress(lesson_id);
CREATE INDEX idx_bible_verses_book ON public.bible_verses(translation, book, chapter);

-- Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cosmetics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_cosmetics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bible_verses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leaderboard_weekly ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Users: can read own data, admins can read all
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Categories, Units, Lessons, Questions: public read
CREATE POLICY "Anyone can view categories" ON public.categories
  FOR SELECT USING (true);

CREATE POLICY "Anyone can view units" ON public.units
  FOR SELECT USING (true);

CREATE POLICY "Anyone can view lessons" ON public.lessons
  FOR SELECT USING (true);

CREATE POLICY "Anyone can view approved questions" ON public.questions
  FOR SELECT USING (is_approved = true);

-- User Progress: users can manage their own
CREATE POLICY "Users can view own progress" ON public.user_progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress" ON public.user_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress" ON public.user_progress
  FOR UPDATE USING (auth.uid() = user_id);

-- Achievements: public read
CREATE POLICY "Anyone can view achievements" ON public.achievements
  FOR SELECT USING (true);

-- User Achievements: users can manage their own
CREATE POLICY "Users can view own achievements" ON public.user_achievements
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own achievements" ON public.user_achievements
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Cosmetics: public read active items
CREATE POLICY "Anyone can view active cosmetics" ON public.cosmetics
  FOR SELECT USING (is_active = true);

-- User Cosmetics: users can manage their own
CREATE POLICY "Users can view own cosmetics" ON public.user_cosmetics
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own cosmetics" ON public.user_cosmetics
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own cosmetics" ON public.user_cosmetics
  FOR UPDATE USING (auth.uid() = user_id);

-- Bible Verses: public read
CREATE POLICY "Anyone can view bible verses" ON public.bible_verses
  FOR SELECT USING (true);

-- Leaderboard: public read
CREATE POLICY "Anyone can view leaderboard" ON public.leaderboard_weekly
  FOR SELECT USING (true);

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, username)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create user profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
