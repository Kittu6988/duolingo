'use client';

import React from 'react';
import { Volume2 } from 'lucide-react';
import { Exercise } from '@/types';
import { speakSpanish, playTapSound } from '@/lib/sound';

interface FillBlankProps {
  exercise: Exercise;
  selectedAnswer: string;
  onSelect: (ans: string) => void;
  disabled?: boolean;
}

export const FillBlank: React.FC<FillBlankProps> = ({
  exercise,
  selectedAnswer,
  onSelect,
  disabled = false,
}) => {
  let options: string[] = [];
  try {
    options = exercise.options_json ? JSON.parse(exercise.options_json) : [];
  } catch {
    options = [exercise.correct_answer];
  }

  // Split question by "___" to show blank inline
  const parts = exercise.question.split('___');

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col items-center select-none">
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

      {/* Sentence with Blank Slot */}
      <div className="w-full p-6 bg-white border-2 border-gray-200 rounded-3xl shadow-xs mb-8 flex flex-wrap items-center gap-2 text-xl sm:text-2xl font-black text-gray-800">
        <span>{parts[0]}</span>
        <span
          className={`min-w-[100px] px-4 py-1.5 border-b-4 text-center rounded-xl transition ${
            selectedAnswer
              ? 'bg-[#ddf4ff] border-[#1cb0f6] text-[#1cb0f6]'
              : 'bg-gray-100 border-gray-400 text-transparent'
          }`}
        >
          {selectedAnswer || '_____'}
        </span>
        <span>{parts[1] || ''}</span>
      </div>

      {/* Options List */}
      <div className="grid grid-cols-2 gap-3.5 w-full">
        {options.map((opt, idx) => {
          const isSelected = selectedAnswer.toLowerCase() === opt.toLowerCase();
          return (
            <button
              key={idx}
              disabled={disabled}
              onClick={() => {
                playTapSound();
                speakSpanish(opt);
                onSelect(opt);
              }}
              className={`p-4 rounded-2xl border-2 font-black text-lg transition duration-150 ${
                isSelected
                  ? 'border-[#1cb0f6] bg-[#ddf4ff] text-[#1cb0f6] border-b-6 translate-y-[-2px]'
                  : 'border-gray-200 bg-white text-gray-700 border-b-4 hover:bg-gray-50 active:translate-y-0.5'
              } ${disabled ? 'cursor-default' : 'cursor-pointer'}`}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
};
