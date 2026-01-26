-- supabase/seed.sql

-- Insert categories
INSERT INTO public.categories (name_key, icon, color, order_index) VALUES
  ('history', 'scroll', '#f59e0b', 1),
  ('context', 'map', '#10b981', 2),
  ('verses', 'book-open', '#3b82f6', 3),
  ('doctrines', 'church', '#8b5cf6', 4);

-- Insert sample achievements
INSERT INTO public.achievements (name, description, icon, condition_type, condition_value, coin_reward) VALUES
  ('Premier Pas', 'Completez votre premiere lecon', 'footprints', 'lessons_completed', 1, 10),
  ('Semaine Fidele', 'Maintenez une serie de 7 jours', 'flame', 'streak', 7, 50),
  ('Historien', 'Completez toutes les lecons d''Histoire', 'scroll', 'category_history', 100, 100),
  ('Memoire Vive', 'Memorisez 10 versets', 'brain', 'verses_memorized', 10, 75),
  ('Sans Faute', 'Completez une lecon avec 100%', 'star', 'perfect_lesson', 1, 25),
  ('Erudit', 'Atteignez le niveau 10', 'graduation-cap', 'level', 10, 100),
  ('Devoue', 'Maintenez une serie de 30 jours', 'trophy', 'streak', 30, 200);

-- Insert starter cosmetics
INSERT INTO public.cosmetics (type, name, asset_url, unlock_type, unlock_value, is_active) VALUES
  -- Free avatars
  ('avatar', 'Disciple', '/avatars/disciple.png', 'free', 0, true),
  ('avatar', 'Berger', '/avatars/berger.png', 'free', 0, true),
  ('avatar', 'Prophete', '/avatars/prophete.png', 'free', 0, true),
  -- Level unlocks
  ('title', 'Apprenti', NULL, 'level', 5, true),
  ('theme', 'Violet', NULL, 'level', 10, true),
  ('frame', 'Couronne', '/frames/crown.png', 'level', 20, true),
  -- Coin purchases
  ('title', 'Disciple', NULL, 'coins', 100, true),
  ('theme', 'Bleu', NULL, 'coins', 150, true),
  ('avatar', 'Roi', '/avatars/roi.png', 'coins', 300, true),
  -- Gem purchases
  ('frame', 'Erudit', '/frames/erudit.png', 'gems', 50, true),
  ('theme', 'Or', NULL, 'gems', 100, true),
  ('avatar', 'Ange', '/avatars/ange.png', 'gems', 150, true);
