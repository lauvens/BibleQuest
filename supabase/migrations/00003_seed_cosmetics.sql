-- Seed cosmetics data
-- Avatars (type: avatar)
INSERT INTO cosmetics (type, name, asset_url, unlock_type, unlock_value, is_active) VALUES
  ('avatar', 'Défaut', NULL, 'free', 0, true),
  ('avatar', 'Roi David', '/avatars/david.png', 'coins', 300, true),
  ('avatar', 'Moïse', '/avatars/moses.png', 'coins', 300, true),
  ('avatar', 'Esther', '/avatars/esther.png', 'coins', 300, true),
  ('avatar', 'Paul', '/avatars/paul.png', 'gems', 25, true),
  ('avatar', 'Marie', '/avatars/mary.png', 'gems', 25, true);

-- Frames (type: frame)
INSERT INTO cosmetics (type, name, asset_url, unlock_type, unlock_value, is_active) VALUES
  ('frame', 'Aucun', NULL, 'free', 0, true),
  ('frame', 'Couronne d''Or', '/frames/gold.png', 'gems', 50, true),
  ('frame', 'Argent', '/frames/silver.png', 'coins', 200, true),
  ('frame', 'Bronze', '/frames/bronze.png', 'coins', 100, true),
  ('frame', 'Flammes', '/frames/fire.png', 'level', 10, true),
  ('frame', 'Lumière Divine', '/frames/divine.png', 'gems', 100, true);

-- Titles (type: title)
INSERT INTO cosmetics (type, name, asset_url, unlock_type, unlock_value, is_active) VALUES
  ('title', 'Aucun', NULL, 'free', 0, true),
  ('title', 'Disciple', NULL, 'free', 0, true),
  ('title', 'Théologien', NULL, 'coins', 200, true),
  ('title', 'Érudit', NULL, 'coins', 150, true),
  ('title', 'Prophète', NULL, 'level', 15, true),
  ('title', 'Apôtre', NULL, 'gems', 75, true);

-- Themes (type: theme)
INSERT INTO cosmetics (type, name, asset_url, unlock_type, unlock_value, is_active) VALUES
  ('theme', 'Parchemin', NULL, 'free', 0, true),
  ('theme', 'Royal', NULL, 'coins', 150, true),
  ('theme', 'Océan', NULL, 'coins', 150, true),
  ('theme', 'Forêt', NULL, 'coins', 150, true),
  ('theme', 'Crépuscule', NULL, 'gems', 40, true),
  ('theme', 'Minuit', NULL, 'gems', 40, true);
