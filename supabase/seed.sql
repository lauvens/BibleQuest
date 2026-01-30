-- supabase/seed.sql

-- Insert categories
INSERT INTO public.categories (name_key, icon, color, order_index) VALUES
  ('history', 'scroll', '#f59e0b', 1),
  ('context', 'map', '#10b981', 2),
  ('verses', 'book-open', '#3b82f6', 3),
  ('doctrines', 'church', '#8b5cf6', 4);

-- Insert units
INSERT INTO public.units (id, category_id, name, description, order_index, unlock_threshold)
SELECT id, category_id, name, description, order_index, unlock_threshold FROM (VALUES
  ('a1000000-0000-0000-0000-000000000001'::uuid, (SELECT id FROM public.categories WHERE name_key = 'history'), 'La Création', 'Les origines du monde selon la Genèse', 1, 0),
  ('a1000000-0000-0000-0000-000000000002'::uuid, (SELECT id FROM public.categories WHERE name_key = 'history'), 'Les Patriarches', 'Abraham, Isaac et Jacob', 2, 3),
  ('a2000000-0000-0000-0000-000000000001'::uuid, (SELECT id FROM public.categories WHERE name_key = 'context'), 'Géographie Biblique', 'Les lieux importants de la Bible', 1, 0),
  ('a2000000-0000-0000-0000-000000000002'::uuid, (SELECT id FROM public.categories WHERE name_key = 'context'), 'Culture et Société', 'La vie quotidienne à l''époque biblique', 2, 2),
  ('a3000000-0000-0000-0000-000000000001'::uuid, (SELECT id FROM public.categories WHERE name_key = 'verses'), 'Versets de Foi', 'Les versets fondamentaux sur la foi', 1, 0),
  ('a3000000-0000-0000-0000-000000000002'::uuid, (SELECT id FROM public.categories WHERE name_key = 'verses'), 'Versets de Promesse', 'Les promesses de Dieu dans la Bible', 2, 2),
  ('a4000000-0000-0000-0000-000000000001'::uuid, (SELECT id FROM public.categories WHERE name_key = 'doctrines'), 'Dieu et la Trinité', 'Comprendre la nature de Dieu', 1, 0),
  ('a4000000-0000-0000-0000-000000000002'::uuid, (SELECT id FROM public.categories WHERE name_key = 'doctrines'), 'Le Salut', 'La doctrine du salut par la grâce', 2, 2)
) AS t(id, category_id, name, description, order_index, unlock_threshold);

-- Insert lessons
INSERT INTO public.lessons (id, unit_id, name, order_index, xp_reward, coin_reward) VALUES
  -- History > La Création
  ('b1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'Au commencement', 1, 15, 10),
  ('b1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000001', 'Le jardin d''Éden', 2, 15, 10),
  ('b1000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000001', 'La chute de l''homme', 3, 15, 10),
  -- History > Les Patriarches
  ('b1000000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000002', 'L''appel d''Abraham', 1, 20, 15),
  ('b1000000-0000-0000-0000-000000000005', 'a1000000-0000-0000-0000-000000000002', 'Isaac et Jacob', 2, 20, 15),
  -- Context > Géographie
  ('b2000000-0000-0000-0000-000000000001', 'a2000000-0000-0000-0000-000000000001', 'La Terre Promise', 1, 15, 10),
  ('b2000000-0000-0000-0000-000000000002', 'a2000000-0000-0000-0000-000000000001', 'Jérusalem, ville sainte', 2, 15, 10),
  -- Context > Culture
  ('b2000000-0000-0000-0000-000000000003', 'a2000000-0000-0000-0000-000000000002', 'La vie au temps de Jésus', 1, 20, 15),
  ('b2000000-0000-0000-0000-000000000004', 'a2000000-0000-0000-0000-000000000002', 'Les fêtes juives', 2, 20, 15),
  -- Verses > Foi
  ('b3000000-0000-0000-0000-000000000001', 'a3000000-0000-0000-0000-000000000001', 'Jean 3:16', 1, 15, 10),
  ('b3000000-0000-0000-0000-000000000002', 'a3000000-0000-0000-0000-000000000001', 'Romains 8:28', 2, 15, 10),
  -- Verses > Promesse
  ('b3000000-0000-0000-0000-000000000003', 'a3000000-0000-0000-0000-000000000002', 'Jérémie 29:11', 1, 20, 15),
  ('b3000000-0000-0000-0000-000000000004', 'a3000000-0000-0000-0000-000000000002', 'Psaume 23', 2, 20, 15),
  -- Doctrines > Trinité
  ('b4000000-0000-0000-0000-000000000001', 'a4000000-0000-0000-0000-000000000001', 'Dieu le Père', 1, 15, 10),
  ('b4000000-0000-0000-0000-000000000002', 'a4000000-0000-0000-0000-000000000001', 'Jésus le Fils', 2, 15, 10),
  ('b4000000-0000-0000-0000-000000000003', 'a4000000-0000-0000-0000-000000000001', 'Le Saint-Esprit', 3, 15, 10),
  -- Doctrines > Salut
  ('b4000000-0000-0000-0000-000000000004', 'a4000000-0000-0000-0000-000000000002', 'La grâce de Dieu', 1, 20, 15),
  ('b4000000-0000-0000-0000-000000000005', 'a4000000-0000-0000-0000-000000000002', 'La foi et les œuvres', 2, 20, 15);

-- Insert questions (samples per lesson - all approved)
-- See full question set in execute_sql calls

-- Insert sample achievements
INSERT INTO public.achievements (name, description, icon, condition_type, condition_value, coin_reward) VALUES
  ('Premier Pas', 'Complétez votre première leçon', 'footprints', 'lessons_completed', 1, 10),
  ('Semaine Fidèle', 'Maintenez une série de 7 jours', 'flame', 'streak', 7, 50),
  ('Historien', 'Complétez toutes les leçons d''Histoire', 'scroll', 'category_history', 100, 100),
  ('Mémoire Vive', 'Mémorisez 10 versets', 'brain', 'verses_memorized', 10, 75),
  ('Sans Faute', 'Complétez une leçon avec 100%', 'star', 'perfect_lesson', 1, 25),
  ('Érudit', 'Atteignez le niveau 10', 'graduation-cap', 'level', 10, 100),
  ('Dévoué', 'Maintenez une série de 30 jours', 'trophy', 'streak', 30, 200);

-- Insert starter cosmetics
INSERT INTO public.cosmetics (type, name, asset_url, unlock_type, unlock_value, is_active) VALUES
  ('avatar', 'Disciple', '/avatars/disciple.png', 'free', 0, true),
  ('avatar', 'Berger', '/avatars/berger.png', 'free', 0, true),
  ('avatar', 'Prophète', '/avatars/prophete.png', 'free', 0, true),
  ('title', 'Apprenti', NULL, 'level', 5, true),
  ('theme', 'Violet', NULL, 'level', 10, true),
  ('frame', 'Couronne', '/frames/crown.png', 'level', 20, true),
  ('title', 'Disciple', NULL, 'coins', 100, true),
  ('theme', 'Bleu', NULL, 'coins', 150, true),
  ('avatar', 'Roi', '/avatars/roi.png', 'coins', 300, true),
  ('frame', 'Érudit', '/frames/erudit.png', 'gems', 50, true),
  ('theme', 'Or', NULL, 'gems', 100, true),
  ('avatar', 'Ange', '/avatars/ange.png', 'gems', 150, true);
