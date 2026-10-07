'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Heart, Sparkles, X, Check, Volume2, ArrowLeft } from 'lucide-react';
import { DuoMascot } from '@/components/DuoMascot';
import { completePractice } from '@/lib/api';
import { playCorrectSound, playWrongSound, playVictorySound, playTapSound, speakSpanish } from '@/lib/sound';
import confetti from 'canvas-confetti';

interface PracticeQuestion {
  prompt: string;
  question: string;
  options: string[];
  correct: string;
  audioText: string;
}

const practiceQuestions: PracticeQuestion[] = [
  {
    prompt: "Choose the correct translation",
    question: "How do you say 'Thank you' in Spanish?",
    options: ["Gracias", "Por favor", "De nada", "Hola"],
    correct: "Gracias",
    audioText: "Muchas gracias",
  },
  {
    prompt: "Fill in the blank",
    question: "El niño bebe ___.",
    options: ["agua", "sombrero", "manzana", "perro"],
    correct: "agua",
    audioText: "El niño bebe agua.",
  },
  {
    prompt: "Choose the correct translation",
    question: "What does 'Buenos días' mean?",
    options: ["Good morning", "Good night", "See you later", "You're welcome"],
    correct: "Good morning",
    audioText: "Buenos días",
  },
];

export default function PracticePage() {
  const router = useRouter();
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState<string | null>(null);
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [loading, setLoading] = useState(false);

  const currentQ = practiceQuestions[currentIdx];

  const handleSelect = (opt: string) => {
    if (isAnswerChecked) return;
    playTapSound();
    setSelectedOpt(opt);
  };

  const handleCheck = () => {
    if (!selectedOpt) return;
    const correct = selectedOpt.toLowerCase() === currentQ.correct.toLowerCase();
    setIsCorrect(correct);
    setIsAnswerChecked(true);

    if (correct) {
      playCorrectSound();
    } else {
      playWrongSound();
    }
  };

  const handleContinue = async () => {
    playTapSound();

    if (currentIdx + 1 < practiceQuestions.length) {
      setCurrentIdx(prev => prev + 1);
      setSelectedOpt(null);
      setIsAnswerChecked(false);
    } else {
      // Completed practice!
      try {
        setLoading(true);
        await completePractice();
        setCompleted(true);
        playVictorySound();
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.6 }
        });
      } catch (e) {
        console.error(e);
        setCompleted(true);
      } finally {
        setLoading(false);
      }
    }
  };

  if (completed) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center select-none animate-in fade-in">
        <DuoMascot mood="celebrating" size={140} className="mb-6" />
        <h1 className="text-3xl sm:text-4xl font-black text-[#58cc02] mb-2">
          Practice Complete!
        </h1>
        <p className="text-sm font-bold text-gray-500 max-w-sm mb-6">
          Great job refreshing your vocabulary. You earned hearts and XP!
        </p>

        <div className="flex gap-4 max-w-xs w-full mb-8">
          <div className="flex-1 p-4 rounded-3xl border-2 border-rose-300 bg-rose-50 flex flex-col items-center">
            <span className="text-xs font-black text-rose-700 uppercase">HEARTS</span>
            <div className="flex items-center gap-1 text-xl font-black text-rose-600 mt-1">
              <Heart className="w-5 h-5 fill-rose-500" />
              <span>+1 Restored</span>
            </div>
          </div>
          <div className="flex-1 p-4 rounded-3xl border-2 border-amber-300 bg-amber-50 flex flex-col items-center">
            <span className="text-xs font-black text-amber-700 uppercase">XP</span>
            <div className="flex items-center gap-1 text-xl font-black text-amber-600 mt-1">
              <Sparkles className="w-5 h-5 fill-amber-500" />
              <span>+10 XP</span>
            </div>
          </div>
        </div>

        <button
          onClick={() => router.push('/')}
          className="max-w-xs w-full py-4 rounded-2xl bg-[#58cc02] text-white font-black text-xs uppercase tracking-wider border-b-6 border-[#46a302] hover:brightness-105 active:translate-y-1 active:border-b-0 shadow-md"
        >
          RETURN HOME
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col justify-between select-none">
      {/* Top Header */}
      <header className="max-w-2xl w-full mx-auto px-4 py-6 flex items-center justify-between gap-4">
        <button
          onClick={() => router.push('/')}
          className="text-gray-400 hover:text-gray-600"
          title="Back to Learn"
        >
          <X className="w-7 h-7 stroke-[3]" />
        </button>

        {/* Practice Progress Bar */}
        <div className="flex-1 h-3.5 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#1cb0f6] rounded-full transition-all duration-300"
            style={{ width: `${((currentIdx) / practiceQuestions.length) * 100}%` }}
          />
        </div>

        <div className="flex items-center gap-1 text-rose-500 font-black text-xs bg-rose-50 px-3 py-1.5 rounded-full border border-rose-200">
          <Heart className="w-4 h-4 fill-rose-500" />
          <span>Practice Mode</span>
        </div>
      </header>

      {/* Main Question Area */}
      <main className="flex-1 max-w-xl w-full mx-auto px-4 py-8 flex flex-col justify-center items-center">
        <div className="w-full flex items-center justify-between mb-4">
          <h2 className="text-2xl sm:text-3xl font-black text-gray-800 leading-tight">
            {currentQ.prompt}
          </h2>
          <button
            onClick={() => speakSpanish(currentQ.audioText)}
            className="p-3 bg-[#1cb0f6] text-white rounded-2xl hover:brightness-105 active:translate-y-0.5 border-b-3 border-[#1899d6]"
          >
            <Volume2 className="w-5 h-5" />
          </button>
        </div>

        <div className="w-full p-6 bg-white border-2 border-gray-200 rounded-3xl shadow-xs mb-6 text-xl sm:text-2xl font-black text-gray-800">
          {currentQ.question}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 w-full">
          {currentQ.options.map((opt, idx) => {
            const isSelected = selectedOpt === opt;
            return (
              <button
                key={idx}
                disabled={isAnswerChecked}
                onClick={() => handleSelect(opt)}
                className={`p-4 rounded-2xl border-2 font-black text-lg transition duration-150 text-center ${
                  isSelected
                    ? 'border-[#1cb0f6] bg-[#ddf4ff] text-[#1cb0f6] border-b-6 translate-y-[-2px]'
                    : 'border-gray-200 bg-white text-gray-700 border-b-4 hover:bg-gray-50 active:translate-y-0.5'
                }`}
              >
                {opt}
              </button>
            );
          })}
        </div>
      </main>

      {/* Feedback Bar */}
      <footer
        className={`w-full py-5 px-6 border-t-2 transition-all ${
          isAnswerChecked
            ? isCorrect
              ? 'bg-[#d7ffb8] border-[#b8f28b] text-[#58a700]'
              : 'bg-[#ffdfe0] border-[#ffb8ba] text-[#ea2b2b]'
            : 'bg-white border-gray-200'
        }`}
      >
        <div className="max-w-2xl w-full mx-auto flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            {isAnswerChecked && (
              <>
                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-xs">
                  {isCorrect ? (
                    <Check className="w-7 h-7 text-[#58cc02] stroke-[4]" />
                  ) : (
                    <X className="w-7 h-7 text-[#ea2b2b] stroke-[4]" />
                  )}
                </div>
                <div>
                  <h4 className="text-xl font-black">
                    {isCorrect ? 'Nicely done!' : `Correct answer: ${currentQ.correct}`}
                  </h4>
                </div>
              </>
            )}
          </div>

          <div>
            {!isAnswerChecked ? (
              <button
                onClick={handleCheck}
                disabled={!selectedOpt}
                className="py-3.5 px-8 rounded-2xl bg-[#58cc02] text-white font-extrabold text-xs uppercase tracking-wider border-b-4 border-[#46a302] hover:brightness-105 active:translate-y-1 active:border-b-0 disabled:bg-gray-200 disabled:border-gray-300 disabled:text-gray-400"
              >
                CHECK
              </button>
            ) : (
              <button
                onClick={handleContinue}
                disabled={loading}
                className={`py-3.5 px-8 rounded-2xl text-white font-extrabold text-xs uppercase tracking-wider border-b-4 hover:brightness-105 active:translate-y-1 active:border-b-0 ${
                  isCorrect
                    ? 'bg-[#58cc02] border-[#46a302]'
                    : 'bg-[#ea2b2b] border-[#ba1b1b]'
                }`}
              >
                {loading ? 'SAVING...' : 'CONTINUE'}
              </button>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}
