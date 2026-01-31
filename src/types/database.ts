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
        };
        Insert: {
          id?: string;
          translation: string;
          book: string;
          chapter: number;
          verse: number;
          text: string;
        };
        Update: {
          id?: string;
          translation?: string;
          book?: string;
          chapter?: number;
          verse?: number;
          text?: string;
        };
      };
      user_verses: {
        Row: {
          id: string;
          user_id: string;
          verse_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          verse_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          verse_id?: string;
          created_at?: string;
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
    };
  };
}
