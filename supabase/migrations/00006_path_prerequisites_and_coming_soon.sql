-- supabase/migrations/00006_path_prerequisites_and_coming_soon.sql
-- Add prerequisites system and coming soon status to mastery paths

-- Add new category: theology
ALTER TYPE path_category ADD VALUE IF NOT EXISTS 'theology';

-- Add prerequisite path reference (path that must be completed to unlock this one)
ALTER TABLE public.mastery_paths
ADD COLUMN IF NOT EXISTS required_path_id UUID REFERENCES public.mastery_paths(id) ON DELETE SET NULL;

-- Add coming soon flag for paths in development
ALTER TABLE public.mastery_paths
ADD COLUMN IF NOT EXISTS is_coming_soon BOOLEAN DEFAULT false;

-- Create index for faster prerequisite lookups
CREATE INDEX IF NOT EXISTS idx_mastery_paths_required_path ON public.mastery_paths(required_path_id);

-- Comment for documentation
COMMENT ON COLUMN public.mastery_paths.required_path_id IS 'The path that must be completed before this path is unlocked';
COMMENT ON COLUMN public.mastery_paths.is_coming_soon IS 'If true, the path is shown but not yet accessible';
