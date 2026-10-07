'use client';

import React, { useEffect, useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { TopBar } from '@/components/TopBar';
import { RightRail } from '@/components/RightRail';
import { Quest, User, LeaderboardUser } from '@/types';
import { getQuests, getUser, getLeaderboard, claimQuest } from '@/lib/api';
import { Target, Zap, Gem, Check, Sparkles, RefreshCw } from 'lucide-react';
import { playCorrectSound, playTapSound } from '@/lib/sound';
import { DuoMascot } from '@/components/DuoMascot';
import confetti from 'canvas-confetti';

export default function QuestsPage() {
  const [quests, setQuests] = useState<Quest[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [claimingId, setClaimingId] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [qData, uData, lData] = await Promise.all([
        getQuests(),
        getUser(),
        getLeaderboard(),
      ]);
      setQuests(qData);
      setUser(uData);
      setLeaderboard(lData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleClaim = async (questId: string) => {
    try {
      playTapSound();
      setClaimingId(questId);
      const updatedQuest = await claimQuest(questId);
      playCorrectSound();
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.5 }
      });
      // Refresh user and quest state
      setQuests(prev => prev.map(q => q.id === questId ? updatedQuest : q));
      const updatedUser = await getUser();
      setUser(updatedUser);
    } catch (e) {
      console.error(e);
    } finally {
      setClaimingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-white text-gray-800 flex">
      <Sidebar />

      <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
        <TopBar user={user} onUserUpdate={(u) => setUser(u)} />

        <div className="flex-1 flex justify-center px-4 py-8 pb-24 md:pb-12">
          <main className="w-full max-w-xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
              <div className="w-16 h-16 rounded-3xl bg-amber-100 flex items-center justify-center">
                <Target className="w-9 h-9 text-amber-600" />
              </div>
              <div>
                <h1 className="text-3xl font-black text-gray-800">Daily Quests</h1>
                <p className="text-xs font-bold text-gray-400">Complete daily challenges to earn gems and XP</p>
              </div>
            </div>

            {/* Monthly Challenge Banner */}
            <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md mb-8 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-black uppercase tracking-wider text-emerald-200">
                  October Badge Quest
                </span>
                <h3 className="text-xl font-black mt-1 mb-2">Duo's Autumn Journey</h3>
                <p className="text-xs text-white/90 font-medium max-w-xs">
                  Complete 20 quests this month to earn the exclusive Golden Duo Badge!
                </p>
              </div>
              <DuoMascot mood="celebrating" size={80} className="shrink-0" />
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <RefreshCw className="w-6 h-6 text-gray-400 animate-spin" />
                <span className="text-xs font-bold text-gray-400">Loading Quests...</span>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {quests.map((quest) => {
                  const pct = Math.min(100, Math.round((quest.current_progress / quest.target) * 100));

                  return (
                    <div
                      key={quest.id}
                      className={`p-5 rounded-3xl border-2 transition ${
                        quest.completed && !quest.claimed
                          ? 'border-amber-300 bg-amber-50/50 shadow-sm'
                          : 'border-gray-200 bg-white'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center shrink-0">
                            <Zap className="w-6 h-6 text-amber-600 fill-amber-500" />
                          </div>
                          <div>
                            <h4 className="text-base font-black text-gray-800">{quest.title}</h4>
                            <p className="text-xs font-bold text-gray-400">{quest.description}</p>
                          </div>
                        </div>

                        {/* Reward Badges */}
                        <div className="flex items-center gap-2 shrink-0">
                          <div className="flex items-center gap-1 text-xs font-black text-amber-600 bg-amber-50 px-2 py-1 rounded-xl border border-amber-200">
                            <Sparkles className="w-3.5 h-3.5" /> +{quest.xp_reward} XP
                          </div>
                          <div className="flex items-center gap-1 text-xs font-black text-blue-500 bg-blue-50 px-2 py-1 rounded-xl border border-blue-200">
                            <Gem className="w-3.5 h-3.5" /> +{quest.gem_reward}
                          </div>
                        </div>
                      </div>

                      {/* Progress Bar & Claim Button */}
                      <div className="flex items-center gap-4 mt-4">
                        <div className="flex-1">
                          <div className="flex items-center justify-between text-xs font-bold text-gray-500 mb-1.5">
                            <span>Progress</span>
                            <span>{quest.current_progress} / {quest.target}</span>
                          </div>
                          <div className="w-full h-3.5 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                quest.completed ? 'bg-[#58cc02]' : 'bg-amber-400'
                              }`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>

                        {quest.claimed ? (
                          <div className="flex items-center gap-1 text-xs font-black text-emerald-600 px-4 py-2 bg-emerald-50 rounded-2xl border border-emerald-200">
                            <Check className="w-4 h-4" /> CLAIMED
                          </div>
                        ) : quest.completed ? (
                          <button
                            onClick={() => handleClaim(quest.id)}
                            disabled={claimingId === quest.id}
                            className="px-5 py-2.5 rounded-2xl bg-[#58cc02] text-white font-black text-xs uppercase tracking-wider border-b-4 border-[#46a302] hover:brightness-105 active:translate-y-0.5 shadow-md animate-bounce"
                          >
                            {claimingId === quest.id ? 'CLAIMING...' : 'CLAIM REWARD'}
                          </button>
                        ) : (
                          <div className="text-xs font-black text-gray-400 uppercase tracking-wider px-3 py-2 bg-gray-50 rounded-2xl">
                            IN PROGRESS
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </main>

          <RightRail quests={quests} leaderboard={leaderboard} />
        </div>
      </div>
    </div>
  );
}
