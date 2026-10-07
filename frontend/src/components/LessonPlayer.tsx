'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import confetti from 'canvas-confetti';
import { X, Heart, Check, Flame, Trophy, Sparkles, AlertCircle, ArrowRight } from 'lucide-react';
import { LessonDetail, Exercise, User } from '@/types';
import { playCorrectSound, playWrongSound, playTapSound, playVictorySound } from '@/lib/sound';
import { completeLesson, refillHearts } from '@/lib/api';

import { MultipleChoice } from './exercises/MultipleChoice';
import { TranslateWordBank } from './exercises/TranslateWordBank';
import { MatchPairs } from './exercises/MatchPairs';
import { FillBlank } from './exercises/FillBlank';
import { TypeAnswer } from './exercises/TypeAnswer';
import { DuoMascot } from './DuoMascot';

interface LessonPlayerProps {
  lesson: LessonDetail;
  initialUser: User;
}

type FeedbackStatus = 'idle' | 'correct' | 'incorrect' | 'completed';

export const LessonPlayer: React.FC<LessonPlayerProps> = ({ lesson, initialUser }) => {
  const router = useRouter();

  // Exercise queue (Duolingo appends missed exercises to end of queue!)
  const [exerciseQueue, setExerciseQueue] = useState<Exercise[]>(lesson.exercises);
  const [currentIndex, setCurrentIndex] = useState(0);

  // User state during lesson
  const [hearts, setHearts] = useState(initialUser.hearts);
  const [mistakesCount, setMistakesCount] = useState(0);
  const [combo, setCombo] = useState(0);

  // Answer tracking
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [feedbackStatus, setFeedbackStatus] = useState<FeedbackStatus>('idle');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modals
  const [showQuitModal, setShowQuitModal] = useState(false);
  const [showOutOfHeartsModal, setShowOutOfHeartsModal] = useState(false);

  // Completion results
  const [summaryData, setSummaryData] = useState<{
    xpGained: number;
    accuracy: number;
    newStreak: number;
    leveledUp: boolean;
  } | null>(null);

  const currentExercise = exerciseQueue[currentIndex];
  const totalOriginal = lesson.exercises.length;
  const progressRatio = Math.min(1, currentIndex / totalOriginal);

  // Clean strings for lenient comparison
  const normalizeText = (str: string) => {
    return str
      .toLowerCase()
      .replace(/[¿¡?!.,;:"]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  };

  // Check answer logic
  const handleCheck = useCallback(() => {
    if (!currentExercise || feedbackStatus !== 'idle') return;

    let isCorrect = false;

    if (currentExercise.type === 'match_pairs') {
      // For match pairs, completion callback triggers correct directly
      isCorrect = true;
    } else {
      const userAns = normalizeText(currentAnswer);
      const targetAns = normalizeText(currentExercise.correct_answer);
      isCorrect = userAns === targetAns;
    }

    if (isCorrect) {
      playCorrectSound();
      setFeedbackStatus('correct');
      setCombo(prev => prev + 1);
    } else {
      playWrongSound();
      setFeedbackStatus('incorrect');
      setMistakesCount(prev => prev + 1);
      setCombo(0);

      const nextHearts = Math.max(0, hearts - 1);
      setHearts(nextHearts);

      // Duolingo appends missed question to end of lesson to repeat
      setExerciseQueue(prev => [...prev, currentExercise]);

      if (nextHearts === 0) {
        setShowOutOfHeartsModal(true);
      }
    }
  }, [currentExercise, currentAnswer, feedbackStatus, hearts]);

  // Advance to next exercise
  const handleContinue = useCallback(async () => {
    playTapSound();

    if (currentIndex + 1 < exerciseQueue.length && hearts > 0) {
      setCurrentIndex(prev => prev + 1);
      setCurrentAnswer('');
      setFeedbackStatus('idle');
    } else if (hearts > 0) {
      // Completed all exercises!
      setIsSubmitting(true);
      const accuracy = Math.max(0, Math.round(((totalOriginal - mistakesCount) / totalOriginal) * 100));

      try {
        const res = await completeLesson(lesson.id, {
          accuracy,
          hearts_lost: initialUser.hearts - hearts,
          mistakes_count: mistakesCount,
        });

        setSummaryData({
          xpGained: res.xp_gained,
          accuracy,
          newStreak: res.streak,
          leveledUp: res.leveled_up,
        });
        setFeedbackStatus('completed');
        playVictorySound();

        // Launch celebratory confetti fireworks
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (err) {
        console.error('Failed to submit lesson:', err);
        // Fallback for demo
        setSummaryData({
          xpGained: lesson.xp_reward,
          accuracy,
          newStreak: initialUser.streak + 1,
          leveledUp: false,
        });
        setFeedbackStatus('completed');
        playVictorySound();
      } finally {
        setIsSubmitting(false);
      }
    }
  }, [currentIndex, exerciseQueue.length, hearts, initialUser, lesson, mistakesCount, totalOriginal]);

  // Global Enter Key to Check or Continue
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        if (feedbackStatus === 'idle' && (currentAnswer.trim() || currentExercise?.type === 'match_pairs')) {
          e.preventDefault();
          handleCheck();
        } else if (feedbackStatus === 'correct' || feedbackStatus === 'incorrect') {
          e.preventDefault();
          handleContinue();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [feedbackStatus, currentAnswer, currentExercise, handleCheck, handleContinue]);

  // Match pairs complete handler
  const handleMatchPairsComplete = () => {
    playCorrectSound();
    setFeedbackStatus('correct');
    setCombo(prev => prev + 1);
  };

  // Refill hearts during out-of-hearts modal
  const handleRefillAndResume = async () => {
    try {
      await refillHearts();
      setHearts(5);
      setShowOutOfHeartsModal(false);
      setFeedbackStatus('idle');
    } catch (e) {
      console.error(e);
      setHearts(5);
      setShowOutOfHeartsModal(false);
    }
  };

  // Render Lesson Complete Victory Screen
  if (feedbackStatus === 'completed' && summaryData) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center select-none animate-in fade-in duration-300">
        <DuoMascot mood="celebrating" size={160} className="mb-6" />

        <h1 className="text-3xl sm:text-4xl font-black text-[#58cc02] mb-1">
          Lesson Complete!
        </h1>
        <p className="text-sm font-bold text-gray-500 mb-8">
          You made great progress today. Keep the momentum going!
        </p>

        {/* 3 Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-lg w-full mb-8">
          {/* XP Card */}
          <div className="p-4 rounded-3xl border-2 border-amber-300 bg-amber-50 flex flex-col items-center">
            <span className="text-xs font-black text-amber-700 uppercase tracking-wider mb-1">
              TOTAL XP
            </span>
            <div className="flex items-center gap-1.5 text-2xl font-black text-amber-600">
              <Sparkles className="w-6 h-6 fill-amber-500" />
              <span>+{summaryData.xpGained}</span>
            </div>
          </div>

          {/* Accuracy Card */}
          <div className="p-4 rounded-3xl border-2 border-emerald-300 bg-emerald-50 flex flex-col items-center">
            <span className="text-xs font-black text-emerald-700 uppercase tracking-wider mb-1">
              ACCURACY
            </span>
            <div className="flex items-center gap-1.5 text-2xl font-black text-emerald-600">
              <Trophy className="w-6 h-6 fill-emerald-500" />
              <span>{summaryData.accuracy}%</span>
            </div>
          </div>

          {/* Streak Card */}
          <div className="p-4 rounded-3xl border-2 border-orange-300 bg-orange-50 flex flex-col items-center">
            <span className="text-xs font-black text-orange-700 uppercase tracking-wider mb-1">
              STREAK
            </span>
            <div className="flex items-center gap-1.5 text-2xl font-black text-orange-600">
              <Flame className="w-6 h-6 fill-orange-500" />
              <span>{summaryData.newStreak} Days</span>
            </div>
          </div>
        </div>

        {summaryData.leveledUp && (
          <div className="mb-6 p-4 rounded-2xl bg-amber-100 border border-amber-300 text-amber-900 font-extrabold text-sm max-w-md w-full animate-bounce">
            🎉 Crown Level Up! You unlocked the next skill on your learning path!
          </div>
        )}

        <button
          onClick={() => {
            playTapSound();
            router.push('/');
          }}
          className="max-w-md w-full py-4 rounded-2xl bg-[#58cc02] text-white font-black text-base uppercase tracking-wider border-b-6 border-[#46a302] hover:brightness-105 active:translate-y-1 active:border-b-0 shadow-lg transition"
        >
          CONTINUE
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col justify-between">
      {/* Top Header: Close Button, Progress Bar, Hearts */}
      <header className="max-w-4xl w-full mx-auto px-4 py-6 flex items-center justify-between gap-4">
        {/* Close Button */}
        <button
          onClick={() => {
            playTapSound();
            setShowQuitModal(true);
          }}
          className="text-gray-400 hover:text-gray-600 p-1"
          title="Quit Lesson"
        >
          <X className="w-7 h-7 stroke-[3]" />
        </button>

        {/* Animated Progress Bar */}
        <div className="flex-1 h-4 bg-gray-200 rounded-full overflow-hidden relative">
          <div
            className="h-full bg-[#58cc02] rounded-full transition-all duration-300 ease-out"
            style={{ width: `${Math.round(progressRatio * 100)}%` }}
          />
        </div>

        {/* Combo flame indicator */}
        {combo >= 2 && (
          <div className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-full bg-orange-100 text-orange-600 font-black text-xs animate-pulse">
            <Flame className="w-4 h-4 fill-orange-500" />
            <span>{combo} COMBO</span>
          </div>
        )}

        {/* Hearts Indicator */}
        <div className="flex items-center gap-1.5 shrink-0">
          <Heart
            className={`w-7 h-7 ${
              hearts === 0 ? 'text-gray-300 fill-gray-300' : 'text-rose-500 fill-rose-500'
            } ${feedbackStatus === 'incorrect' ? 'animate-bounce' : ''}`}
          />
          <span className="text-base font-black text-rose-500">{hearts}</span>
        </div>
      </header>

      {/* Main Exercise Area */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-8 flex flex-col justify-center items-center">
        {currentExercise && (
          <>
            {currentExercise.type === 'multiple_choice' && (
              <MultipleChoice
                exercise={currentExercise}
                selectedAnswer={currentAnswer}
                onSelect={setCurrentAnswer}
                disabled={feedbackStatus !== 'idle'}
              />
            )}

            {currentExercise.type === 'translate' && (
              <TranslateWordBank
                exercise={currentExercise}
                onAnswerChange={setCurrentAnswer}
                disabled={feedbackStatus !== 'idle'}
              />
            )}

            {currentExercise.type === 'match_pairs' && (
              <MatchPairs
                exercise={currentExercise}
                onComplete={handleMatchPairsComplete}
                disabled={feedbackStatus !== 'idle'}
              />
            )}

            {currentExercise.type === 'fill_blank' && (
              <FillBlank
                exercise={currentExercise}
                selectedAnswer={currentAnswer}
                onSelect={setCurrentAnswer}
                disabled={feedbackStatus !== 'idle'}
              />
            )}

            {currentExercise.type === 'type_answer' && (
              <TypeAnswer
                exercise={currentExercise}
                answerText={currentAnswer}
                onTextChange={setCurrentAnswer}
                onSubmit={handleCheck}
                disabled={feedbackStatus !== 'idle'}
              />
            )}
          </>
        )}
      </main>

      {/* Bottom Sliding Feedback Bar */}
      <footer
        className={`w-full py-5 px-6 border-t-2 transition-all duration-200 select-none ${
          feedbackStatus === 'correct'
            ? 'bg-[#d7ffb8] border-[#b8f28b] text-[#58a700]'
            : feedbackStatus === 'incorrect'
            ? 'bg-[#ffdfe0] border-[#ffb8ba] text-[#ea2b2b]'
            : 'bg-white border-gray-200 text-gray-800'
        }`}
      >
        <div className="max-w-4xl w-full mx-auto flex items-center justify-between flex-wrap gap-4">
          {/* Feedback Message */}
          <div className="flex items-center gap-4">
            {feedbackStatus === 'correct' && (
              <>
                <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center text-[#58cc02] shadow-sm">
                  <Check className="w-9 h-9 stroke-[4]" />
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-black text-[#58a700]">
                    Nicely done!
                  </h3>
                  <p className="text-xs sm:text-sm font-bold text-[#58a700]/90">
                    {combo >= 3 ? `${combo} in a row! Amazing!` : 'Great job!'}
                  </p>
                </div>
              </>
            )}

            {feedbackStatus === 'incorrect' && (
              <>
                <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center text-[#ea2b2b] shadow-sm">
                  <X className="w-9 h-9 stroke-[4]" />
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-black text-[#ea2b2b]">
                    Incorrect
                  </h3>
                  <p className="text-xs sm:text-sm font-bold text-gray-700">
                    Correct solution:{' '}
                    <span className="font-black text-black">
                      {currentExercise?.correct_answer}
                    </span>
                  </p>
                  {currentExercise?.explanation && (
                    <p className="text-xs font-semibold text-gray-500 mt-0.5">
                      {currentExercise.explanation}
                    </p>
                  )}
                </div>
              </>
            )}

            {feedbackStatus === 'idle' && (
              <div className="hidden sm:block text-xs font-bold text-gray-400">
                Press Enter ↵ to check your answer
              </div>
            )}
          </div>

          {/* Action Button: Check vs Continue */}
          <div>
            {feedbackStatus === 'idle' ? (
              <button
                onClick={handleCheck}
                disabled={!currentAnswer.trim() && currentExercise?.type !== 'match_pairs'}
                className="py-3.5 px-8 rounded-2xl bg-[#58cc02] text-white font-extrabold text-sm uppercase tracking-wider border-b-4 border-[#46a302] hover:brightness-105 active:translate-y-1 active:border-b-0 disabled:bg-gray-200 disabled:border-gray-300 disabled:text-gray-400 disabled:cursor-not-allowed shadow-md transition"
              >
                CHECK
              </button>
            ) : (
              <button
                onClick={handleContinue}
                disabled={isSubmitting}
                className={`py-3.5 px-8 rounded-2xl text-white font-extrabold text-sm uppercase tracking-wider border-b-4 hover:brightness-105 active:translate-y-1 active:border-b-0 shadow-md transition ${
                  feedbackStatus === 'correct'
                    ? 'bg-[#58cc02] border-[#46a302]'
                    : 'bg-[#ea2b2b] border-[#ba1b1b]'
                }`}
              >
                {isSubmitting ? 'SAVING...' : 'CONTINUE'}
              </button>
            )}
          </div>
        </div>
      </footer>

      {/* Quit Lesson Confirmation Modal */}
      {showQuitModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border-2 border-gray-200 text-center animate-in zoom-in-95">
            <div className="w-16 h-16 mx-auto mb-3 bg-amber-100 rounded-full flex items-center justify-center">
              <AlertCircle className="w-9 h-9 text-amber-500" />
            </div>

            <h3 className="text-2xl font-black text-gray-800 mb-1">Quit Lesson?</h3>
            <p className="text-sm font-medium text-gray-500 mb-6">
              All progress in this lesson will be lost if you leave now.
            </p>

            <div className="flex flex-col gap-2.5">
              <button
                onClick={() => setShowQuitModal(false)}
                className="w-full py-3.5 rounded-2xl bg-[#58cc02] text-white font-black text-xs uppercase tracking-wider border-b-4 border-[#46a302] active:translate-y-0.5 hover:brightness-105"
              >
                KEEP LEARNING
              </button>
              <button
                onClick={() => router.push('/')}
                className="w-full py-3.5 rounded-2xl bg-gray-100 text-gray-500 font-black text-xs uppercase tracking-wider hover:bg-gray-200 transition"
              >
                END SESSION
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Out of Hearts Modal */}
      {showOutOfHeartsModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border-2 border-gray-200 text-center animate-in zoom-in-95">
            <DuoMascot mood="crying" size={90} className="mx-auto mb-3" />

            <h3 className="text-2xl font-black text-rose-500 mb-1">Out of Hearts!</h3>
            <p className="text-xs font-bold text-gray-500 mb-5">
              You need hearts to continue this lesson. Refill your hearts or practice to earn more!
            </p>

            <div className="flex flex-col gap-2.5">
              <button
                onClick={handleRefillAndResume}
                className="w-full py-3.5 rounded-2xl bg-[#58cc02] text-white font-black text-xs uppercase tracking-wider border-b-4 border-[#46a302] active:translate-y-0.5 hover:brightness-105"
              >
                REFILL HEARTS & RESUME (FREE)
              </button>
              <button
                onClick={() => router.push('/practice')}
                className="w-full py-3.5 rounded-2xl bg-[#1cb0f6] text-white font-black text-xs uppercase tracking-wider border-b-4 border-[#1899d6] active:translate-y-0.5 hover:brightness-105"
              >
                PRACTICE TO EARN HEARTS
              </button>
              <button
                onClick={() => router.push('/')}
                className="w-full py-3 rounded-2xl text-gray-400 font-black text-xs uppercase tracking-wider hover:text-gray-600 transition"
              >
                END LESSON
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
