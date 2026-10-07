'use client';

import React, { useEffect, useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { TopBar } from '@/components/TopBar';
import { RightRail } from '@/components/RightRail';
import { LeaderboardUser, User, Quest } from '@/types';
import { getLeaderboard, getUser, getQuests } from '@/lib/api';
import { Shield, Trophy, Medal, ArrowUp, Clock, RefreshCw } from 'lucide-react';

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [quests, setQuests] = useState<Quest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [lData, uData, qData] = await Promise.all([
          getLeaderboard(),
          getUser(),
          getQuests(),
        ]);
        setLeaderboard(lData);
        setUser(uData);
        setQuests(qData);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const getAvatarEmoji = (avatar: string) => {
    switch (avatar) {
      case 'duo-owl': return '🦉';
      case 'fox': return '🦊';
      case 'bear': return '🐻';
      case 'cat': return '🐱';
      case 'dog': return '🐶';
      case 'frog': return '🐸';
      case 'koala': return '🐨';
      case 'panda': return '🐼';
      case 'tiger': return '🐯';
      default: return '🦉';
    }
  };

  return (
    <div className="min-h-screen bg-white text-gray-800 flex">
      <Sidebar />

      <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
        <TopBar user={user} onUserUpdate={(u) => setUser(u)} />

        <div className="flex-1 flex justify-center px-4 py-8 pb-24 md:pb-12">
          <main className="w-full max-w-xl mx-auto">
            {/* Header Banner */}
            <div className="flex flex-col items-center text-center mb-8">
              <div className="w-20 h-20 rounded-3xl bg-slate-100 border-4 border-slate-300 flex items-center justify-center mb-3 shadow-md">
                <Shield className="w-10 h-10 text-slate-500 fill-slate-400" />
              </div>
              <h1 className="text-3xl font-black text-gray-800 mb-1">Silver League</h1>
              <div className="flex items-center gap-1.5 text-xs font-black text-gray-400 uppercase tracking-wider">
                <Clock className="w-4 h-4" />
                <span>3 days left • Top 3 advance to Gold League</span>
              </div>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <RefreshCw className="w-6 h-6 text-gray-400 animate-spin" />
                <span className="text-xs font-bold text-gray-400">Loading League Standings...</span>
              </div>
            ) : (
              <div className="rounded-3xl border-2 border-gray-200 overflow-hidden shadow-xs bg-white">
                {/* Promotion Zone Notification */}
                <div className="bg-emerald-50 border-b border-emerald-200 px-4 py-2 flex items-center justify-between text-xs font-black text-emerald-800">
                  <span className="flex items-center gap-1">
                    <ArrowUp className="w-4 h-4 text-emerald-600" />
                    PROMOTION ZONE
                  </span>
                  <span className="text-[11px] text-emerald-600">Top 3 advance</span>
                </div>

                <div className="divide-y divide-gray-100">
                  {leaderboard.map((item, index) => {
                    const isPromotion = item.rank <= 3;
                    const isDemotion = item.rank > 8;

                    return (
                      <React.Fragment key={item.id}>
                        {index === 3 && (
                          <div className="bg-gray-50 px-4 py-1.5 text-[11px] font-black uppercase text-gray-400 tracking-wider text-center border-t border-b border-gray-100">
                            Safe Zone
                          </div>
                        )}
                        {index === 8 && (
                          <div className="bg-rose-50 px-4 py-1.5 text-[11px] font-black uppercase text-rose-500 tracking-wider text-center border-t border-b border-rose-200">
                            Demotion Zone
                          </div>
                        )}

                        <div
                          className={`flex items-center justify-between p-4 transition ${
                            item.is_user
                              ? 'bg-[#ddf4ff] font-black border-l-4 border-l-[#1cb0f6]'
                              : 'hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center gap-4">
                            {/* Rank Indicator */}
                            <div className="w-8 flex items-center justify-center">
                              {item.rank === 1 ? (
                                <Trophy className="w-6 h-6 text-amber-500 fill-amber-400" />
                              ) : item.rank === 2 ? (
                                <Medal className="w-6 h-6 text-slate-400 fill-slate-300" />
                              ) : item.rank === 3 ? (
                                <Medal className="w-6 h-6 text-amber-700 fill-amber-600" />
                              ) : (
                                <span
                                  className={`text-sm font-black ${
                                    item.is_user ? 'text-[#1cb0f6]' : 'text-gray-400'
                                  }`}
                                >
                                  {item.rank}
                                </span>
                              )}
                            </div>

                            {/* Avatar */}
                            <div className="w-10 h-10 rounded-2xl bg-gray-100 border border-gray-200 flex items-center justify-center text-xl shrink-0 shadow-xs">
                              {getAvatarEmoji(item.avatar)}
                            </div>

                            {/* Name */}
                            <div>
                              <span
                                className={`text-sm block ${
                                  item.is_user
                                    ? 'text-[#1cb0f6] font-black'
                                    : 'text-gray-800 font-extrabold'
                                }`}
                              >
                                {item.display_name}
                              </span>
                              {item.is_user && (
                                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">
                                  Current User
                                </span>
                              )}
                            </div>
                          </div>

                          {/* XP */}
                          <div className="text-right">
                            <span
                              className={`text-sm font-black ${
                                item.is_user ? 'text-[#1cb0f6]' : 'text-gray-600'
                              }`}
                            >
                              {item.xp} XP
                            </span>
                          </div>
                        </div>
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>
            )}
          </main>

          <RightRail quests={quests} leaderboard={leaderboard} />
        </div>
      </div>
    </div>
  );
}
