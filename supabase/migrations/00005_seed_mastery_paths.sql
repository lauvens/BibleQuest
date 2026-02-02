-- supabase/migrations/00005_seed_mastery_paths.sql
-- Seed data for initial mastery paths

-- Path 1: La Trinité
INSERT INTO public.mastery_paths (name, slug, description, icon, color, estimated_hours, difficulty, order_index, is_published)
VALUES (
  'La Trinité',
  'la-trinite',
  'Comprenez la doctrine fondamentale de la Trinité: Père, Fils et Saint-Esprit - un seul Dieu en trois personnes.',
  'sparkles',
  '#8B5CF6',
  3,
  'intermediate',
  1,
  true
);

-- Path 2: Canonisation de la Bible
INSERT INTO public.mastery_paths (name, slug, description, icon, color, estimated_hours, difficulty, order_index, is_published)
VALUES (
  'Canonisation de la Bible',
  'canonisation-bible',
  'Découvrez comment les 66 livres de la Bible ont été reconnus comme Écriture inspirée à travers l''histoire.',
  'scroll',
  '#F59E0B',
  4,
  'advanced',
  2,
  true
);

-- Path 3: Histoire de l'Église
INSERT INTO public.mastery_paths (name, slug, description, icon, color, estimated_hours, difficulty, order_index, is_published)
VALUES (
  'Histoire de l''Église',
  'histoire-eglise',
  'Parcourez 2000 ans d''histoire chrétienne, des apôtres jusqu''à aujourd''hui.',
  'church',
  '#10B981',
  5,
  'beginner',
  3,
  true
);

-- Milestones for La Trinité
INSERT INTO public.path_milestones (path_id, name, description, milestone_type, content, order_index, xp_reward, coin_reward, required_score)
SELECT
  id,
  'Introduction à la Trinité',
  'Découvrez les bases de cette doctrine centrale.',
  'lesson',
  '{"title": "Qu''est-ce que la Trinité?", "sections": [{"heading": "Un mystère révélé", "content": "La Trinité est l''une des doctrines les plus fondamentales et mystérieuses du christianisme. Elle affirme qu''il existe un seul Dieu qui subsiste éternellement en trois personnes distinctes: le Père, le Fils et le Saint-Esprit.\n\nCe n''est pas trois dieux (polythéisme), ni un dieu qui joue trois rôles (modalisme), mais un seul Dieu en trois personnes coéternelles et coégales."}, {"heading": "Pourquoi est-ce important?", "content": "Comprendre la Trinité nous aide à:\n- Mieux connaître qui est Dieu\n- Comprendre l''oeuvre du salut\n- Vivre notre relation avec Dieu de manière plus profonde\n- Adorer Dieu en vérité"}]}'::jsonb,
  0,
  30,
  15,
  70
FROM public.mastery_paths WHERE slug = 'la-trinite';

INSERT INTO public.path_milestones (path_id, name, description, milestone_type, content, order_index, xp_reward, coin_reward, required_score)
SELECT
  id,
  'Le Père Éternel',
  'Explorez les attributs de Dieu le Père.',
  'reading',
  '{"title": "Dieu le Père", "reference": "Matthieu 6:9-13", "text": "Voici donc comment vous devez prier: Notre Père qui es aux cieux! Que ton nom soit sanctifié; que ton règne vienne; que ta volonté soit faite sur la terre comme au ciel. Donne-nous aujourd''hui notre pain quotidien; pardonne-nous nos offenses, comme nous aussi nous pardonnons à ceux qui nous ont offensés; ne nous induis pas en tentation, mais délivre-nous du malin.", "questions": ["Que signifie appeler Dieu ''Père''?", "Comment cette prière révèle-t-elle le caractère du Père?", "Quelle relation le Père désire-t-il avoir avec nous?"]}'::jsonb,
  1,
  25,
  10,
  70
FROM public.mastery_paths WHERE slug = 'la-trinite';

INSERT INTO public.path_milestones (path_id, name, description, milestone_type, content, order_index, xp_reward, coin_reward, required_score)
SELECT
  id,
  'Quiz: Le Père',
  'Testez vos connaissances sur Dieu le Père.',
  'quiz',
  '{}'::jsonb,
  2,
  40,
  20,
  70
FROM public.mastery_paths WHERE slug = 'la-trinite';

