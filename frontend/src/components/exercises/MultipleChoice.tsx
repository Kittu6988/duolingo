'use client';

import React, { useEffect } from 'react';
import { Volume2 } from 'lucide-react';
import { Exercise } from '@/types';
import { speakSpanish, playTapSound } from '@/lib/sound';

interface MultipleChoiceProps {
  exercise: Exercise;
  selectedAnswer: string;
  onSelect: (ans: string) => void;
  disabled?: boolean;
}

interface OptionItem {
  text: string;
  sub?: string;
  icon?: string;
}

export const MultipleChoice: React.FC<MultipleChoiceProps> = ({
  exercise,
  selectedAnswer,
  onSelect,
  disabled = false,
}) => {
  let options: OptionItem[] = [];
  try {
    options = exercise.options_json ? JSON.parse(exercise.options_json) : [];
  } catch (e) {
    options = [{ text: exercise.correct_answer }];
  }

  // Keyboard shortcuts 1, 2, 3
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (disabled) return;
      const num = parseInt(e.key, 10);
      if (num >= 1 && num <= options.length) {
        playTapSound();
        onSelect(options[num - 1].text);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [disabled, options, onSelect]);

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col items-center">
      <div className="w-full flex items-center justify-between mb-6">
        <h2 className="text-2xl sm:text-3xl font-black text-gray-800 leading-tight">
          {exercise.prompt}
        </h2>
        {exercise.audio_text && (
          <button
            onClick={() => speakSpanish(exercise.audio_text!)}
            className="p-3 bg-[#1cb0f6] text-white rounded-2xl hover:brightness-105 active:translate-y-0.5 border-b-4 border-[#1899d6] transition shrink-0 ml-3"
            title="Listen in Spanish"
          >
            <Volume2 className="w-6 h-6" />
          </button>
        )}
      </div>

      {exercise.question && (
        <p className="w-full text-left text-sm font-bold text-gray-400 mb-6 uppercase tracking-wider">
          {exercise.question}
        </p>
      )}

      {/* Options Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
        {options.map((opt, idx) => {
          const isSelected = selectedAnswer.toLowerCase() === opt.text.toLowerCase();
          return (
            <button
              key={idx}
              disabled={disabled}
              onClick={() => {
                playTapSound();
                if (opt.text) speakSpanish(opt.text);
                onSelect(opt.text);
              }}
              className={`flex flex-col items-center justify-center p-5 rounded-2xl border-2 transition-all duration-150 select-none relative ${
                isSelected
                  ? 'border-[#1cb0f6] bg-[#ddf4ff] border-b-6 translate-y-[-2px] shadow-sm'
                  : 'border-gray-200 bg-white border-b-4 hover:bg-gray-50 active:translate-y-0.5'
              } ${disabled ? 'opacity-80 cursor-default' : 'cursor-pointer'}`}
            >
              {/* Hotkey tag */}
              <span className="absolute top-2.5 left-3 text-[11px] font-black text-gray-400 border border-gray-200 rounded-md px-1.5">
                {idx + 1}
              </span>

              {opt.icon && <span className="text-4xl my-2">{opt.icon}</span>}
              <span className="text-base sm:text-lg font-black text-gray-800 mt-1">
                {opt.text}
              </span>
              {opt.sub && (
                <span className="text-xs font-bold text-gray-400 mt-0.5">
                  {opt.sub}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
