'use client';

import React, { useState, useEffect } from 'react';
import { Volume2 } from 'lucide-react';
import { Exercise } from '@/types';
import { speakSpanish, playTapSound } from '@/lib/sound';
import { DuoMascot } from '../DuoMascot';

interface TranslateWordBankProps {
  exercise: Exercise;
  onAnswerChange: (ans: string) => void;
  disabled?: boolean;
}

interface Tile {
  id: string;
  word: string;
}

export const TranslateWordBank: React.FC<TranslateWordBankProps> = ({
  exercise,
  onAnswerChange,
  disabled = false,
}) => {
  const [bankTiles, setBankTiles] = useState<Tile[]>([]);
  const [placedTiles, setPlacedTiles] = useState<Tile[]>([]);

  useEffect(() => {
    let tokens: string[] = [];
    try {
      tokens = exercise.options_json ? JSON.parse(exercise.options_json) : [];
    } catch {
      tokens = exercise.correct_answer.split(' ');
    }
    const initialTiles = tokens.map((word, idx) => ({
      id: `${word}-${idx}-${Math.random()}`,
      word
    }));
    setBankTiles(initialTiles);
    setPlacedTiles([]);
    onAnswerChange('');
  }, [exercise, onAnswerChange]);

  const handleTileClick = (tile: Tile, fromPlaced: boolean) => {
    if (disabled) return;
    playTapSound();

    if (fromPlaced) {
      // Remove from placed, restore to bank
      const newPlaced = placedTiles.filter(t => t.id !== tile.id);
      setPlacedTiles(newPlaced);
      setBankTiles(prev => [...prev, tile]);
      onAnswerChange(newPlaced.map(t => t.word).join(' '));
    } else {
      // Move from bank to placed
      const newPlaced = [...placedTiles, tile];
      setPlacedTiles(newPlaced);
      setBankTiles(prev => prev.filter(t => t.id !== tile.id));
      onAnswerChange(newPlaced.map(t => t.word).join(' '));
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col items-center select-none">
      <h2 className="w-full text-left text-2xl sm:text-3xl font-black text-gray-800 mb-6 leading-tight">
        {exercise.prompt}
      </h2>

      {/* Speech Prompt with Mascot & Speech Bubble */}
      <div className="w-full flex items-center gap-4 mb-8">
        <DuoMascot mood="happy" size={76} className="shrink-0 hidden sm:inline-block" />

        <div className="relative flex items-center gap-3 p-4 bg-white border-2 border-gray-200 rounded-2xl shadow-xs flex-1">
          {/* Audio Speaker Button */}
          {exercise.audio_text && (
            <button
              onClick={() => speakSpanish(exercise.audio_text!)}
              className="p-2.5 bg-[#1cb0f6] text-white rounded-xl hover:brightness-105 active:translate-y-0.5 border-b-3 border-[#1899d6] transition shrink-0"
              title="Hear phrase"
            >
              <Volume2 className="w-5 h-5" />
            </button>
          )}

          <span className="text-xl sm:text-2xl font-black text-gray-800">
            {exercise.question}
          </span>
        </div>
      </div>

      {/* Sentence Answer Line (Placed Tiles) */}
      <div className="w-full min-h-[70px] border-b-2 border-t-2 border-gray-200 py-3 px-2 flex flex-wrap gap-2.5 items-center mb-8 bg-gray-50/50 rounded-xl">
        {placedTiles.length === 0 ? (
          <span className="text-sm font-bold text-gray-400 italic px-2">
            Tap words below to form your translation
          </span>
        ) : (
          placedTiles.map(tile => (
            <button
              key={tile.id}
              disabled={disabled}
              onClick={() => handleTileClick(tile, true)}
              className="px-4 py-2 bg-white text-gray-800 font-extrabold text-base rounded-2xl border-2 border-gray-300 border-b-4 hover:border-gray-400 active:translate-y-0.5 shadow-xs transition"
            >
              {tile.word}
            </button>
          ))
        )}
      </div>

      {/* Word Bank Area */}
      <div className="w-full flex flex-wrap gap-2.5 justify-center">
        {bankTiles.map(tile => (
          <button
            key={tile.id}
            disabled={disabled}
            onClick={() => handleTileClick(tile, false)}
            className="px-4 py-2.5 bg-white text-gray-800 font-extrabold text-base rounded-2xl border-2 border-gray-200 border-b-4 hover:bg-gray-50 active:translate-y-0.5 shadow-xs transition cursor-pointer"
          >
            {tile.word}
          </button>
        ))}
      </div>
    </div>
  );
};
