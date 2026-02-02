# Engaging Quiz System

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Rendre les quiz plus engageants avec combo system, time bonus, feedback satisfaisant, et explications.

**Architecture:** Créer un contexte de quiz partagé, des composants de feedback, et mettre à jour les questions pour supporter les explications.

**Tech Stack:** React Context, Framer Motion, Web Audio API, Vibration API

---

## Système de Points Amélioré

### Calcul des points:
```
Base: 10 points par question correcte
Time Bonus: +5 points si répondu en < 5 secondes
Combo Multiplier:
  - 2 correct = x1.5
  - 3 correct = x2
  - 4 correct = x2.5
  - 5+ correct = x3

Points = (Base + TimeBonus) * ComboMultiplier
```

---

## Phase 1: Quiz Context & State

### Task 1: Create QuizContext for shared state

**Files:**
- Create: `src/lib/contexts/quiz-context.tsx`

```tsx
"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";

interface QuizState {
  combo: number;
  maxCombo: number;
  totalPoints: number;
  timeStarted: number | null;
  questionsAnswered: number;
  correctAnswers: number;
}

interface QuizContextType extends QuizState {
  startQuestion: () => void;
  answerQuestion: (correct: boolean, basePoints?: number) => {
    pointsEarned: number;
    timeBonus: number;
    comboMultiplier: number;
  };
  resetQuiz: () => void;
}

const QuizContext = createContext<QuizContextType | null>(null);

export function QuizProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<QuizState>({
    combo: 0,
    maxCombo: 0,
    totalPoints: 0,
    timeStarted: null,
    questionsAnswered: 0,
    correctAnswers: 0,
  });

  const startQuestion = useCallback(() => {
    setState((prev) => ({ ...prev, timeStarted: Date.now() }));
  }, []);

  const getComboMultiplier = (combo: number) => {
    if (combo >= 5) return 3;
    if (combo >= 4) return 2.5;
    if (combo >= 3) return 2;
    if (combo >= 2) return 1.5;
    return 1;
  };

  const answerQuestion = useCallback((correct: boolean, basePoints = 10) => {
    const timeElapsed = state.timeStarted ? (Date.now() - state.timeStarted) / 1000 : 10;
    const timeBonus = timeElapsed < 5 ? 5 : timeElapsed < 10 ? 2 : 0;

    let pointsEarned = 0;
    let comboMultiplier = 1;
    let newCombo = 0;

    if (correct) {
      newCombo = state.combo + 1;
      comboMultiplier = getComboMultiplier(newCombo);
      pointsEarned = Math.round((basePoints + timeBonus) * comboMultiplier);
    }

    setState((prev) => ({
      ...prev,
      combo: newCombo,
      maxCombo: Math.max(prev.maxCombo, newCombo),
      totalPoints: prev.totalPoints + pointsEarned,
      questionsAnswered: prev.questionsAnswered + 1,
      correctAnswers: prev.correctAnswers + (correct ? 1 : 0),
      timeStarted: null,
    }));

    return { pointsEarned, timeBonus, comboMultiplier };
  }, [state.combo, state.timeStarted]);

  const resetQuiz = useCallback(() => {
    setState({
      combo: 0,
      maxCombo: 0,
      totalPoints: 0,
      timeStarted: null,
      questionsAnswered: 0,
      correctAnswers: 0,
    });
  }, []);

  return (
    <QuizContext.Provider value={{ ...state, startQuestion, answerQuestion, resetQuiz }}>
      {children}
    </QuizContext.Provider>
  );
}

export function useQuiz() {
  const context = useContext(QuizContext);
  if (!context) {
    throw new Error("useQuiz must be used within a QuizProvider");
  }
  return context;
}
```

**Commit:**
```bash
git add src/lib/contexts/quiz-context.tsx
git commit -m "feat: add QuizContext for combo and points system"
```

---

## Phase 2: Sound & Haptic Feedback

### Task 2: Create feedback utilities

**Files:**
- Create: `src/lib/feedback.ts`

