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
    let pointsEarned = 0;
    let timeBonus = 0;
    let comboMultiplier = 1;
    let newCombo = 0;

    setState((prev) => {
      const timeElapsed = prev.timeStarted ? (Date.now() - prev.timeStarted) / 1000 : 10;
      timeBonus = timeElapsed < 5 ? 5 : timeElapsed < 10 ? 2 : 0;

      if (correct) {
        newCombo = prev.combo + 1;
        comboMultiplier = getComboMultiplier(newCombo);
        pointsEarned = Math.round((basePoints + timeBonus) * comboMultiplier);
      }

      return {
        ...prev,
        combo: newCombo,
        maxCombo: Math.max(prev.maxCombo, newCombo),
        totalPoints: prev.totalPoints + pointsEarned,
        questionsAnswered: prev.questionsAnswered + 1,
        correctAnswers: prev.correctAnswers + (correct ? 1 : 0),
        timeStarted: null,
      };
    });

    return { pointsEarned, timeBonus, comboMultiplier };
  }, []);

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
