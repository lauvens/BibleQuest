"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  HelpCircle,
  BookText,
  MessageSquare,
  Trophy,
  ChevronRight,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/ui/progress-bar";
import { HeartsDisplay } from "@/components/game/hearts-display";
import { QuizQuestion } from "@/components/quiz/quiz-question";
import { CelebrationModal } from "@/components/ui/celebration-modal";
import { QuizProvider, useQuiz } from "@/lib/contexts/quiz-context";
import { useUserStore } from "@/lib/store/user-store";
import { QuestionType, QuestionContent } from "@/types";
import { Database, MilestoneType, Json } from "@/types/database";
import {
  getMilestoneQuestions,
  saveMilestoneProgress,
  updatePathProgress,
  updateUserStats,
  startPath,
} from "@/lib/supabase/queries";

type Milestone = Database["public"]["Tables"]["path_milestones"]["Row"];

interface LoadedQuestion {
  type: QuestionType;
  content: QuestionContent;
}

interface MilestoneContentProps {
  milestone: Milestone;
  pathSlug: string;
  pathId: string;
  pathColor: string;
  pathName: string;
  nextMilestoneId: string | null;
  milestoneIndex: number;
  totalMilestones: number;
}

// Lesson content type
interface LessonContent {
  title?: string;
  sections?: {
    heading?: string;
    content: string;
  }[];
}

// Reading content type
interface ReadingContent {
  title?: string;
  reference?: string;
  text?: string;
  questions?: string[];
}

// Reflection content type
interface ReflectionContent {
  prompt?: string;
  questions?: string[];
  scripture?: string;
}

function LessonView({ content, onComplete }: { content: LessonContent; onComplete: () => void }) {
  const [currentSection, setCurrentSection] = useState(0);
  const sections = content.sections || [];
  const totalSections = sections.length;

  const handleNext = () => {
    if (currentSection < totalSections - 1) {
      setCurrentSection((prev) => prev + 1);
    } else {
      onComplete();
    }
  };

  if (totalSections === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-primary-500 dark:text-primary-400 mb-4">
          Contenu de la lecon non disponible.
        </p>
        <Button onClick={onComplete}>Marquer comme termine</Button>
      </div>
    );
  }

  const section = sections[currentSection];

  return (
    <div>
      {content.title && (
        <h2 className="text-xl font-bold text-primary-800 dark:text-parchment-50 mb-6">
          {content.title}
        </h2>
      )}

      <div className="mb-6">
        <ProgressBar value={((currentSection + 1) / totalSections) * 100} max={100} className="h-2 mb-2" />
        <p className="text-xs text-primary-500 dark:text-primary-400 text-right">
          Section {currentSection + 1}/{totalSections}
        </p>
      </div>

      <Card className="mb-6">
        <CardContent className="p-6">
          {section.heading && (
            <h3 className="text-lg font-semibold text-primary-800 dark:text-parchment-50 mb-4">
              {section.heading}
            </h3>
          )}
          <div className="prose dark:prose-invert max-w-none text-primary-700 dark:text-primary-300">
            {section.content.split("\n").map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
          </div>
        </CardContent>
      </Card>

      <Button onClick={handleNext} className="w-full" size="lg">
        {currentSection < totalSections - 1 ? (
          <>
            Continuer
            <ChevronRight className="w-5 h-5 ml-2" />
          </>
        ) : (
          "Terminer la lecon"
        )}
      </Button>
    </div>
  );
}

