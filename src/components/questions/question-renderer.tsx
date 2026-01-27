"use client";

import { QuestionType, QuestionContent } from "@/types";
import { MultipleChoice } from "./multiple-choice";
import { TrueFalse } from "./true-false";
import { FillBlank } from "./fill-blank";
import { Matching } from "./matching";
import { Ordering } from "./ordering";
import { Typing } from "./typing";
import { Timed } from "./timed";
import { ImageQuestion } from "./image-question";

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
          content={content as Parameters<typeof MultipleChoice>[0]["content"]}
          onAnswer={onAnswer}
          disabled={disabled}
        />
      );
    case "true_false":
      return (
        <TrueFalse
          content={content as Parameters<typeof TrueFalse>[0]["content"]}
          onAnswer={onAnswer}
          disabled={disabled}
        />
      );
    case "fill_blank":
      return (
        <FillBlank
          content={content as Parameters<typeof FillBlank>[0]["content"]}
          onAnswer={onAnswer}
          disabled={disabled}
        />
      );
    case "matching":
      return (
        <Matching
          content={content as Parameters<typeof Matching>[0]["content"]}
          onAnswer={onAnswer}
          disabled={disabled}
        />
      );
    case "ordering":
      return (
        <Ordering
          content={content as Parameters<typeof Ordering>[0]["content"]}
          onAnswer={onAnswer}
          disabled={disabled}
        />
      );
    case "typing":
      return (
        <Typing
          content={content as Parameters<typeof Typing>[0]["content"]}
          onAnswer={onAnswer}
          disabled={disabled}
        />
      );
    case "timed":
      return (
        <Timed
          content={content as Parameters<typeof Timed>[0]["content"]}
          onAnswer={onAnswer}
          disabled={disabled}
        />
      );
    case "image":
      return (
        <ImageQuestion
          content={content as Parameters<typeof ImageQuestion>[0]["content"]}
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