INSERT INTO public.path_milestones (path_id, name, description, milestone_type, content, order_index, xp_reward, coin_reward, required_score)
SELECT
  id,
  'Jésus-Christ, le Fils',
  'Découvrez la divinité et l''humanité de Jésus.',
  'lesson',
  '{"title": "Le Fils de Dieu", "sections": [{"heading": "Pleinement Dieu", "content": "Jean 1:1 déclare: ''Au commencement était la Parole, et la Parole était avec Dieu, et la Parole était Dieu.''\n\nJésus possède tous les attributs divins: éternité, omniscience, omnipotence. Il a accepté l''adoration (Matthieu 28:9) et a pardonné les péchés (Marc 2:5-7)."}, {"heading": "Pleinement homme", "content": "Jésus a aussi pris une nature humaine complète. Il a eu faim, soif, il a pleuré, il a souffert.\n\nCette union de deux natures en une seule personne est appelée ''l''union hypostatique'' - un mystère qui permet à Jésus d''être notre médiateur parfait entre Dieu et les hommes."}]}'::jsonb,
  3,
  30,
  15,
  70
FROM public.mastery_paths WHERE slug = 'la-trinite';

INSERT INTO public.path_milestones (path_id, name, description, milestone_type, content, order_index, xp_reward, coin_reward, required_score)
SELECT
  id,
  'Le Saint-Esprit',
  'Comprenez le rôle et la personne du Saint-Esprit.',
  'lesson',
  '{"title": "L''Esprit de Dieu", "sections": [{"heading": "Une personne, pas une force", "content": "Le Saint-Esprit n''est pas simplement une énergie ou une influence divine. Il est une personne qui:\n- Parle (Actes 13:2)\n- Peut être attristé (Éphésiens 4:30)\n- Enseigne (Jean 14:26)\n- Intercède (Romains 8:26)"}, {"heading": "Son oeuvre dans nos vies", "content": "Le Saint-Esprit:\n- Convainc de péché (Jean 16:8)\n- Régénère le croyant (Tite 3:5)\n- Habite en nous (1 Corinthiens 6:19)\n- Produit le fruit de l''Esprit (Galates 5:22-23)\n- Accorde des dons spirituels (1 Corinthiens 12)"}]}'::jsonb,
  4,
  30,
  15,
  70
FROM public.mastery_paths WHERE slug = 'la-trinite';

INSERT INTO public.path_milestones (path_id, name, description, milestone_type, content, order_index, xp_reward, coin_reward, required_score)
SELECT
  id,
  'Réflexion finale',
  'Méditez sur ce que la Trinité signifie pour votre foi.',
  'reflection',
  '{"scripture": "Que la grâce du Seigneur Jésus-Christ, l''amour de Dieu, et la communion du Saint-Esprit, soient avec vous tous! - 2 Corinthiens 13:14", "prompt": "Cette bénédiction trinitaire résume magnifiquement comment les trois personnes de la Trinité interagissent avec nous.", "questions": ["Comment la grâce de Jésus a-t-elle transformé votre vie?", "De quelles manières expérimentez-vous l''amour du Père?", "Qu''est-ce que la communion avec le Saint-Esprit signifie pratiquement pour vous?"]}'::jsonb,
  5,
  35,
  20,
  70
FROM public.mastery_paths WHERE slug = 'la-trinite';

-- Questions for Quiz: Le Père
INSERT INTO public.milestone_questions (milestone_id, type, content, difficulty, order_index)
SELECT
  pm.id,
  'multiple_choice',
  '{"question": "Selon Matthieu 6, comment Jésus nous enseigne-t-il à appeler Dieu?", "options": ["Seigneur tout-puissant", "Notre Père", "Le Très-Haut", "Le Créateur"], "correct": 1, "explanation": "Jésus nous invite à une relation intime avec Dieu en l''appelant ''Notre Père''."}'::jsonb,
  1,
  0
FROM public.path_milestones pm
JOIN public.mastery_paths mp ON pm.path_id = mp.id
WHERE mp.slug = 'la-trinite' AND pm.name = 'Quiz: Le Père';

INSERT INTO public.milestone_questions (milestone_id, type, content, difficulty, order_index)
SELECT
  pm.id,
  'true_false',
  '{"statement": "Le Père, le Fils et le Saint-Esprit sont trois dieux différents.", "correct": false, "explanation": "Non, la doctrine de la Trinité affirme un seul Dieu en trois personnes distinctes."}'::jsonb,
  1,
  1
FROM public.path_milestones pm
JOIN public.mastery_paths mp ON pm.path_id = mp.id
WHERE mp.slug = 'la-trinite' AND pm.name = 'Quiz: Le Père';

