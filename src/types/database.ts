export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type QuestionType =
  | "multiple_choice"
  | "true_false"
  | "fill_blank"
  | "matching"
  | "ordering"
  | "typing"
  | "timed"
  | "image";

export type CosmeticType = "avatar" | "frame" | "title" | "theme";

export type UnlockType = "free" | "level" | "coins" | "gems";

export type UserRole = "user" | "admin";

export type PathDifficulty = "beginner" | "intermediate" | "advanced";

export type PathCategory = "doctrine" | "bible_study" | "characters" | "history" | "practical" | "theology";

export type MilestoneType = "lesson" | "quiz" | "reading" | "reflection";

export type GroupRole = "owner" | "admin" | "member";

export type ChallengeStatus = "active" | "completed" | "cancelled";

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          username: string | null;
          avatar_url: string | null;
          equipped_frame_id: string | null;
          equipped_title_id: string | null;
          theme: string;
          xp: number;
          level: number;
          coins: number;
          gems: number;
          hearts: number;
          hearts_updated_at: string;
          current_streak: number;
          longest_streak: number;
          last_activity_date: string | null;
          role: UserRole;
          created_at: string;
          email_notifications: boolean;
          notify_streak_danger: boolean;
          notify_achievements: boolean;
          notify_weekly_summary: boolean;
        };
        Insert: {
          id: string;
          email: string;
          username?: string | null;
          avatar_url?: string | null;
          equipped_frame_id?: string | null;
          equipped_title_id?: string | null;
          theme?: string;
          xp?: number;
          level?: number;
          coins?: number;
          gems?: number;
          hearts?: number;
          hearts_updated_at?: string;
          current_streak?: number;
          longest_streak?: number;
          last_activity_date?: string | null;
          role?: UserRole;
          created_at?: string;
          email_notifications?: boolean;
          notify_streak_danger?: boolean;
          notify_achievements?: boolean;
          notify_weekly_summary?: boolean;
        };
        Update: {
          id?: string;
          email?: string;
          username?: string | null;
          avatar_url?: string | null;
          equipped_frame_id?: string | null;
          equipped_title_id?: string | null;
          theme?: string;
          xp?: number;
          level?: number;
          coins?: number;
          gems?: number;
          hearts?: number;
          hearts_updated_at?: string;
          current_streak?: number;
          longest_streak?: number;
          last_activity_date?: string | null;
          role?: UserRole;
          created_at?: string;
          email_notifications?: boolean;
          notify_streak_danger?: boolean;
          notify_achievements?: boolean;
          notify_weekly_summary?: boolean;
        };
      };
      categories: {
        Row: {
          id: string;
          name_key: string;
          icon: string;
          color: string;
          order_index: number;
        };
        Insert: {
          id?: string;
          name_key: string;
          icon: string;
          color: string;
          order_index: number;
        };
        Update: {
          id?: string;
          name_key?: string;
          icon?: string;
          color?: string;
          order_index?: number;
        };
      };
      units: {
        Row: {
          id: string;
          category_id: string;
          name: string;
          description: string | null;
          order_index: number;
          unlock_threshold: number;
          image_url: string | null;
        };
        Insert: {
          id?: string;
          category_id: string;
          name: string;
          description?: string | null;
          order_index: number;
          unlock_threshold?: number;
          image_url?: string | null;
        };
        Update: {
          id?: string;
          category_id?: string;
          name?: string;
          description?: string | null;
          order_index?: number;
          unlock_threshold?: number;
          image_url?: string | null;
        };
      };
      lessons: {
        Row: {
          id: string;
          unit_id: string;
          name: string;
          order_index: number;
          xp_reward: number;
          coin_reward: number;
        };
        Insert: {
          id?: string;
          unit_id: string;
          name: string;
          order_index: number;
          xp_reward?: number;
          coin_reward?: number;
        };
        Update: {
          id?: string;
          unit_id?: string;
          name?: string;
          order_index?: number;
          xp_reward?: number;
          coin_reward?: number;
        };
      };
      questions: {
        Row: {
          id: string;
          lesson_id: string;
          type: QuestionType;
          content: Json;
          difficulty: number;
          is_ai_generated: boolean;
          is_approved: boolean;
        };
        Insert: {
          id?: string;
          lesson_id: string;
          type: QuestionType;
          content: Json;
          difficulty?: number;
          is_ai_generated?: boolean;
          is_approved?: boolean;
        };
        Update: {
          id?: string;
          lesson_id?: string;
          type?: QuestionType;
          content?: Json;
          difficulty?: number;
          is_ai_generated?: boolean;
          is_approved?: boolean;
        };
      };
      user_progress: {
        Row: {
          user_id: string;
          lesson_id: string;
          completed: boolean;
          best_score: number;
          attempts: number;
          last_attempt_at: string;
        };
        Insert: {
          user_id: string;
          lesson_id: string;
          completed?: boolean;
          best_score?: number;
          attempts?: number;
          last_attempt_at?: string;
        };
        Update: {
          user_id?: string;
          lesson_id?: string;
          completed?: boolean;
          best_score?: number;
          attempts?: number;
          last_attempt_at?: string;
        };
      };
      achievements: {
        Row: {
          id: string;
          name: string;
          description: string;
          icon: string;
          condition_type: string;
          condition_value: number;
          coin_reward: number;
        };
        Insert: {
          id?: string;
          name: string;
          description: string;
          icon: string;
          condition_type: string;
          condition_value: number;
          coin_reward?: number;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string;
          icon?: string;
          condition_type?: string;
          condition_value?: number;
          coin_reward?: number;
        };
      };
      user_achievements: {
        Row: {
          user_id: string;
          achievement_id: string;
          unlocked_at: string;
        };
        Insert: {
          user_id: string;
          achievement_id: string;
          unlocked_at?: string;
        };
        Update: {
          user_id?: string;
          achievement_id?: string;
          unlocked_at?: string;
        };
      };
      cosmetics: {
        Row: {
          id: string;
          type: CosmeticType;
          name: string;
          asset_url: string | null;
          unlock_type: UnlockType;
          unlock_value: number;
          is_active: boolean;
        };
        Insert: {
          id?: string;
          type: CosmeticType;
          name: string;
          asset_url?: string | null;
          unlock_type: UnlockType;
          unlock_value?: number;
          is_active?: boolean;
        };
        Update: {
          id?: string;
          type?: CosmeticType;
          name?: string;
          asset_url?: string | null;
          unlock_type?: UnlockType;
          unlock_value?: number;
          is_active?: boolean;
        };
      };
      user_cosmetics: {
        Row: {
          user_id: string;
          cosmetic_id: string;
          purchased_at: string;
          is_equipped: boolean;
        };
        Insert: {
          user_id: string;
          cosmetic_id: string;
          purchased_at?: string;
          is_equipped?: boolean;
        };
        Update: {
          user_id?: string;
          cosmetic_id?: string;
          purchased_at?: string;
          is_equipped?: boolean;
        };
      };
      bible_verses: {
        Row: {
          id: string;
          translation: string;
          book: string;
          chapter: number;
          verse: number;
          text: string;
          text_search_vector: unknown | null;
        };
        Insert: {
          id?: string;
          translation: string;
          book: string;
          chapter: number;
          verse: number;
          text: string;
          text_search_vector?: unknown | null;
        };
        Update: {
          id?: string;
          translation?: string;
          book?: string;
          chapter?: number;
          verse?: number;
          text?: string;
          text_search_vector?: unknown | null;
        };
      };
      user_verses: {
        Row: {
          id: string;
          user_id: string;
          verse_id: string;
          created_at: string;
          note: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          verse_id: string;
          created_at?: string;
          note?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          verse_id?: string;
          created_at?: string;
          note?: string | null;
        };
      };
      bible_books: {
        Row: {
          id: string;
          name: string;
          abbreviation: string;
          testament: "old" | "new";
          order_index: number;
          chapters: number;
        };
        Insert: {
          id?: string;
          name: string;
          abbreviation: string;
          testament: "old" | "new";
          order_index: number;
          chapters: number;
        };
        Update: {
          id?: string;
          name?: string;
          abbreviation?: string;
          testament?: "old" | "new";
          order_index?: number;
          chapters?: number;
        };
      };
      verse_notes: {
        Row: {
          id: string;
          user_id: string;
          verse_id: string;
          content: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          verse_id: string;
          content: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          verse_id?: string;
          content?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      verse_references: {
        Row: {
          id: string;
          user_id: string;
          source_verse_id: string;
          target_verse_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          source_verse_id: string;
          target_verse_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          source_verse_id?: string;
          target_verse_id?: string;
          created_at?: string;
        };
      };
      mastery_paths: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          icon: string;
          color: string;
          cover_image_url: string | null;
          estimated_hours: number;
          difficulty: PathDifficulty;
          category: PathCategory;
          order_index: number;
          is_published: boolean;
          is_coming_soon: boolean;
          required_path_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          icon?: string;
          color?: string;
          cover_image_url?: string | null;
          estimated_hours?: number;
          difficulty?: PathDifficulty;
          category?: PathCategory;
          order_index?: number;
          is_published?: boolean;
          is_coming_soon?: boolean;
          required_path_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          description?: string | null;
          icon?: string;
          color?: string;
          cover_image_url?: string | null;
          estimated_hours?: number;
          difficulty?: PathDifficulty;
          category?: PathCategory;
          order_index?: number;
          is_published?: boolean;
          is_coming_soon?: boolean;
          required_path_id?: string | null;
          created_at?: string;
        };
      };
      path_milestones: {
        Row: {
          id: string;
          path_id: string;
          name: string;
          description: string | null;
          milestone_type: MilestoneType;
          content: Json | null;
          order_index: number;
          xp_reward: number;
          coin_reward: number;
          required_score: number;
        };
        Insert: {
          id?: string;
          path_id: string;
          name: string;
          description?: string | null;
          milestone_type?: MilestoneType;
          content?: Json | null;
          order_index?: number;
          xp_reward?: number;
          coin_reward?: number;
          required_score?: number;
        };
        Update: {
          id?: string;
          path_id?: string;
          name?: string;
          description?: string | null;
          milestone_type?: MilestoneType;
          content?: Json | null;
          order_index?: number;
          xp_reward?: number;
          coin_reward?: number;
          required_score?: number;
        };
      };
      milestone_questions: {
        Row: {
          id: string;
          milestone_id: string;
          type: QuestionType;
          content: Json;
          difficulty: number;
          order_index: number;
        };
        Insert: {
          id?: string;
          milestone_id: string;
          type: QuestionType;
          content: Json;
          difficulty?: number;
          order_index?: number;
        };
        Update: {
          id?: string;
          milestone_id?: string;
          type?: QuestionType;
          content?: Json;
          difficulty?: number;
          order_index?: number;
        };
      };
      user_path_progress: {
        Row: {
          user_id: string;
          path_id: string;
          started_at: string;
          completed_at: string | null;
          current_milestone_index: number;
        };
        Insert: {
          user_id: string;
          path_id: string;
          started_at?: string;
          completed_at?: string | null;
          current_milestone_index?: number;
        };
        Update: {
          user_id?: string;
          path_id?: string;
          started_at?: string;
          completed_at?: string | null;
          current_milestone_index?: number;
        };
      };
      user_milestone_progress: {
        Row: {
          user_id: string;
          milestone_id: string;
          completed: boolean;
          best_score: number;
          attempts: number;
          completed_at: string | null;
        };
        Insert: {
          user_id: string;
          milestone_id: string;
          completed?: boolean;
          best_score?: number;
          attempts?: number;
          completed_at?: string | null;
        };
        Update: {
          user_id?: string;
          milestone_id?: string;
          completed?: boolean;
          best_score?: number;
          attempts?: number;
          completed_at?: string | null;
        };
      };
      reading_groups: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          cover_color: string;
          creator_id: string;
          invite_code: string;
          max_members: number;
          is_public: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          cover_color?: string;
          creator_id: string;
          invite_code?: string;
          max_members?: number;
          is_public?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          cover_color?: string;
          creator_id?: string;
          invite_code?: string;
          max_members?: number;
          is_public?: boolean;
          created_at?: string;
        };
      };
      group_members: {
        Row: {
          id: string;
          group_id: string;
          user_id: string;
          role: GroupRole;
          joined_at: string;
        };
        Insert: {
          id?: string;
          group_id: string;
          user_id: string;
          role?: GroupRole;
          joined_at?: string;
        };
        Update: {
          id?: string;
          group_id?: string;
          user_id?: string;
          role?: GroupRole;
          joined_at?: string;
        };
      };
      reading_challenges: {
        Row: {
          id: string;
          group_id: string;
          created_by: string;
          title: string;
          description: string | null;
          book_name: string;
          chapter_start: number;
          verse_start: number;
          chapter_end: number | null;
          verse_end: number | null;
          deadline: string;
          status: ChallengeStatus;
          created_at: string;
        };
        Insert: {
          id?: string;
          group_id: string;
          created_by: string;
          title: string;
          description?: string | null;
          book_name: string;
          chapter_start: number;
          verse_start?: number;
          chapter_end?: number | null;
          verse_end?: number | null;
          deadline: string;
          status?: ChallengeStatus;
          created_at?: string;
        };
        Update: {
          id?: string;
          group_id?: string;
          created_by?: string;
          title?: string;
          description?: string | null;
          book_name?: string;
          chapter_start?: number;
          verse_start?: number;
          chapter_end?: number | null;
          verse_end?: number | null;
          deadline?: string;
          status?: ChallengeStatus;
          created_at?: string;
        };
      };
      challenge_progress: {
        Row: {
          id: string;
          challenge_id: string;
          user_id: string;
          completed: boolean;
          completed_at: string | null;
          notes: string | null;
        };
        Insert: {
          id?: string;
          challenge_id: string;
          user_id: string;
          completed?: boolean;
          completed_at?: string | null;
          notes?: string | null;
        };
        Update: {
          id?: string;
          challenge_id?: string;
          user_id?: string;
          completed?: boolean;
          completed_at?: string | null;
          notes?: string | null;
        };
      };
    };
  };
}
