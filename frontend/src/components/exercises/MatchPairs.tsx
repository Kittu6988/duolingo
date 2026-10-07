'use client';

import React, { useState, useEffect } from 'react';
import { Exercise } from '@/types';
import { playTapSound, playCorrectSound, playWrongSound, speakSpanish } from '@/lib/sound';
import { Check } from 'lucide-react';

interface MatchPairsProps {
  exercise: Exercise;
  onComplete: () => void;
  disabled?: boolean;
}

export const MatchPairs: React.FC<MatchPairsProps> = ({
  exercise,
  onComplete,
  disabled = false,
}) => {
  let pairMap: Record<string, string> = {};
  let leftItems: string[] = [];
  let rightItems: string[] = [];

  try {
    pairMap = JSON.parse(exercise.correct_answer);
    const options = JSON.parse(exercise.options_json || '{}');
    leftItems = options.left || Object.keys(pairMap);
    rightItems = options.right || Object.values(pairMap);
  } catch {
    pairMap = { "hello": "hola", "bye": "adiós" };
    leftItems = ["hello", "bye"];
    rightItems = ["adiós", "hola"];
  }

  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [selectedRight, setSelectedRight] = useState<string | null>(null);
  const [matchedPairs, setMatchedPairs] = useState<Set<string>>(new Set());
  const [mismatchPair, setMismatchPair] = useState<{ left?: string; right?: string } | null>(null);

  useEffect(() => {
    setSelectedLeft(null);
    setSelectedRight(null);
    setMatchedPairs(new Set());
    setMismatchPair(null);
  }, [exercise]);

  // Check matching logic whenever selections change
  const handleSelect = (side: 'left' | 'right', val: string) => {
    if (disabled || matchedPairs.has(val)) return;
    playTapSound();

    if (side === 'left') {
      if (selectedLeft === val) {
        setSelectedLeft(null);
        return;
      }
      setSelectedLeft(val);

      if (selectedRight) {
        verifyMatch(val, selectedRight);
      }
    } else {
      speakSpanish(val);
      if (selectedRight === val) {
        setSelectedRight(null);
        return;
      }
      setSelectedRight(val);

      if (selectedLeft) {
        verifyMatch(selectedLeft, val);
      }
    }
  };

  const verifyMatch = (leftVal: string, rightVal: string) => {
    const isCorrect = pairMap[leftVal] === rightVal;

    if (isCorrect) {
      playCorrectSound();
      const nextMatched = new Set(matchedPairs);
      nextMatched.add(leftVal);
      nextMatched.add(rightVal);
      setMatchedPairs(nextMatched);
      setSelectedLeft(null);
      setSelectedRight(null);

      // Check if all pairs are matched
      if (nextMatched.size >= Object.keys(pairMap).length * 2) {
        onComplete();
      }
    } else {
      playWrongSound();
      setMismatchPair({ left: leftVal, right: rightVal });
      setTimeout(() => {
        setMismatchPair(null);
        setSelectedLeft(null);
        setSelectedRight(null);
      }, 700);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col items-center select-none">
      <h2 className="w-full text-left text-2xl sm:text-3xl font-black text-gray-800 mb-2 leading-tight">
        {exercise.prompt}
      </h2>
      <p className="w-full text-left text-xs font-bold text-gray-400 mb-6 uppercase tracking-wider">
        Tap matching pairs to clear the board
      </p>

      {/* Two Columns Grid */}
      <div className="grid grid-cols-2 gap-4 w-full">
        {/* Left Column (e.g. English) */}
        <div className="flex flex-col gap-3">
          {leftItems.map((item) => {
            const isMatched = matchedPairs.has(item);
            const isSelected = selectedLeft === item;
            const isMismatch = mismatchPair?.left === item;

            return (
              <button
                key={item}
                disabled={isMatched || disabled}
                onClick={() => handleSelect('left', item)}
                className={`py-3.5 px-4 rounded-2xl border-2 font-black text-base transition-all duration-150 text-center flex items-center justify-between shadow-xs ${
                  isMatched
                    ? 'border-transparent bg-gray-100 text-gray-300 opacity-60 cursor-default'
                    : isMismatch
                    ? 'border-rose-500 bg-rose-50 text-rose-600 animate-shake border-b-4'
                    : isSelected
                    ? 'border-[#1cb0f6] bg-[#ddf4ff] text-[#1cb0f6] border-b-6 translate-y-[-2px]'
                    : 'border-gray-200 bg-white text-gray-700 border-b-4 hover:bg-gray-50 active:translate-y-0.5'
                }`}
              >
                <span className="truncate">{item}</span>
                {isMatched && <Check className="w-4 h-4 text-gray-400 shrink-0" />}
              </button>
            );
          })}
        </div>

        {/* Right Column (e.g. Spanish) */}
        <div className="flex flex-col gap-3">
          {rightItems.map((item) => {
            const isMatched = matchedPairs.has(item);
            const isSelected = selectedRight === item;
            const isMismatch = mismatchPair?.right === item;

            return (
              <button
                key={item}
                disabled={isMatched || disabled}
                onClick={() => handleSelect('right', item)}
                className={`py-3.5 px-4 rounded-2xl border-2 font-black text-base transition-all duration-150 text-center flex items-center justify-between shadow-xs ${
                  isMatched
                    ? 'border-transparent bg-gray-100 text-gray-300 opacity-60 cursor-default'
                    : isMismatch
                    ? 'border-rose-500 bg-rose-50 text-rose-600 animate-shake border-b-4'
                    : isSelected
                    ? 'border-[#1cb0f6] bg-[#ddf4ff] text-[#1cb0f6] border-b-6 translate-y-[-2px]'
                    : 'border-gray-200 bg-white text-gray-700 border-b-4 hover:bg-gray-50 active:translate-y-0.5'
                }`}
              >
                <span className="truncate">{item}</span>
                {isMatched && <Check className="w-4 h-4 text-gray-400 shrink-0" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