INSERT INTO public.milestone_questions (milestone_id, type, content, difficulty, order_index)
SELECT
  pm.id,
  'multiple_choice',
  '{"question": "Quel verset affirme que Dieu est amour?", "options": ["Jean 3:16", "1 Jean 4:8", "Romains 8:28", "Psaume 23:1"], "correct": 1, "explanation": "1 Jean 4:8 déclare: ''Dieu est amour'', révélant la nature même du Père."}'::jsonb,
  2,
  2
FROM public.path_milestones pm
JOIN public.mastery_paths mp ON pm.path_id = mp.id
WHERE mp.slug = 'la-trinite' AND pm.name = 'Quiz: Le Père';

-- Milestones for Canonisation de la Bible
INSERT INTO public.path_milestones (path_id, name, description, milestone_type, content, order_index, xp_reward, coin_reward, required_score)
SELECT
  id,
  'Qu''est-ce que le canon?',
  'Découvrez la signification du mot ''canon'' biblique.',
  'lesson',
  '{"title": "Le Canon des Écritures", "sections": [{"heading": "Définition du canon", "content": "Le mot ''canon'' vient du grec ''kanon'' qui signifie ''règle'' ou ''mesure''. Dans le contexte biblique, le canon désigne la liste des livres reconnus comme inspirés par Dieu et faisant autorité pour la foi et la pratique.\n\nLe canon de la Bible protestante comprend 66 livres: 39 dans l''Ancien Testament et 27 dans le Nouveau Testament."}, {"heading": "Inspiration vs Canonisation", "content": "Il est important de distinguer:\n- L''inspiration: le processus par lequel Dieu a guidé les auteurs humains\n- La canonisation: le processus par lequel l''Église a reconnu quels livres étaient inspirés\n\nL''Église n''a pas ''créé'' le canon, elle l''a ''reconnu''. Les livres étaient déjà inspirés; l''Église a simplement discerné lesquels l''étaient."}]}'::jsonb,
  0,
  30,
  15,
  70
FROM public.mastery_paths WHERE slug = 'canonisation-bible';

INSERT INTO public.path_milestones (path_id, name, description, milestone_type, content, order_index, xp_reward, coin_reward, required_score)
SELECT
  id,
  'L''Ancien Testament',
  'Comment l''AT a été compilé.',
  'lesson',
  '{"title": "Formation de l''Ancien Testament", "sections": [{"heading": "Les trois divisions", "content": "La Bible hébraïque (Tanakh) est divisée en trois parties:\n1. La Torah (Loi): Genèse à Deutéronome\n2. Les Neviim (Prophètes): Josué à Malachie\n3. Les Ketouvim (Écrits): Psaumes, Proverbes, etc.\n\nJésus lui-même a fait référence à cette division en parlant de ''la loi de Moïse, les prophètes et les psaumes'' (Luc 24:44)."}, {"heading": "Reconnaissance progressive", "content": "La Torah a été reconnue très tôt, dès l''époque de Moïse. Les prophètes ont été ajoutés au fur et à mesure de leur ministère. Les Écrits ont été les derniers à être formellement reconnus.\n\nVers 400 av. J.-C., le canon de l''AT était essentiellement fixé, comme en témoignent les écrits de l''historien Josèphe."}]}'::jsonb,
  1,
  30,
  15,
  70
FROM public.mastery_paths WHERE slug = 'canonisation-bible';

INSERT INTO public.path_milestones (path_id, name, description, milestone_type, content, order_index, xp_reward, coin_reward, required_score)
SELECT
  id,
  'Le Nouveau Testament',
  'La formation du canon du NT.',
  'lesson',
  '{"title": "Formation du Nouveau Testament", "sections": [{"heading": "Critères de canonicité", "content": "L''Église primitive a utilisé plusieurs critères pour reconnaître les écrits inspirés:\n1. Apostolicité: écrit par un apôtre ou un proche collaborateur\n2. Orthodoxie: cohérence avec l''enseignement apostolique\n3. Catholicité: acceptation universelle par les églises\n4. Usage liturgique: utilisation dans le culte"}, {"heading": "Étapes clés", "content": "- Vers 100 ap. J.-C.: Les épîtres de Paul et les Évangiles circulent largement\n- 367 ap. J.-C.: La lettre festale d''Athanase liste nos 27 livres actuels\n- 397 ap. J.-C.: Le Concile de Carthage confirme officiellement le canon\n\nCes conciles n''ont pas ''décidé'' du canon, ils ont reconnu ce que l''Église utilisait déjà."}]}'::jsonb,
  2,
  30,
  15,
  70
FROM public.mastery_paths WHERE slug = 'canonisation-bible';

