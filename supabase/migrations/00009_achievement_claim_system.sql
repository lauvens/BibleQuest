-- Add claimed field to user_achievements
-- false = unlocked but reward not yet collected
ALTER TABLE public.user_achievements
  ADD COLUMN claimed BOOLEAN NOT NULL DEFAULT false;

-- Mark all existing achievements as claimed (they already got their rewards)
UPDATE public.user_achievements SET claimed = true;

-- Allow members to update their own claimed status
CREATE POLICY "Users can claim their own achievements" ON public.user_achievements
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
