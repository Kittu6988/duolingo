'use client';

import React from 'react';
import Link from 'next/link';
import { Target, Shield, Sparkles, ChevronRight, Zap } from 'lucide-react';
import { Quest, LeaderboardUser } from '@/types';
import { playTapSound } from '@/lib/sound';

interface RightRailProps {
  quests?: Quest[];
  leaderboard?: LeaderboardUser[];
}

export const RightRail: React.FC<RightRailProps> = ({ quests = [], leaderboard = [] }) => {
  const topLeaderboard = leaderboard.slice(0, 3);

  return (
    <aside className="hidden lg:flex flex-col gap-5 w-80 p-4 select-none">
      {/* Super Duolingo Card */}
      <div className="rounded-3xl border-2 border-indigo-200 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-5 shadow-xs relative overflow-hidden">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-5 h-5 text-indigo-600" />
          <span className="text-xs font-black uppercase tracking-wider text-indigo-700">
            Super Duolingo
          </span>
        </div>
        <h4 className="text-base font-black text-gray-800 leading-tight mb-2">
          Master Spanish faster with Super
        </h4>
        <p className="text-xs text-gray-500 font-medium mb-4 leading-relaxed">
          No ads, unlimited hearts, and personalized practice to power through lessons!
        </p>
        <Link
          href="/shop"
          onClick={() => playTapSound()}
          className="block text-center w-full py-2.5 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-extrabold text-xs uppercase tracking-wider rounded-2xl shadow-sm border-b-4 border-indigo-800 active:translate-y-0.5 active:border-b-0 hover:brightness-105 transition"
        >
          Start 2-Week Free Trial
        </Link>
      </div>

      {/* Daily Quests Widget */}
      <div className="rounded-3xl border-2 border-gray-200 p-5 bg-white shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-amber-500" />
            <h4 className="text-sm font-black text-gray-800 uppercase tracking-wider">
              Daily Quests
            </h4>
          </div>
          <Link
            href="/quests"
            onClick={() => playTapSound()}
            className="text-xs font-bold text-[#1cb0f6] hover:underline flex items-center gap-0.5"
          >
            VIEW ALL <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="flex flex-col gap-4">
          {quests.slice(0, 3).map((quest) => {
            const pct = Math.min(100, Math.round((quest.current_progress / quest.target) * 100));
            return (
              <div key={quest.id} className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-2xl bg-amber-100 flex items-center justify-center shrink-0">
                  <Zap className="w-5 h-5 text-amber-600 fill-amber-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between text-xs font-bold text-gray-700 mb-1">
                    <span className="truncate">{quest.title}</span>
                    <span className="text-gray-400 font-extrabold shrink-0 ml-1">
                      {quest.current_progress}/{quest.target}
                    </span>
                  </div>
                  {/* Progress Bar */}
                  <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        quest.completed ? 'bg-[#58cc02]' : 'bg-amber-400'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Leaderboard League Preview */}
      <div className="rounded-3xl border-2 border-gray-200 p-5 bg-white shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-gray-400" />
            <h4 className="text-sm font-black text-gray-800 uppercase tracking-wider">
              Silver League
            </h4>
          </div>
          <Link
            href="/leaderboard"
            onClick={() => playTapSound()}
            className="text-xs font-bold text-[#1cb0f6] hover:underline flex items-center gap-0.5"
          >
            STANDINGS <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="flex flex-col gap-2.5">
          {topLeaderboard.map((item) => (
            <div
              key={item.id}
              className={`flex items-center justify-between p-2.5 rounded-2xl border transition ${
                item.is_user
                  ? 'bg-emerald-50 border-emerald-300 font-black'
                  : 'bg-gray-50 border-gray-100'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${
                    item.rank === 1
                      ? 'bg-amber-400 text-white'
                      : item.rank === 2
                      ? 'bg-slate-300 text-slate-700'
                      : 'bg-amber-600 text-white'
                  }`}
                >
                  {item.rank}
                </span>
                <span className="text-xs font-bold text-gray-700 truncate max-w-[120px]">
                  {item.display_name}
                </span>
              </div>
              <span className="text-xs font-extrabold text-gray-500">
                {item.xp} XP
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Info */}
      <footer className="text-[11px] font-bold text-gray-400 text-center flex flex-wrap gap-x-3 gap-y-1 justify-center px-4">
        <span>ABOUT</span>
        <span>•</span>
        <span>BLOG</span>
        <span>•</span>
        <span>STORE</span>
        <span>•</span>
        <span>TERMS</span>
        <span>•</span>
        <span>PRIVACY</span>
      </footer>
    </aside>
  );
};