INSERT INTO public.path_milestones (path_id, name, description, milestone_type, content, order_index, xp_reward, coin_reward, required_score)
SELECT
  id,
  'Quiz sur le canon',
  'Testez vos connaissances sur la canonisation.',
  'quiz',
  '{}'::jsonb,
  3,
  45,
  25,
  70
FROM public.mastery_paths WHERE slug = 'canonisation-bible';

-- Questions for Quiz sur le canon
INSERT INTO public.milestone_questions (milestone_id, type, content, difficulty, order_index)
SELECT
  pm.id,
  'multiple_choice',
  '{"question": "Combien de livres contient le Nouveau Testament?", "options": ["22", "24", "27", "30"], "correct": 2, "explanation": "Le Nouveau Testament contient 27 livres, des Évangiles à l''Apocalypse."}'::jsonb,
  1,
  0
FROM public.path_milestones pm
JOIN public.mastery_paths mp ON pm.path_id = mp.id
WHERE mp.slug = 'canonisation-bible' AND pm.name = 'Quiz sur le canon';

INSERT INTO public.milestone_questions (milestone_id, type, content, difficulty, order_index)
SELECT
  pm.id,
  'true_false',
  '{"statement": "Les conciles de l''Église ont créé le canon biblique.", "correct": false, "explanation": "Les conciles ont reconnu et confirmé le canon, ils ne l''ont pas créé. Les livres étaient déjà utilisés par les églises."}'::jsonb,
  2,
  1
FROM public.path_milestones pm
JOIN public.mastery_paths mp ON pm.path_id = mp.id
WHERE mp.slug = 'canonisation-bible' AND pm.name = 'Quiz sur le canon';

INSERT INTO public.milestone_questions (milestone_id, type, content, difficulty, order_index)
SELECT
  pm.id,
  'multiple_choice',
  '{"question": "Comment s''appelle la Bible hébraïque?", "options": ["Septante", "Vulgate", "Tanakh", "Peshitta"], "correct": 2, "explanation": "La Tanakh est l''acronyme des trois divisions de la Bible hébraïque: Torah, Neviim, Ketouvim."}'::jsonb,
  2,
  2
FROM public.path_milestones pm
JOIN public.mastery_paths mp ON pm.path_id = mp.id
WHERE mp.slug = 'canonisation-bible' AND pm.name = 'Quiz sur le canon';

-- Milestones for Histoire de l'Église
INSERT INTO public.path_milestones (path_id, name, description, milestone_type, content, order_index, xp_reward, coin_reward, required_score)
SELECT
  id,
  'L''Église primitive',
  'Les débuts de l''Église après la Pentecôte.',
  'lesson',
  '{"title": "Les premiers chrétiens", "sections": [{"heading": "La Pentecôte: naissance de l''Église", "content": "Cinquante jours après la résurrection de Jésus, le Saint-Esprit est descendu sur les disciples réunis à Jérusalem (Actes 2). Ce jour-là, environ 3000 personnes se sont converties après le sermon de Pierre.\n\nC''est le début officiel de l''Église chrétienne."}, {"heading": "Caractéristiques de l''Église primitive", "content": "Les premiers chrétiens étaient caractérisés par:\n- L''enseignement des apôtres\n- La communion fraternelle\n- Le partage du pain (la Cène)\n- Les prières\n- Le partage des biens\n- La joie et la simplicité de coeur\n\n(Actes 2:42-47)"}]}'::jsonb,
  0,
  25,
  10,
  70
FROM public.mastery_paths WHERE slug = 'histoire-eglise';

INSERT INTO public.path_milestones (path_id, name, description, milestone_type, content, order_index, xp_reward, coin_reward, required_score)
SELECT
  id,
  'Les persécutions',
  'L''Église sous l''Empire romain.',
  'reading',
  '{"title": "Témoins jusqu''au sang", "reference": "Apocalypse 2:10", "text": "Ne crains pas ce que tu vas souffrir. Voici, le diable jettera quelques-uns de vous en prison, afin que vous soyez éprouvés, et vous aurez une tribulation de dix jours. Sois fidèle jusqu''à la mort, et je te donnerai la couronne de vie.", "questions": ["Pourquoi les chrétiens étaient-ils persécutés par Rome?", "Qu''est-ce qui a permis à l''Église de croître malgré les persécutions?", "Que pouvons-nous apprendre des martyrs chrétiens?"]}'::jsonb,
  1,
  25,
  10,
  70
FROM public.mastery_paths WHERE slug = 'histoire-eglise';

