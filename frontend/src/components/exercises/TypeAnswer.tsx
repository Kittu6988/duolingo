'use client';

import React, { useRef } from 'react';
import { Volume2 } from 'lucide-react';
import { Exercise } from '@/types';
import { speakSpanish, playTapSound } from '@/lib/sound';

interface TypeAnswerProps {
  exercise: Exercise;
  answerText: string;
  onTextChange: (val: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
}

export const TypeAnswer: React.FC<TypeAnswerProps> = ({
  exercise,
  answerText,
  onTextChange,
  onSubmit,
  disabled = false,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const accents = ['á', 'é', 'í', 'ó', 'ú', 'ñ', '¿', '¡'];

  const handleAccentClick = (char: string) => {
    if (disabled) return;
    playTapSound();
    onTextChange(answerText + char);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && answerText.trim()) {
      e.preventDefault();
      onSubmit();
    }
  };

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

      <div className="w-full p-5 bg-white border-2 border-gray-200 rounded-3xl shadow-xs mb-6">
        <span className="text-xl sm:text-2xl font-black text-gray-800">
          {exercise.question}
        </span>
      </div>

      {/* Input Box */}
      <div className="w-full mb-4">
        <input
          ref={inputRef}
          type="text"
          value={answerText}
          disabled={disabled}
          onChange={(e) => onTextChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type in Spanish..."
          className="w-full p-4 rounded-2xl border-2 border-gray-300 focus:border-[#1cb0f6] focus:bg-[#ddf4ff]/20 text-lg sm:text-xl font-black text-gray-800 outline-none transition shadow-inner"
          autoFocus
        />
      </div>

      {/* Spanish Accent Buttons */}
      <div className="w-full flex flex-wrap gap-2 justify-center mb-4">
        {accents.map((char) => (
          <button
            key={char}
            type="button"
            disabled={disabled}
            onClick={() => handleAccentClick(char)}
            className="w-10 h-10 rounded-xl bg-gray-100 border border-gray-300 hover:bg-gray-200 active:translate-y-0.5 font-black text-base text-gray-700 transition"
          >
            {char}
          </button>
        ))}
      </div>
    </div>
  );
};
