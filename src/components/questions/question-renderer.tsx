"use client";

import dynamic from "next/dynamic";
import {
  QuestionType,
  QuestionContent,
  MultipleChoiceContent,
  TrueFalseContent,
  FillBlankContent,
  MatchingContent,
  OrderingContent,
  TypingContent,
  TimedContent,
  ImageContent,
} from "@/types";

// Dynamic imports - bundle-dynamic-imports rule
// Only load the question type component that's actually needed
const MultipleChoice = dynamic(() => import("./multiple-choice").then((m) => m.MultipleChoice));
const TrueFalse = dynamic(() => import("./true-false").then((m) => m.TrueFalse));
const FillBlank = dynamic(() => import("./fill-blank").then((m) => m.FillBlank));
const Matching = dynamic(() => import("./matching").then((m) => m.Matching));
const Ordering = dynamic(() => import("./ordering").then((m) => m.Ordering));
const Typing = dynamic(() => import("./typing").then((m) => m.Typing));
const Timed = dynamic(() => import("./timed").then((m) => m.Timed));
const ImageQuestion = dynamic(() => import("./image-question").then((m) => m.ImageQuestion));

interface QuestionRendererProps {
  type: QuestionType;
  content: QuestionContent;
  onAnswer: (correct: boolean) => void;
  disabled?: boolean;
}

export function QuestionRenderer({
  type,
  content,
  onAnswer,
  disabled,
}: QuestionRendererProps) {
  switch (type) {
    case "multiple_choice":
      return (
        <MultipleChoice
          content={content as MultipleChoiceContent}
          onAnswer={onAnswer}
          disabled={disabled}
        />
      );
    case "true_false":
      return (
        <TrueFalse
          content={content as TrueFalseContent}
          onAnswer={onAnswer}
          disabled={disabled}
        />
      );
    case "fill_blank":
      return (
        <FillBlank
          content={content as FillBlankContent}
          onAnswer={onAnswer}
          disabled={disabled}
        />
      );
    case "matching":
      return (
        <Matching
          content={content as MatchingContent}
          onAnswer={onAnswer}
          disabled={disabled}
        />
      );
    case "ordering":
      return (
        <Ordering
          content={content as OrderingContent}
          onAnswer={onAnswer}
          disabled={disabled}
        />
      );
    case "typing":
      return (
        <Typing
          content={content as TypingContent}
          onAnswer={onAnswer}
          disabled={disabled}
        />
      );
    case "timed":
      return (
        <Timed
          content={content as TimedContent}
          onAnswer={onAnswer}
          disabled={disabled}
        />
      );
    case "image":
      return (
        <ImageQuestion
          content={content as ImageContent}
          onAnswer={onAnswer}
          disabled={disabled}
        />
      );
    default:
      return (
        <div className="text-center text-gray-500">
          Type de question non supporté
        </div>
      );
  }
}
