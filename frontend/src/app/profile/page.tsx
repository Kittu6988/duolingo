'use client';

import React, { useEffect, useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { TopBar } from '@/components/TopBar';
import { RightRail } from '@/components/RightRail';
import { User, Quest, LeaderboardUser } from '@/types';
import { getUser, updateUser, getQuests, getLeaderboard, simulateDay, resetProgress } from '@/lib/api';
import { Flame, Sparkles, Shield, Trophy, Award, Edit3, Check, RefreshCw, Zap, RotateCcw } from 'lucide-react';
import { DuoMascot } from '@/components/DuoMascot';
import { playTapSound, playCorrectSound } from '@/lib/sound';

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [quests, setQuests] = useState<Quest[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState('');
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const avatars = [
    { id: 'duo-owl', label: 'Duo Owl', emoji: '🦉' },
    { id: 'bear', label: 'Bear', emoji: '🐻' },
    { id: 'fox', label: 'Fox', emoji: '🦊' },
    { id: 'cat', label: 'Cat', emoji: '🐱' },
    { id: 'koala', label: 'Koala', emoji: '🐨' },
    { id: 'tiger', label: 'Tiger', emoji: '🐯' },
  ];

  const loadData = async () => {
    try {
      setLoading(true);
      const [uData, qData, lData] = await Promise.all([
        getUser(),
        getQuests(),
        getLeaderboard(),
      ]);
      setUser(uData);
      setNewName(uData.display_name);
      setQuests(qData);
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

  const handleSaveName = async () => {
    if (!newName.trim()) return;
    try {
      playTapSound();
      const updated = await updateUser({ display_name: newName.trim() });
      setUser(updated);
      setEditingName(false);
      showStatus('Display name updated!');
    } catch (e) {
      console.error(e);
    }
  };

  const handleSelectAvatar = async (avatarId: string) => {
    try {
      playTapSound();
      const updated = await updateUser({ avatar: avatarId });
      setUser(updated);
      showStatus('Avatar updated!');
    } catch (e) {
      console.error(e);
    }
  };

  const handleSimulate = async (action: 'advance_and_practice' | 'miss_day' | 'add_gems') => {
    try {
      playTapSound();
      const updated = await simulateDay(action);
      setUser(updated);
      if (action === 'advance_and_practice') {
        playCorrectSound();
        showStatus('Simulated advancing 1 day: Streak incremented by +1!');
      } else if (action === 'miss_day') {
        showStatus('Simulated missed day: Streak freeze evaluated.');
      } else {
        showStatus('Added +200 Test Gems!');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleReset = async () => {
    if (!confirm('Are you sure you want to reset all lesson progress and restart from Lesson 1?')) return;
    try {
      playTapSound();
      const updated = await resetProgress();
      setUser(updated);
      showStatus('All course progress reset to fresh initial state!');
    } catch (e) {
      console.error(e);
    }
  };

  const showStatus = (msg: string) => {
    setStatusMsg(msg);
    setTimeout(() => setStatusMsg(null), 3500);
  };

  return (
    <div className="min-h-screen bg-white text-gray-800 flex">
      <Sidebar />

      <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
        <TopBar user={user} onUserUpdate={(u) => setUser(u)} />

        <div className="flex-1 flex justify-center px-4 py-8 pb-24 md:pb-12">
          <main className="w-full max-w-xl mx-auto">
            {/* Profile Header */}
            <div className="flex items-center gap-6 pb-8 border-b-2 border-gray-100 mb-8">
              <div className="relative group">
                <div className="w-24 h-24 rounded-full bg-emerald-100 border-4 border-emerald-400 flex items-center justify-center text-4xl shadow-md">
                  {user?.avatar === 'duo-owl' ? (
                    <DuoMascot mood="happy" size={72} />
                  ) : (
                    <span>
                      {avatars.find((a) => a.id === user?.avatar)?.emoji || '🦉'}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex-1">
                {editingName ? (
                  <div className="flex items-center gap-2 mb-1">
                    <input
                      type="text"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="p-1.5 px-3 rounded-xl border-2 border-gray-300 font-black text-xl text-gray-800 outline-none focus:border-[#1cb0f6]"
                    />
                    <button
                      onClick={handleSaveName}
                      className="p-2 bg-[#58cc02] text-white rounded-xl hover:brightness-105"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 mb-1">
                    <h1 className="text-2xl font-black text-gray-800">
                      {user?.display_name ?? 'Learner'}
                    </h1>
                    <button
                      onClick={() => setEditingName(true)}
                      className="text-gray-400 hover:text-gray-600 p-1"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  </div>
                )}
                <p className="text-xs font-bold text-gray-400">@{user?.username ?? 'duo_learner'}</p>
                <p className="text-xs font-semibold text-gray-400 mt-1">Joined March 2026 • Spanish Learner</p>
              </div>
            </div>

            {/* Status Toast */}
            {statusMsg && (
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-800 font-black text-xs mb-6 text-center animate-in fade-in">
                {statusMsg}
              </div>
            )}

            {/* Avatar Selector */}
            <div className="mb-8">
              <h3 className="text-xs font-black uppercase text-gray-400 tracking-wider mb-3">
                Choose Profile Avatar
              </h3>
              <div className="flex gap-3 overflow-x-auto pb-2">
                {avatars.map((av) => (
                  <button
                    key={av.id}
                    onClick={() => handleSelectAvatar(av.id)}
                    className={`flex flex-col items-center p-3 rounded-2xl border-2 transition shrink-0 ${
                      user?.avatar === av.id
                        ? 'border-[#1cb0f6] bg-[#ddf4ff] border-b-4'
                        : 'border-gray-200 bg-white hover:bg-gray-50'
                    }`}
                  >
                    <span className="text-2xl">{av.emoji}</span>
                    <span className="text-[11px] font-bold text-gray-600 mt-1">{av.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Statistics Grid */}
            <h3 className="text-xs font-black uppercase text-gray-400 tracking-wider mb-3">
              Learner Statistics
            </h3>
            <div className="grid grid-cols-2 gap-3.5 mb-8">
              {/* Streak */}
              <div className="p-4 rounded-3xl border-2 border-gray-200 flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-orange-100 flex items-center justify-center">
                  <Flame className="w-6 h-6 text-orange-500 fill-orange-500" />
                </div>
                <div>
                  <span className="text-xl font-black text-gray-800">{user?.streak ?? 0}</span>
                  <span className="block text-xs font-bold text-gray-400 uppercase">Day Streak</span>
                </div>
              </div>

              {/* Total XP */}
              <div className="p-4 rounded-3xl border-2 border-gray-200 flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-100 flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-amber-500 fill-amber-500" />
                </div>
                <div>
                  <span className="text-xl font-black text-gray-800">{user?.xp ?? 0}</span>
                  <span className="block text-xs font-bold text-gray-400 uppercase">Total XP</span>
                </div>
              </div>

              {/* League */}
              <div className="p-4 rounded-3xl border-2 border-gray-200 flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-100 flex items-center justify-center">
                  <Shield className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                  <span className="text-base font-black text-gray-800">{user?.league ?? 'Silver'}</span>
                  <span className="block text-xs font-bold text-gray-400 uppercase">Current League</span>
                </div>
              </div>

              {/* Top 3 Finishes */}
              <div className="p-4 rounded-3xl border-2 border-gray-200 flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 flex items-center justify-center">
                  <Trophy className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <span className="text-xl font-black text-gray-800">1</span>
                  <span className="block text-xs font-bold text-gray-400 uppercase">Top 3 Finishes</span>
                </div>
              </div>
            </div>

            {/* Achievements */}
            <h3 className="text-xs font-black uppercase text-gray-400 tracking-wider mb-3">
              Achievements & Badges
            </h3>
            <div className="space-y-3 mb-10">
              <div className="p-4 rounded-3xl border-2 border-gray-200 flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-orange-100 flex items-center justify-center text-xl">
                  🔥
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-black text-gray-800">Wildfire</h4>
                  <p className="text-xs font-bold text-gray-400">Reach a 3 day streak</p>
                  <div className="w-full h-2 bg-gray-100 rounded-full mt-2 overflow-hidden">
                    <div className="h-full bg-orange-500 rounded-full w-full" />
                  </div>
                </div>
                <Award className="w-6 h-6 text-amber-500" />
              </div>

              <div className="p-4 rounded-3xl border-2 border-gray-200 flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center text-xl">
                  🎯
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-black text-gray-800">Sharpshooter</h4>
                  <p className="text-xs font-bold text-gray-400">Complete a lesson with 100% accuracy</p>
                  <div className="w-full h-2 bg-gray-100 rounded-full mt-2 overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full w-full" />
                  </div>
                </div>
                <Award className="w-6 h-6 text-amber-500" />
              </div>
            </div>

            {/* Evaluator Simulation Hub */}
            <div className="p-6 rounded-3xl border-2 border-indigo-200 bg-indigo-50/50 mb-6">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-5 h-5 text-indigo-600" />
                <h3 className="text-sm font-black text-indigo-900 uppercase tracking-wider">
                  Evaluator Simulation & Testing Hub
                </h3>
              </div>
              <p className="text-xs font-medium text-gray-600 mb-4 leading-relaxed">
                Test daily streak mechanics, heart refills, and progress state transitions without waiting days:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  onClick={() => handleSimulate('advance_and_practice')}
                  className="py-2.5 px-3 rounded-2xl bg-white border border-indigo-200 text-indigo-800 font-extrabold text-xs uppercase tracking-wider hover:bg-indigo-100 active:translate-y-0.5 text-left"
                >
                  ⚡ Next Day (+1 Streak)
                </button>
                <button
                  onClick={() => handleSimulate('miss_day')}
                  className="py-2.5 px-3 rounded-2xl bg-white border border-indigo-200 text-indigo-800 font-extrabold text-xs uppercase tracking-wider hover:bg-indigo-100 active:translate-y-0.5 text-left"
                >
                  ❄️ Miss Day (Test Freeze)
                </button>
                <button
                  onClick={() => handleSimulate('add_gems')}
                  className="py-2.5 px-3 rounded-2xl bg-white border border-indigo-200 text-indigo-800 font-extrabold text-xs uppercase tracking-wider hover:bg-indigo-100 active:translate-y-0.5 text-left"
                >
                  💎 Add +200 Gems
                </button>
                <button
                  onClick={handleReset}
                  className="py-2.5 px-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 font-extrabold text-xs uppercase tracking-wider hover:bg-rose-100 active:translate-y-0.5 text-left flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset All Progress</span>
                </button>
              </div>
            </div>
          </main>

          <RightRail quests={quests} leaderboard={leaderboard} />
        </div>
      </div>
    </div>
  );
}
