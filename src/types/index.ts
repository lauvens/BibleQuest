export * from "./database";

// Question content types
export interface MultipleChoiceContent {
  question: string;
  options: string[];
  correct: number;
}

export interface TrueFalseContent {
  statement: string;
  correct: boolean;
}

export interface FillBlankContent {
  verse: string;
  answer: string;
  reference: string;
}

export interface MatchingContent {
  pairs: { left: string; right: string }[];
}

export interface OrderingContent {
  prompt: string;
  items: string[];
  correct_order: number[];
}

export interface TypingContent {
  prompt: string;
  reference: string;
  text: string;
}

export interface TimedContent {
  time_limit: number;
  question: QuestionContent;
}

export interface ImageContent {
  image_url: string;
  question: string;
  options: string[];
  correct: number;
}

export type QuestionContent =
  | MultipleChoiceContent
  | TrueFalseContent
  | FillBlankContent
  | MatchingContent
  | OrderingContent
  | TypingContent
  | TimedContent
  | ImageContent;

// User state for Zustand
export interface UserState {
  id: string | null;
  email: string | null;
  username: string | null;
  avatarUrl: string | null;
  xp: number;
  level: number;
  coins: number;
  gems: number;
  hearts: number;
  heartsUpdatedAt: Date;
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string | null;
  role: "user" | "admin";
  isGuest: boolean;
}

// Guest progress for localStorage
export interface GuestProgress {
  lessonProgress: Record<string, { completed: boolean; bestScore: number }>;
  xp: number;
  currentStreak: number;
  lastActivityDate: string | null;
}