```typescript
// Sound effects using Web Audio API
const audioContext = typeof window !== "undefined" ? new (window.AudioContext || (window as any).webkitAudioContext)() : null;

function playTone(frequency: number, duration: number, type: OscillatorType = "sine") {
  if (!audioContext) return;

  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  oscillator.frequency.value = frequency;
  oscillator.type = type;

  gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);

  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + duration);
}

export function playCorrectSound() {
  // Pleasant rising chord
  playTone(523.25, 0.15); // C5
  setTimeout(() => playTone(659.25, 0.15), 50); // E5
  setTimeout(() => playTone(783.99, 0.2), 100); // G5
}

export function playWrongSound() {
  // Descending buzz
  playTone(200, 0.3, "sawtooth");
}

export function playComboSound(combo: number) {
  // Higher pitch for higher combo
  const baseFreq = 400 + (combo * 50);
  playTone(baseFreq, 0.1);
  setTimeout(() => playTone(baseFreq * 1.5, 0.15), 50);
}

export function playLevelUpSound() {
  // Celebratory arpeggio
  const notes = [523.25, 659.25, 783.99, 1046.50];
  notes.forEach((freq, i) => {
    setTimeout(() => playTone(freq, 0.2), i * 100);
  });
}

// Haptic feedback
export function vibrate(pattern: number | number[]) {
  if (typeof navigator !== "undefined" && navigator.vibrate) {
    navigator.vibrate(pattern);
  }
}

export function vibrateCorrect() {
  vibrate(50);
}

export function vibrateWrong() {
  vibrate([100, 50, 100]);
}

export function vibrateCombo() {
  vibrate([30, 30, 30]);
}
```

**Commit:**
```bash
git add src/lib/feedback.ts
git commit -m "feat: add sound and haptic feedback utilities"
```

---

## Phase 3: Animated Feedback Components

### Task 3: Create floating points animation

**Files:**
- Create: `src/components/quiz/floating-points.tsx`

```tsx
"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

interface FloatingPoint {
  id: number;
  value: number;
  x: number;
  y: number;
  isBonus?: boolean;
}

interface FloatingPointsProps {
  points: FloatingPoint[];
}

export function FloatingPoints({ points }: FloatingPointsProps) {
  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      <AnimatePresence>
        {points.map((point) => (
          <motion.div
            key={point.id}
            initial={{ opacity: 1, y: point.y, x: point.x, scale: 0.5 }}
            animate={{ opacity: 0, y: point.y - 100, scale: 1.2 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className={`absolute text-2xl font-bold ${
              point.isBonus ? "text-gold-400" : "text-accent-400"
            }`}
          >
            +{point.value}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

// Hook to manage floating points
export function useFloatingPoints() {
  const [points, setPoints] = useState<FloatingPoint[]>([]);
  let idCounter = 0;

  const addPoint = (value: number, x: number, y: number, isBonus = false) => {
    const id = idCounter++;
    setPoints((prev) => [...prev, { id, value, x, y, isBonus }]);

    // Remove after animation
    setTimeout(() => {
      setPoints((prev) => prev.filter((p) => p.id !== id));
    }, 1000);
  };

  return { points, addPoint };
}
```

**Commit:**
```bash
git add src/components/quiz/floating-points.tsx
git commit -m "feat: add FloatingPoints animation component"
```

---

### Task 4: Create combo display component

**Files:**
- Create: `src/components/quiz/combo-display.tsx`

```tsx
"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Flame, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface ComboDisplayProps {
  combo: number;
  className?: string;
}

export function ComboDisplay({ combo, className }: ComboDisplayProps) {
  const getComboColor = () => {
    if (combo >= 5) return "text-error-500";
    if (combo >= 3) return "text-gold-500";
    if (combo >= 2) return "text-accent-500";
    return "text-primary-400";
  };

  const getMultiplier = () => {
    if (combo >= 5) return "x3";
    if (combo >= 4) return "x2.5";
    if (combo >= 3) return "x2";
    if (combo >= 2) return "x1.5";
    return "";
  };

  return (
    <AnimatePresence mode="wait">
      {combo >= 2 && (
        <motion.div
          key={combo}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 1.5, opacity: 0 }}
          className={cn("flex items-center gap-2", className)}
        >
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 0.5,
              repeat: Infinity,
            }}
          >
            {combo >= 5 ? (
              <Zap className={cn("w-6 h-6 fill-current", getComboColor())} />
            ) : (
              <Flame className={cn("w-6 h-6 fill-current", getComboColor())} />
            )}
          </motion.div>
          <div className="text-center">
            <motion.p
              key={`combo-${combo}`}
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className={cn("text-2xl font-bold", getComboColor())}
            >
              {combo}
            </motion.p>
            <p className="text-xs font-semibold text-primary-400">
              COMBO {getMultiplier()}
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

**Commit:**
```bash
git add src/components/quiz/combo-display.tsx
git commit -m "feat: add ComboDisplay component with animations"
```

---

### Task 5: Create answer result overlay

**Files:**
- Create: `src/components/quiz/answer-result.tsx`

```tsx
"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Check, X, Clock, Flame, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

interface AnswerResultProps {
  isVisible: boolean;
  isCorrect: boolean;
  pointsEarned?: number;
  timeBonus?: number;
  comboMultiplier?: number;
  explanation?: string;
  verseReference?: string;
  onContinue: () => void;
}