INSERT INTO public.path_milestones (path_id, name, description, milestone_type, content, order_index, xp_reward, coin_reward, required_score)
SELECT
  id,
  'Constantin et après',
  'Le christianisme devient religion officielle.',
  'lesson',
  '{"title": "L''édit de Milan (313)", "sections": [{"heading": "Un tournant historique", "content": "En 313, l''empereur Constantin promulgue l''édit de Milan qui accorde la liberté de culte aux chrétiens. Plus tard, en 380, Théodose Ier fait du christianisme la religion officielle de l''Empire romain.\n\nC''est un changement radical: de religion persécutée, le christianisme devient religion d''État."}, {"heading": "Bénédictions et défis", "content": "Cette nouvelle position apporta:\n\nAvantages:\n- Fin des persécutions\n- Construction d''églises\n- Développement de la théologie\n\nDéfis:\n- Conversions superficielles\n- Mélange avec la politique\n- Corruption de certaines pratiques"}]}'::jsonb,
  2,
  25,
  10,
  70
FROM public.mastery_paths WHERE slug = 'histoire-eglise';

INSERT INTO public.path_milestones (path_id, name, description, milestone_type, content, order_index, xp_reward, coin_reward, required_score)
SELECT
  id,
  'La Réforme',
  'Le retour aux Écritures au 16e siècle.',
  'lesson',
  '{"title": "Les réformateurs", "sections": [{"heading": "Martin Luther (1483-1546)", "content": "Le 31 octobre 1517, Luther affiche ses 95 thèses contre la vente des indulgences. C''est le début de la Réforme protestante.\n\nSes convictions clés:\n- Sola Scriptura (l''Écriture seule)\n- Sola Fide (la foi seule)\n- Sola Gratia (la grâce seule)\n- Solus Christus (Christ seul)\n- Soli Deo Gloria (à Dieu seul la gloire)"}, {"heading": "Impact durable", "content": "La Réforme a eu des conséquences majeures:\n- Traduction de la Bible en langues vernaculaires\n- Accent sur l''éducation biblique\n- Réformes dans l''Église catholique (Contre-Réforme)\n- Naissance de diverses dénominations protestantes"}]}'::jsonb,
  3,
  30,
  15,
  70
FROM public.mastery_paths WHERE slug = 'histoire-eglise';

INSERT INTO public.path_milestones (path_id, name, description, milestone_type, content, order_index, xp_reward, coin_reward, required_score)
SELECT
  id,
  'Quiz: Histoire',
  'Testez vos connaissances historiques.',
  'quiz',
  '{}'::jsonb,
  4,
  40,
  20,
  70
FROM public.mastery_paths WHERE slug = 'histoire-eglise';

-- Questions for Quiz Histoire
INSERT INTO public.milestone_questions (milestone_id, type, content, difficulty, order_index)
SELECT
  pm.id,
  'multiple_choice',
  '{"question": "Quel événement marque le début de l''Église chrétienne?", "options": ["La crucifixion", "La résurrection", "La Pentecôte", "L''ascension"], "correct": 2, "explanation": "La Pentecôte, avec la descente du Saint-Esprit sur les disciples, marque officiellement le début de l''Église."}'::jsonb,
  1,
  0
FROM public.path_milestones pm
JOIN public.mastery_paths mp ON pm.path_id = mp.id
WHERE mp.slug = 'histoire-eglise' AND pm.name = 'Quiz: Histoire';

INSERT INTO public.milestone_questions (milestone_id, type, content, difficulty, order_index)
SELECT
  pm.id,
  'multiple_choice',
  '{"question": "En quelle année Luther a-t-il affiché ses 95 thèses?", "options": ["1453", "1492", "1517", "1611"], "correct": 2, "explanation": "Martin Luther a affiché ses 95 thèses le 31 octobre 1517, date considérée comme le début de la Réforme protestante."}'::jsonb,
  1,
  1
FROM public.path_milestones pm
JOIN public.mastery_paths mp ON pm.path_id = mp.id
WHERE mp.slug = 'histoire-eglise' AND pm.name = 'Quiz: Histoire';

INSERT INTO public.milestone_questions (milestone_id, type, content, difficulty, order_index)
SELECT
  pm.id,
  'true_false',
  '{"statement": "L''édit de Milan a été promulgué par l''empereur Théodose.", "correct": false, "explanation": "L''édit de Milan (313) a été promulgué par Constantin. Théodose a fait du christianisme la religion officielle en 380."}'::jsonb,
  2,
  2
FROM public.path_milestones pm
JOIN public.mastery_paths mp ON pm.path_id = mp.id
WHERE mp.slug = 'histoire-eglise' AND pm.name = 'Quiz: Histoire';
