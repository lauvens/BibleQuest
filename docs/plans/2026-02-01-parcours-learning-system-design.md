# Parcours Learning System - Design Document

## Vision

Transformer l'app en plateforme d'apprentissage biblique complète combinant gamification, contenu éducatif curé, mémorisation de versets et apologétique.

## Public cible

- Âge : 16-55 ans
- Niveau : Débutants à avancés
- Objectifs utilisateurs :
  1. Apprendre la Bible (histoires, contexte, théologie)
  2. Mémoriser des versets clés
  3. Défendre sa foi (apologétique)

---

## Architecture : Parcours unifiés

Chaque parcours combine tous les types de contenu en une expérience cohérente.

### Structure d'un parcours

```
📚 Parcours : "Comprendre la Genèse"
│
├── 📖 Module 1 : La Création
│   ├── 🎬 Vidéo (YouTube embed - Bible Project, etc.)
│   ├── 📝 Résumé / Points clés
│   ├── 💭 Versets à mémoriser (Gen 1:1, Gen 1:27)
│   ├── 🎮 Quiz de validation (obligatoire pour continuer)
│   └── 🛡️ Question apologétique (optionnel)
│
├── 📖 Module 2 : Adam et Ève
│   └── (même structure)
│
└── 🏆 Récompense finale : Badge + Gemmes
```

### Progression

- **Linéaire avec validation** : Quiz obligatoire (70%+ pour passer)
- Possibilité de refaire un quiz si échec
- Les modules précédents restent accessibles pour révision

---

## Contenu

### Phase 1 : Curation externe

Pas de création de contenu original. Intégration de ressources existantes :

- **Vidéos** : YouTube embeds (Bible Project, GotQuestions, etc.)
- **Podcasts** : Liens vers Spotify/Apple Podcasts
- **Articles** : Liens vers ressources apologétiques

### Phase 2 (futur)

Création de contenu original quand les ressources le permettent.

---

## Gamification révisée

### Système de récompenses

| Action | XP | Pièces | Gemmes |
|--------|-----|--------|--------|
| Regarder une vidéo | +10 | - | - |
| Compléter un quiz | +15 | +5 | - |
| Mémoriser un verset | +20 | +10 | - |
| Répondre question apologétique | +15 | +5 | - |
| **Terminer un parcours** | +50 | +20 | +5 |
| Streak 7 jours | +30 | +15 | +2 |

### Récompenses matures (pas enfantines)

**Gratuites (pièces/gemmes) :**
- Thèmes de lecture (sombre, sépia, papyrus, minimaliste)
- Badges de progression (par livre/thème maîtrisé)
- Export d'images de versets mémorisés

**Premium / Rares (gemmes ou abonnement futur) :**
- Groupes d'étude privés (1 gratuit, plus = gemmes)
- Export PDF de toutes les notes
- Accès anticipé aux nouveaux parcours

### Ce qu'on retire/modifie

- Avatars cartoon → Remplacés par badges élégants
- Cadres dorés → Supprimés
- Titres "Prophète/Apôtre" → Remplacés par certificats de parcours

---

## Schéma de base de données

### Nouvelles tables