export function AnswerResult({
  isVisible,
  isCorrect,
  pointsEarned = 0,
  timeBonus = 0,
  comboMultiplier = 1,
  explanation,
  verseReference,
  onContinue,
}: AnswerResultProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-40 flex items-end justify-center p-4 bg-gradient-to-t from-black/50 to-transparent"
          onClick={onContinue}
        >
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: "spring", damping: 20 }}
            className={cn(
              "w-full max-w-lg rounded-t-3xl p-6 shadow-elevated",
              isCorrect
                ? "bg-gradient-to-br from-accent-50 to-accent-100 dark:from-accent-900/50 dark:to-accent-800/50"
                : "bg-gradient-to-br from-error-50 to-error-100 dark:from-error-900/50 dark:to-error-800/50"
            )}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center gap-4 mb-4">
              <div className={cn(
                "w-14 h-14 rounded-full flex items-center justify-center",
                isCorrect ? "bg-accent-400" : "bg-error-400"
              )}>
                {isCorrect ? (
                  <Check className="w-8 h-8 text-white" />
                ) : (
                  <X className="w-8 h-8 text-white" />
                )}
              </div>
              <div>
                <h3 className={cn(
                  "text-xl font-bold",
                  isCorrect ? "text-accent-700 dark:text-accent-300" : "text-error-700 dark:text-error-300"
                )}>
                  {isCorrect ? "Correct!" : "Incorrect"}
                </h3>
                {isCorrect && pointsEarned > 0 && (
                  <div className="flex items-center gap-3 text-sm">
                    <span className="font-semibold text-accent-600 dark:text-accent-400">
                      +{pointsEarned} pts
                    </span>
                    {timeBonus > 0 && (
                      <span className="flex items-center gap-1 text-gold-600 dark:text-gold-400">
                        <Clock className="w-3 h-3" />
                        +{timeBonus}
                      </span>
                    )}
                    {comboMultiplier > 1 && (
                      <span className="flex items-center gap-1 text-error-500">
                        <Flame className="w-3 h-3 fill-current" />
                        x{comboMultiplier}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Explanation */}
            {explanation && (
              <div className="mb-4 p-4 rounded-xl bg-white/50 dark:bg-primary-800/50">
                <p className="text-primary-700 dark:text-parchment-100">
                  {explanation}
                </p>
              </div>
            )}

            {/* Verse reference */}
            {verseReference && (
              <div className="flex items-center gap-2 text-sm text-primary-500 dark:text-primary-400 mb-4">
                <BookOpen className="w-4 h-4" />
                <span>{verseReference}</span>
              </div>
            )}

            {/* Continue button */}
            <button
              onClick={onContinue}
              className={cn(
                "w-full py-4 rounded-xl font-bold text-white transition-colors",
                isCorrect
                  ? "bg-accent-500 hover:bg-accent-600"
                  : "bg-error-500 hover:bg-error-600"
              )}
            >
              Continuer
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

**Commit:**
```bash
git add src/components/quiz/answer-result.tsx
git commit -m "feat: add AnswerResult overlay with points breakdown"
```

---

## Phase 4: Update Question Components

### Task 6: Create enhanced question wrapper

**Files:**
- Create: `src/components/quiz/quiz-question.tsx`

This wraps any question type and adds:
- Timer display
- Combo display
- Floating points
- Answer result overlay
- Sound/haptic feedback

```tsx
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { Clock } from "lucide-react";
import { QuestionRenderer } from "@/components/questions/question-renderer";
import { ComboDisplay } from "./combo-display";
import { AnswerResult } from "./answer-result";
import { FloatingPoints, useFloatingPoints } from "./floating-points";
import { useQuiz } from "@/lib/contexts/quiz-context";
import {
  playCorrectSound,
  playWrongSound,
  playComboSound,
  vibrateCorrect,
  vibrateWrong,
  vibrateCombo
} from "@/lib/feedback";
import { fireGoldConfetti } from "@/lib/confetti";
import { QuestionType, QuestionContent } from "@/types";
import { cn } from "@/lib/utils";

interface QuizQuestionProps {
  type: QuestionType;
  content: QuestionContent & {
    explanation?: string;
    verse_reference?: string;
  };
  onComplete: (correct: boolean, points: number) => void;
  questionNumber: number;
  totalQuestions: number;
}

export function QuizQuestion({
  type,
  content,
  onComplete,
  questionNumber,
  totalQuestions,
}: QuizQuestionProps) {
  const { combo, startQuestion, answerQuestion } = useQuiz();
  const { points: floatingPoints, addPoint } = useFloatingPoints();
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [lastResult, setLastResult] = useState<{
    correct: boolean;
    points: number;
    timeBonus: number;
    multiplier: number;
  } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Start timer when question mounts
  useEffect(() => {
    startQuestion();
    setTimeElapsed(0);
    setShowResult(false);
    setLastResult(null);

    const interval = setInterval(() => {
      setTimeElapsed((prev) => prev + 0.1);
    }, 100);

    return () => clearInterval(interval);
  }, [questionNumber, startQuestion]);

  const handleAnswer = useCallback((correct: boolean) => {
    const result = answerQuestion(correct);

    // Feedback
    if (correct) {
      playCorrectSound();
      vibrateCorrect();

      if (result.comboMultiplier > 1) {
        playComboSound(combo + 1);
        vibrateCombo();
      }

      if (combo + 1 >= 5) {
        fireGoldConfetti();
      }

      // Floating points at center of screen
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        addPoint(result.pointsEarned, rect.width / 2, rect.height / 2);
        if (result.timeBonus > 0) {
          setTimeout(() => {
            addPoint(result.timeBonus, rect.width / 2 + 50, rect.height / 2, true);
          }, 200);
        }
      }
    } else {
      playWrongSound();
      vibrateWrong();
    }

    setLastResult({
      correct,
      points: result.pointsEarned,
      timeBonus: result.timeBonus,
      multiplier: result.comboMultiplier,
    });
    setShowResult(true);
  }, [answerQuestion, combo, addPoint]);

  const handleContinue = () => {
    setShowResult(false);
    onComplete(lastResult?.correct ?? false, lastResult?.points ?? 0);
  };

  const getTimerColor = () => {
    if (timeElapsed < 5) return "text-accent-500";
    if (timeElapsed < 10) return "text-gold-500";
    return "text-error-500";
  };

  return (
    <div ref={containerRef} className="relative">
      {/* Header with timer and combo */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <span className="text-sm text-primary-400">
            {questionNumber}/{totalQuestions}
          </span>
        </div>

        <div className="flex items-center gap-4">
          {/* Timer */}
          <div className={cn("flex items-center gap-1", getTimerColor())}>
            <Clock className="w-4 h-4" />
            <span className="font-mono font-semibold">
              {timeElapsed.toFixed(1)}s
            </span>
          </div>

          {/* Combo */}
          <ComboDisplay combo={combo} />
        </div>
      </div>

      {/* Question */}
      <motion.div
        key={questionNumber}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        <QuestionRenderer
          type={type}
          content={content}
          onAnswer={handleAnswer}
          disabled={showResult}
        />
      </motion.div>

      {/* Floating points */}
      <FloatingPoints points={floatingPoints} />

      {/* Answer result overlay */}
      <AnswerResult
        isVisible={showResult}
        isCorrect={lastResult?.correct ?? false}
        pointsEarned={lastResult?.points}
        timeBonus={lastResult?.timeBonus}
        comboMultiplier={lastResult?.multiplier}
        explanation={content.explanation}
        verseReference={content.verse_reference}
        onContinue={handleContinue}
      />
    </div>
  );
}
```

**Commit:**
```bash
git add src/components/quiz/quiz-question.tsx
git commit -m "feat: add QuizQuestion wrapper with full feedback system"
```

---

## Phase 5: Update Défi Page

### Task 7: Integrate new quiz system into défi page

**Files:**
- Modify: `src/app/(main)/defi/page.tsx`

1. Wrap with QuizProvider
2. Replace QuestionRenderer with QuizQuestion
3. Show total points at end
4. Update header with combo display

---

## Phase 6: Update Question Types

### Task 8: Add explanation field to question content types

**Files:**
- Modify: `src/types/index.ts`

Add `explanation?: string` and `verse_reference?: string` to all question content types.

---

## Summary

| Fichier | Description |
|---------|-------------|
| `src/lib/contexts/quiz-context.tsx` | Context pour combo, points, temps |
| `src/lib/feedback.ts` | Sons et vibrations |
| `src/components/quiz/floating-points.tsx` | Animation points flottants |
| `src/components/quiz/combo-display.tsx` | Affichage combo avec flammes |
| `src/components/quiz/answer-result.tsx` | Overlay résultat avec explication |
| `src/components/quiz/quiz-question.tsx` | Wrapper complet pour questions |

## Résultat attendu

1. **Réponse correcte:**
   - Son satisfaisant (ding)
   - Vibration courte
   - Points flottants (+10, +5 bonus temps)
   - Combo qui monte avec flammes
   - Confetti à 5+ combo
   - Overlay avec explication

2. **Réponse incorrecte:**
   - Son buzz
   - Vibration double
   - Combo reset
   - Overlay avec bonne réponse
