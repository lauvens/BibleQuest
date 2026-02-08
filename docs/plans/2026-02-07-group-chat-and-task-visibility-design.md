# Design : Chat de groupe & Visibilité des tâches

**Date :** 2026-02-07

## Fonctionnalités

### 1. Chat de groupe (temps réel)
- Messages texte avec réponse à un message spécifique (style WhatsApp)
- Temps réel via Supabase Realtime (WebSockets)
- Nouvel onglet "Chat" dans la page groupe (3ème onglet)

### 2. Visibilité des tâches pour chefs/admins
- Liste de progression visible par les owners/admins sur chaque ChallengeCard
- Affiche qui a terminé (avec date) et qui est en attente

---

## Schema de la base de données

### Nouvelle table : `group_messages`

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | UUID, PK | Identifiant unique |
| `group_id` | UUID, FK → reading_groups | Groupe associé |
| `user_id` | UUID, FK → users | Auteur du message |
| `content` | TEXT (max 1000 car.) | Contenu du message |
| `reply_to` | UUID, FK → group_messages, nullable | Message auquel on répond |
| `created_at` | TIMESTAMPTZ | Date d'envoi |

**Politiques RLS :**
- SELECT : membres du groupe uniquement
- INSERT : membres du groupe uniquement (user_id = auth.uid())

**Index :**
- `idx_group_messages_group_created` sur (group_id, created_at DESC)
- `idx_group_messages_reply_to` sur (reply_to)

### Table existante : `challenge_progress`
Pas de modification. Données déjà suffisantes (user_id, completed, completed_at).

---

## UI : Chat de groupe

### Onglet "Chat"
- 3ème onglet dans la page `/groupes/[groupId]` (Défis | Chat | Membres)
- Zone de messages scrollable, chronologique, récents en bas
- Chaque message : avatar, nom, badge rôle (Chef/Admin), contenu, heure
- Messages de réponse : aperçu du message original au-dessus

### Barre d'envoi
- Champ texte + bouton Send, fixée en bas
- Mode réponse : barre d'aperçu au-dessus du champ avec bouton X pour annuler

### Temps réel
- Abonnement Supabase Realtime sur `group_messages` filtré par `group_id`
- Auto-scroll vers le bas (sauf si scroll vers le haut)
- Pagination : 50 derniers messages au chargement, scroll up pour charger plus

---

## UI : Visibilité des tâches

### ChallengeCard (chefs/admins uniquement)
- Bouton "Voir la progression" sous la barre de progression
- Panneau accordion avec liste des membres :
  - Avatar + nom
  - Statut : checkmark vert "Terminé" + date OU horloge grise "En attente"
  - Triés : terminés en premier (par date), puis en attente (alphabétique)

### Membres normaux
- Aucun changement, barre de progression + compteur "X/Y ont terminé" inchangés