function ReadingView({ content, onComplete }: { content: ReadingContent; onComplete: () => void }) {
  return (
    <div>
      {content.title && (
        <h2 className="text-xl font-bold text-primary-800 dark:text-parchment-50 mb-2">
          {content.title}
        </h2>
      )}
      {content.reference && (
        <p className="text-accent-600 dark:text-accent-400 font-medium mb-6">
          {content.reference}
        </p>
      )}

      <Card className="mb-6">
        <CardContent className="p-6">
          {content.text && (
            <div className="prose dark:prose-invert max-w-none text-primary-700 dark:text-primary-300 italic">
              {content.text.split("\n").map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {content.questions && content.questions.length > 0 && (
        <div className="mb-6">
          <h3 className="font-semibold text-primary-800 dark:text-parchment-50 mb-3">
            Questions de reflexion:
          </h3>
          <ul className="space-y-2">
            {content.questions.map((q, i) => (
              <li key={i} className="flex items-start gap-2 text-primary-600 dark:text-primary-400">
                <span className="text-accent-500 font-bold">{i + 1}.</span>
                {q}
              </li>
            ))}
          </ul>
        </div>
      )}

      <Button onClick={onComplete} className="w-full" size="lg">
        J&apos;ai termine la lecture
      </Button>
    </div>
  );
}

function ReflectionView({ content, onComplete }: { content: ReflectionContent; onComplete: () => void }) {
  return (
    <div>
      {content.scripture && (
        <Card className="mb-6 bg-accent-50 dark:bg-accent-900/20 border-accent-200 dark:border-accent-800">
          <CardContent className="p-6">
            <div className="prose dark:prose-invert max-w-none text-primary-700 dark:text-primary-300 italic">
              {content.scripture}
            </div>
          </CardContent>
        </Card>
      )}

      {content.prompt && (
        <div className="mb-6">
          <h3 className="font-semibold text-primary-800 dark:text-parchment-50 mb-3">
            Reflexion:
          </h3>
          <p className="text-primary-600 dark:text-primary-400">
            {content.prompt}
          </p>
        </div>
      )}

      {content.questions && content.questions.length > 0 && (
        <div className="mb-6">
          <h3 className="font-semibold text-primary-800 dark:text-parchment-50 mb-3">
            Prenez le temps de mediter sur ces questions:
          </h3>
          <ul className="space-y-3">
            {content.questions.map((q, i) => (
              <li key={i} className="p-4 bg-parchment-100 dark:bg-primary-850 rounded-xl text-primary-700 dark:text-primary-300">
                {q}
              </li>
            ))}
          </ul>
        </div>
      )}

      <Button onClick={onComplete} className="w-full" size="lg">
        J&apos;ai termine ma reflexion
      </Button>
    </div>
  );
}

function QuizView({
  milestoneId,
  requiredScore,
  xpReward,
  coinReward,
  pathSlug,
  nextMilestoneId,
  onComplete,
}: {
  milestoneId: string;
  requiredScore: number;
  xpReward: number;
  coinReward: number;
  pathSlug: string;
  nextMilestoneId: string | null;
  onComplete: (score: number) => void;
}) {
  const router = useRouter();
  const { getActualHearts, loseHeart } = useUserStore();
  const { totalPoints, correctAnswers, resetQuiz } = useQuiz();

  const [questions, setQuestions] = useState<LoadedQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [started, setStarted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  const hearts = getActualHearts();

  useEffect(() => {
    setLoading(true);
    getMilestoneQuestions(milestoneId)
      .then((qs) => {
        setQuestions(
          qs.map((q) => ({
            type: q.type as QuestionType,
            content: q.content as unknown as QuestionContent,
          }))
        );
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [milestoneId]);

  const handleStart = () => {
    resetQuiz();
    setStarted(true);
  };

  const handleQuestionComplete = (correct: boolean) => {
    if (!correct) {
      loseHeart();
    }

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      const finalScore = Math.round((correctAnswers / questions.length) * 100);
      const passed = finalScore >= requiredScore;

      if (passed) {
        setShowCelebration(true);
      }
      setIsComplete(true);
      onComplete(finalScore);
    }
  };

  const finalScore = questions.length > 0 ? Math.round((correctAnswers / questions.length) * 100) : 0;
  const passed = finalScore >= requiredScore;
  const progress = questions.length > 0 ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0;

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-error-600 dark:text-error-400 mb-4">Erreur de chargement du quiz.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center py-8 text-primary-500 dark:text-primary-400">
        Chargement du quiz...
      </div>
    );
  }

  if (!started) {
    return (
      <div className="text-center">
        <div className="w-20 h-20 rounded-full bg-accent-100 dark:bg-accent-900/30 flex items-center justify-center mx-auto mb-4">
          <HelpCircle className="w-10 h-10 text-accent-600 dark:text-accent-400" />
        </div>
        <h2 className="text-xl font-bold text-primary-800 dark:text-parchment-50 mb-2">
          Quiz - {questions.length} questions
        </h2>
        <p className="text-primary-600 dark:text-primary-400 mb-6">
          Score requis: {requiredScore}%
        </p>

        <div className="flex items-center justify-center gap-2 mb-6">
          <span className="text-primary-600 dark:text-primary-400">Vos coeurs:</span>
          <HeartsDisplay hearts={hearts} />
        </div>

        <Button
          onClick={handleStart}
          disabled={hearts <= 0}
          className="w-full"
          size="lg"
        >
          {hearts <= 0 ? "Pas assez de coeurs" : "Commencer le quiz"}
        </Button>
      </div>
    );
  }

  if (isComplete) {
    return (
      <div className="text-center">
        <CelebrationModal
          isOpen={showCelebration}
          onClose={() => setShowCelebration(false)}
          type="achievement"
          title="Quiz reussi!"
          description={`${finalScore}% correct - ${totalPoints} points`}
          reward={{ xp: xpReward, coins: coinReward }}
        />

        <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${passed ? "bg-success-100 dark:bg-success-900/30" : "bg-error-100 dark:bg-error-900/30"}`}>
          <Trophy className={`w-10 h-10 ${passed ? "text-success-600 dark:text-success-400" : "text-error-600 dark:text-error-400"}`} />
        </div>

        <h2 className="text-xl font-bold text-primary-800 dark:text-parchment-50 mb-2">
          {passed ? "Quiz reussi!" : "Quiz echoue"}
        </h2>
        <p className="text-primary-600 dark:text-primary-400 mb-2">
          {finalScore}% de bonnes reponses
        </p>
        <p className="text-sm text-primary-500 dark:text-primary-500 mb-6">
          Score requis: {requiredScore}%
        </p>

        {passed ? (
          <div className="space-y-3">
            <div className="flex items-center justify-center gap-6 p-4 bg-success-50 dark:bg-success-900/20 rounded-xl">
              <div className="text-center">
                <p className="text-2xl font-bold text-success-600 dark:text-success-400">+{xpReward}</p>
                <p className="text-sm text-primary-400">XP</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gold-500">+{coinReward}</p>
                <p className="text-sm text-primary-400">Pieces</p>
              </div>
            </div>

            {nextMilestoneId ? (
              <Button
                onClick={() => router.push(`/parcours/${pathSlug}/${nextMilestoneId}`)}
                className="w-full"
                size="lg"
              >
                Etape suivante
                <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={() => router.push(`/parcours/${pathSlug}`)}
                className="w-full"
                size="lg"
              >
                Retour au parcours
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <Button
              onClick={() => {
                setStarted(false);
                setCurrentQuestionIndex(0);
                setIsComplete(false);
              }}
              className="w-full"
              size="lg"
            >
              Reessayer
            </Button>
            <Button
              onClick={() => router.push(`/parcours/${pathSlug}`)}
              variant="outline"
              className="w-full"
            >
              Retour au parcours
            </Button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-primary-500 dark:text-primary-400">
            Question {currentQuestionIndex + 1}/{questions.length}
          </span>
          <HeartsDisplay hearts={hearts} />
        </div>
        <ProgressBar value={progress} max={100} className="h-2" />
      </div>

      <Card>
        <CardContent className="p-6">
          {questions[currentQuestionIndex] && (
            <QuizQuestion
              key={currentQuestionIndex}
              type={questions[currentQuestionIndex].type}
              content={questions[currentQuestionIndex].content}
              onComplete={handleQuestionComplete}
              questionNumber={currentQuestionIndex + 1}
              totalQuestions={questions.length}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function MilestoneContentInner({
  milestone,
  pathSlug,
  pathId,
  pathColor,
  pathName,
  nextMilestoneId,
  milestoneIndex,
  totalMilestones,
}: MilestoneContentProps) {
  const router = useRouter();
  const { id: userId, isGuest, addXp, addCoins, updateGuestMilestoneProgress } = useUserStore();

  const [completed, setCompleted] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  const milestoneTypeIcons: Record<MilestoneType, React.ComponentType<{ className?: string }>> = {
    lesson: BookOpen,
    quiz: HelpCircle,
    reading: BookText,
    reflection: MessageSquare,
  };

  const Icon = milestoneTypeIcons[milestone.milestone_type];

  const handleComplete = async (score: number = 100) => {
    const passed = score >= milestone.required_score;

    if (!passed) return;

    // Add rewards
    addXp(milestone.xp_reward);
    addCoins(milestone.coin_reward);

    // Save progress
    if (isGuest) {
      updateGuestMilestoneProgress(milestone.id, score, true);
    } else if (userId) {
      try {
        await startPath(userId, pathId);
        await saveMilestoneProgress(userId, milestone.id, score, true);
        await updatePathProgress(
          userId,
          pathId,
          milestoneIndex + 1,
          milestoneIndex + 1 >= totalMilestones
        );
        await updateUserStats(userId, milestone.xp_reward, milestone.coin_reward);
      } catch (error) {
        console.error("Failed to save progress:", error);
      }
    }

    setCompleted(true);
    setShowCelebration(true);
  };

  const handleContinue = () => {
    if (nextMilestoneId) {
      router.push(`/parcours/${pathSlug}/${nextMilestoneId}`);
    } else {
      router.push(`/parcours/${pathSlug}`);
    }
  };

  // Render completed state for non-quiz types
  if (completed && milestone.milestone_type !== "quiz") {
    return (
      <div className="text-center">
        <CelebrationModal
          isOpen={showCelebration}
          onClose={() => setShowCelebration(false)}
          type="achievement"
          title="Etape terminee!"
          description={milestone.name}
          reward={{ xp: milestone.xp_reward, coins: milestone.coin_reward }}
        />

        <div className="w-20 h-20 rounded-full bg-success-100 dark:bg-success-900/30 flex items-center justify-center mx-auto mb-4">
          <Trophy className="w-10 h-10 text-success-600 dark:text-success-400" />
        </div>

        <h2 className="text-xl font-bold text-primary-800 dark:text-parchment-50 mb-2">
          Etape terminee!
        </h2>

        <div className="flex items-center justify-center gap-6 mb-6 p-4 bg-success-50 dark:bg-success-900/20 rounded-xl">
          <div className="text-center">
            <p className="text-2xl font-bold text-success-600 dark:text-success-400">+{milestone.xp_reward}</p>
            <p className="text-sm text-primary-400">XP</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gold-500">+{milestone.coin_reward}</p>
            <p className="text-sm text-primary-400">Pieces</p>
          </div>
        </div>

        {nextMilestoneId ? (
          <Button onClick={handleContinue} className="w-full" size="lg">
            Etape suivante
            <ChevronRight className="w-5 h-5 ml-2" />
          </Button>
        ) : (
          <Button onClick={handleContinue} className="w-full" size="lg">
            Terminer le parcours
          </Button>
        )}
      </div>
    );
  }

  const content = milestone.content as Json;

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <Link
          href={`/parcours/${pathSlug}`}
          className="inline-flex items-center gap-2 text-sm text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-200 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour a {pathName}
        </Link>

        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: `${pathColor}20`, color: pathColor }}
          >
            <Icon className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-primary-800 dark:text-parchment-50">
              {milestone.name}
            </h1>
            {milestone.description && (
              <p className="text-sm text-primary-500 dark:text-primary-400">
                {milestone.description}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Content based on type */}
      {milestone.milestone_type === "lesson" && (
        <LessonView
          content={(content as LessonContent) || {}}
          onComplete={() => handleComplete(100)}
        />
      )}

      {milestone.milestone_type === "reading" && (
        <ReadingView
          content={(content as ReadingContent) || {}}
          onComplete={() => handleComplete(100)}
        />
      )}

      {milestone.milestone_type === "reflection" && (
        <ReflectionView
          content={(content as ReflectionContent) || {}}
          onComplete={() => handleComplete(100)}
        />
      )}

      {milestone.milestone_type === "quiz" && (
        <QuizView
          milestoneId={milestone.id}
          requiredScore={milestone.required_score}
          xpReward={milestone.xp_reward}
          coinReward={milestone.coin_reward}
          pathSlug={pathSlug}
          nextMilestoneId={nextMilestoneId}
          onComplete={handleComplete}
        />
      )}
    </div>
  );
}

export function MilestoneContent(props: MilestoneContentProps) {
  return (
    <QuizProvider>
      <MilestoneContentInner {...props} />
    </QuizProvider>
  );
}
