'use client';

import React, { useState } from 'react';
import { Flame, Gem, Heart, Volume2, VolumeX, Plus, Sparkles, X } from 'lucide-react';
import { User } from '@/types';
import { isSoundEnabled, setSoundEnabled, playTapSound } from '@/lib/sound';
import { refillHearts } from '@/lib/api';
import Link from 'next/link';

interface TopBarProps {
  user: User | null;
  onUserUpdate?: (updatedUser: User) => void;
}

export const TopBar: React.FC<TopBarProps> = ({ user, onUserUpdate }) => {
  const [muted, setMuted] = useState(!isSoundEnabled());
  const [showHeartsModal, setShowHeartsModal] = useState(false);
  const [showStreakModal, setShowStreakModal] = useState(false);
  const [isRefilling, setIsRefilling] = useState(false);

  const toggleSound = () => {
    const next = !muted;
    setMuted(next);
    setSoundEnabled(!next);
    if (!next) playTapSound();
  };

  const handleRefillHearts = async () => {
    try {
      setIsRefilling(true);
      const updated = await refillHearts();
      if (onUserUpdate) onUserUpdate(updated);
      setShowHeartsModal(false);
    } catch (e) {
      console.error(e);
    } finally {
      setIsRefilling(false);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b-2 border-gray-200 px-4 py-3 flex items-center justify-between">
        {/* Course Flag Indicator */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-gray-100 cursor-pointer transition">
          <span className="text-2xl">🇪🇸</span>
          <span className="text-xs font-black uppercase tracking-wider text-gray-500 hidden sm:inline">
            Spanish
          </span>
        </div>

        {/* Gamification Stats: Streak, Gems, Hearts */}
        <div className="flex items-center gap-4 sm:gap-6">
          {/* Streak Counter */}
          <button
            onClick={() => { playTapSound(); setShowStreakModal(true); }}
            className="flex items-center gap-1.5 group hover:opacity-80 transition"
            title="Current Streak"
          >
            <Flame className="w-6 h-6 text-orange-500 fill-orange-500 group-hover:scale-110 transition-transform" />
            <span className="text-sm font-black text-orange-500">{user?.streak ?? 0}</span>
          </button>

          {/* Gems Counter */}
          <Link
            href="/shop"
            onClick={() => playTapSound()}
            className="flex items-center gap-1.5 group hover:opacity-80 transition"
            title="Gems"
          >
            <Gem className="w-6 h-6 text-blue-400 fill-blue-400 group-hover:scale-110 transition-transform" />
            <span className="text-sm font-black text-blue-500">{user?.gems ?? 0}</span>
          </Link>

          {/* Hearts Counter */}
          <button
            onClick={() => { playTapSound(); setShowHeartsModal(true); }}
            className="flex items-center gap-1.5 group hover:opacity-80 transition"
            title="Hearts"
          >
            <Heart
              className={`w-6 h-6 transition-transform group-hover:scale-110 ${
                (user?.hearts ?? 5) === 0
                  ? 'text-gray-300 fill-gray-300'
                  : 'text-rose-500 fill-rose-500'
              }`}
            />
            <span
              className={`text-sm font-black ${
                (user?.hearts ?? 5) === 0 ? 'text-gray-400' : 'text-rose-500'
              }`}
            >
              {user?.hearts ?? 5}
            </span>
          </button>

          {/* Audio Sound Toggle */}
          <button
            onClick={toggleSound}
            className="p-1.5 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
            title={muted ? 'Unmute Sound Effects' : 'Mute Sound Effects'}
          >
            {muted ? <VolumeX className="w-5 h-5 text-gray-400" /> : <Volume2 className="w-5 h-5 text-emerald-600" />}
          </button>
        </div>
      </header>

      {/* Hearts Modal */}
      {showHeartsModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border-2 border-gray-200 text-center relative">
            <button
              onClick={() => setShowHeartsModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-16 h-16 mx-auto mb-3 bg-rose-100 rounded-full flex items-center justify-center">
              <Heart className="w-9 h-9 text-rose-500 fill-rose-500" />
            </div>

            <h3 className="text-xl font-black text-gray-800 mb-1">Hearts</h3>
            <p className="text-sm font-medium text-gray-500 mb-4">
              You have <span className="font-bold text-rose-500">{user?.hearts ?? 5} of 5 hearts</span> remaining.
              Hearts prevent you from losing progress when making mistakes.
            </p>

            <div className="flex flex-col gap-2.5">
              <button
                onClick={handleRefillHearts}
                disabled={isRefilling || (user?.hearts ?? 0) >= 5}
                className="w-full py-3 px-4 rounded-2xl bg-[#58cc02] text-white font-extrabold text-sm uppercase tracking-wider border-b-4 border-[#46a302] active:translate-y-0.5 active:border-b-0 hover:brightness-105 transition disabled:opacity-50"
              >
                {isRefilling ? 'Refilling...' : (user?.hearts ?? 0) >= 5 ? 'Hearts Full!' : 'Refill Hearts (Free / Demo)'}
              </button>

              <Link
                href="/practice"
                onClick={() => setShowHeartsModal(false)}
                className="w-full py-3 px-4 rounded-2xl bg-[#1cb0f6] text-white font-extrabold text-sm uppercase tracking-wider border-b-4 border-[#1899d6] active:translate-y-0.5 active:border-b-0 hover:brightness-105 transition"
              >
                Practice to Earn +1 Heart
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Streak Modal */}
      {showStreakModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border-2 border-gray-200 text-center relative">
            <button
              onClick={() => setShowStreakModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-16 h-16 mx-auto mb-3 bg-orange-100 rounded-full flex items-center justify-center">
              <Flame className="w-9 h-9 text-orange-500 fill-orange-500" />
            </div>

            <h3 className="text-2xl font-black text-gray-800 mb-1">{user?.streak ?? 0} Day Streak!</h3>
            <p className="text-sm font-medium text-gray-500 mb-4">
              Practice every day to keep your streak alive and earn milestone awards.
            </p>

            <div className="bg-gray-50 rounded-2xl p-4 mb-4 border border-gray-200 flex items-center justify-around">
              {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, idx) => (
                <div key={idx} className="flex flex-col items-center gap-1">
                  <span className="text-xs font-bold text-gray-400">{day}</span>
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black ${
                      idx < (user?.streak ?? 0) % 7 || (user?.streak ?? 0) >= 7
                        ? 'bg-orange-500 text-white'
                        : 'bg-gray-200 text-gray-400'
                    }`}
                  >
                    ✓
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between text-xs font-bold text-gray-500 px-2 mb-4">
              <span>Streak Freeze Equipped:</span>
              <span className="text-[#1cb0f6] font-extrabold">{user?.streak_freeze_count ?? 1} available</span>
            </div>

            <button
              onClick={() => setShowStreakModal(false)}
              className="w-full py-3 px-4 rounded-2xl bg-[#58cc02] text-white font-extrabold text-sm uppercase tracking-wider border-b-4 border-[#46a302] active:translate-y-0.5 active:border-b-0 hover:brightness-105 transition"
            >
              Keep It Going!
            </button>
          </div>
        </div>
      )}
    </>
  );
};
