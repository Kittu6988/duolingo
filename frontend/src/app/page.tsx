'use client';

import React, { useEffect, useState } from 'react';
import { Course, User, Quest, LeaderboardUser } from '@/types';
import { getLearningPath, getUser, getQuests, getLeaderboard } from '@/lib/api';
import { Sidebar } from '@/components/Sidebar';
import { TopBar } from '@/components/TopBar';
import { RightRail } from '@/components/RightRail';
import { PathUnit } from '@/components/PathUnit';
import { DuoMascot } from '@/components/DuoMascot';
import { Sparkles, RefreshCw } from 'lucide-react';

export default function HomePage() {
  const [course, setCourse] = useState<Course | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [quests, setQuests] = useState<Quest[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [courseData, userData, questsData, leaderboardData] = await Promise.all([
        getLearningPath('es-en'),
        getUser(),
        getQuests(),
        getLeaderboard(),
      ]);
      setCourse(courseData);
      setUser(userData);
      setQuests(questsData);
      setLeaderboard(leaderboardData);
    } catch (err: unknown) {
      console.error('Error loading data:', err);
      setError('Could not connect to backend server. Make sure the FastAPI backend is running on port 8000.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Find currently active skill
  let activeSkillId: number | null = null;
  if (course) {
    for (const unit of course.units) {
      for (const skill of unit.skills) {
        if (skill.status === 'available') {
          activeSkillId = skill.id;
          break;
        }
      }
      if (activeSkillId) break;
    }
  }

  return (
    <div className="min-h-screen bg-white text-gray-800 flex">
      {/* Left Navigation Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
        {/* Top Sticky Bar */}
        <TopBar user={user} onUserUpdate={(u) => setUser(u)} />

        {/* Learning Path Container */}
        <div className="flex-1 flex justify-center px-4 py-8 pb-24 md:pb-12">
          <main className="w-full max-w-xl mx-auto">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-24 gap-4">
                <DuoMascot mood="thinking" size={100} />
                <div className="flex items-center gap-2 text-gray-400 font-bold text-sm">
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span>Loading Spanish Course Path...</span>
                </div>
              </div>
            ) : error ? (
              <div className="p-6 rounded-3xl bg-rose-50 border-2 border-rose-200 text-center my-12">
                <DuoMascot mood="sad" size={80} className="mx-auto mb-3" />
                <h3 className="text-xl font-black text-rose-600 mb-2">Connection Notice</h3>
                <p className="text-xs font-bold text-gray-600 mb-5">{error}</p>
                <button
                  onClick={loadData}
                  className="px-6 py-2.5 rounded-2xl bg-[#58cc02] text-white font-black text-xs uppercase tracking-wider border-b-4 border-[#46a302] hover:brightness-105 active:translate-y-0.5"
                >
                  Retry Connection
                </button>
              </div>
            ) : course ? (
              <div>
                {/* Course Header Banner */}
                <div className="flex items-center justify-between mb-8 pb-4 border-b-2 border-gray-100">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">🇪🇸</span>
                    <div>
                      <h2 className="text-2xl font-black text-gray-800">Spanish Course</h2>
                      <p className="text-xs font-bold text-gray-400">
                        {course.units.length} Units • {course.total_xp} Total XP Available
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 text-xs font-black">
                    <Sparkles className="w-4 h-4 fill-amber-500" />
                    <span>{user?.xp ?? 0} XP Earned</span>
                  </div>
                </div>

                {/* Units and Skills Path */}
                {course.units.map((unit) => (
                  <PathUnit
                    key={unit.id}
                    unit={unit}
                    activeSkillId={activeSkillId}
                  />
                ))}
              </div>
            ) : null}
          </main>

          {/* Right Rail Widgets */}
          <RightRail quests={quests} leaderboard={leaderboard} />
        </div>
      </div>
    </div>
  );
}