```sql
-- Parcours (collection de modules)
CREATE TABLE courses (
  id UUID PRIMARY KEY,
  title VARCHAR(100) NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  difficulty VARCHAR(20), -- 'beginner', 'intermediate', 'advanced'
  estimated_duration INTEGER, -- minutes
  order_index INTEGER,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Modules dans un parcours
CREATE TABLE course_modules (
  id UUID PRIMARY KEY,
  course_id UUID REFERENCES courses(id),
  title VARCHAR(100) NOT NULL,
  order_index INTEGER NOT NULL,

  -- Contenu
  video_url TEXT,           -- YouTube embed URL
  video_duration INTEGER,   -- secondes
  summary TEXT,             -- Points clés en markdown

  -- Paramètres
  quiz_required BOOLEAN DEFAULT true,
  quiz_pass_threshold INTEGER DEFAULT 70, -- pourcentage

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Versets à mémoriser par module
CREATE TABLE module_verses (
  id UUID PRIMARY KEY,
  module_id UUID REFERENCES course_modules(id),
  verse_id UUID REFERENCES bible_verses(id),
  order_index INTEGER
);

-- Questions apologétiques par module
CREATE TABLE module_apologetics (
  id UUID PRIMARY KEY,
  module_id UUID REFERENCES course_modules(id),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  source_url TEXT, -- lien vers ressource externe
  order_index INTEGER
);

-- Progression utilisateur
CREATE TABLE user_course_progress (
  user_id UUID REFERENCES auth.users(id),
  course_id UUID REFERENCES courses(id),
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  PRIMARY KEY (user_id, course_id)
);

CREATE TABLE user_module_progress (
  user_id UUID REFERENCES auth.users(id),
  module_id UUID REFERENCES course_modules(id),
  video_watched BOOLEAN DEFAULT false,
  quiz_passed BOOLEAN DEFAULT false,
  quiz_best_score INTEGER,
  verses_memorized INTEGER DEFAULT 0,
  completed_at TIMESTAMPTZ,
  PRIMARY KEY (user_id, module_id)
);

-- Thèmes de lecture (récompenses)
CREATE TABLE reading_themes (
  id VARCHAR(50) PRIMARY KEY, -- 'dark', 'sepia', 'papyrus', etc.
  name VARCHAR(50) NOT NULL,
  unlock_type VARCHAR(20), -- 'free', 'coins', 'gems', 'course_completion'
  unlock_value INTEGER,
  css_variables JSONB -- couleurs et styles
);

CREATE TABLE user_themes (
  user_id UUID REFERENCES auth.users(id),
  theme_id VARCHAR(50) REFERENCES reading_themes(id),
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, theme_id)
);

-- Groupes d'étude
CREATE TABLE study_groups (
  id UUID PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  owner_id UUID REFERENCES auth.users(id),
  course_id UUID REFERENCES courses(id), -- parcours étudié
  max_members INTEGER DEFAULT 10,
  invite_code VARCHAR(20) UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE study_group_members (
  group_id UUID REFERENCES study_groups(id),
  user_id UUID REFERENCES auth.users(id),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (group_id, user_id)
);
```

---

## Navigation UI

### Structure proposée

```
Bottom Nav (5 items max) :
├── 🏠 Accueil (parcours en cours, suggestions)
├── 📚 Parcours (liste des parcours disponibles)
├── 📖 Bible (lecteur existant)
├── 🏆 Progrès (stats, badges, versets mémorisés)
└── 👤 Profil (paramètres, thèmes, groupes)
```

### Écrans clés

1. **Liste des parcours** - Cards avec progression, difficulté, durée
2. **Détail parcours** - Modules listés, progression visuelle
3. **Module en cours** - Vidéo + résumé + quiz + versets
4. **Mémorisation** - Interface flashcard pour les versets
5. **Quiz** - Questions avant de passer au module suivant

---

## Phases d'implémentation

### Phase 1 : Fondations (MVP)
- [ ] Tables de base de données
- [ ] CRUD parcours/modules (admin)
- [ ] Affichage liste parcours
- [ ] Lecture d'un module (vidéo embed + résumé)
- [ ] Quiz de validation
- [ ] Progression utilisateur

### Phase 2 : Mémorisation
- [ ] Interface flashcard pour versets
- [ ] Tracking des versets mémorisés
- [ ] Révision espacée (spaced repetition)

### Phase 3 : Apologétique
- [ ] Questions/réponses par module
- [ ] Liens vers ressources externes

### Phase 4 : Récompenses
- [ ] Thèmes de lecture
- [ ] Badges de progression
- [ ] Refonte cosmétiques existantes

### Phase 5 : Social
- [ ] Groupes d'étude
- [ ] Partage de progression
- [ ] Défis entre amis

---

## Questions ouvertes

1. Faut-il un mode "admin" pour créer les parcours dans l'app ou via Supabase directement ?
2. Quelles vidéos/ressources utiliser pour le premier parcours pilote ?
3. L'abonnement premium est-il envisagé à terme ?

---

## Références

- The Bible Project (bibleproject.com) - Modèle d'inspiration
- Duolingo - Gamification et progression
- Anki/Quizlet - Mémorisation par répétition espacée
