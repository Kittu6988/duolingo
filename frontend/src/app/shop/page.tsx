'use client';

import React, { useEffect, useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { TopBar } from '@/components/TopBar';
import { RightRail } from '@/components/RightRail';
import { ShopItem, User, Quest, LeaderboardUser } from '@/types';
import { getShopItems, getUser, getQuests, getLeaderboard, buyShopItem, simulateDay } from '@/lib/api';
import { Store, Heart, Snowflake, Flame, Shirt, Gem, Check, Sparkles, RefreshCw } from 'lucide-react';
import { playCorrectSound, playTapSound } from '@/lib/sound';
import confetti from 'canvas-confetti';

export default function ShopPage() {
  const [items, setItems] = useState<ShopItem[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [quests, setQuests] = useState<Quest[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasingId, setPurchasingId] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [shopData, uData, qData, lData] = await Promise.all([
        getShopItems(),
        getUser(),
        getQuests(),
        getLeaderboard(),
      ]);
      setItems(shopData);
      setUser(uData);
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

  const handleBuy = async (item: ShopItem) => {
    if (!user || user.gems < item.cost_gems) {
      setNotification(`Not enough gems! You need ${item.cost_gems} gems to buy ${item.title}.`);
      return;
    }

    try {
      playTapSound();
      setPurchasingId(item.id);
      const res = await buyShopItem(item.id);

      playCorrectSound();
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.5 }
      });

      setNotification(`🎉 ${res.message}`);
      // Refresh user
      const updatedUser = await getUser();
      setUser(updatedUser);
    } catch (err: unknown) {
      setNotification(err instanceof Error ? err.message : 'Purchase failed');
    } finally {
      setPurchasingId(null);
      setTimeout(() => setNotification(null), 4000);
    }
  };

  const handleAddDemoGems = async () => {
    playTapSound();
    try {
      const updated = await simulateDay('add_gems');
      setUser(updated);
      setNotification('Added +200 Demo Gems to your wallet!');
      setTimeout(() => setNotification(null), 3000);
    } catch (e) {
      console.error(e);
    }
  };

  const getItemIcon = (icon: string) => {
    switch (icon) {
      case 'heart':
        return <Heart className="w-8 h-8 text-rose-500 fill-rose-500" />;
      case 'snowflake':
        return <Snowflake className="w-8 h-8 text-blue-400" />;
      case 'gem':
        return <Flame className="w-8 h-8 text-orange-500" />;
      case 'shirt':
        return <Shirt className="w-8 h-8 text-indigo-500" />;
      default:
        return <Gem className="w-8 h-8 text-blue-500" />;
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
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-3xl bg-blue-100 flex items-center justify-center">
                  <Store className="w-9 h-9 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-3xl font-black text-gray-800">Shop</h1>
                  <p className="text-xs font-bold text-gray-400">Power-ups, heart refills, and streak freezes</p>
                </div>
              </div>

              {/* Demo Gems Button for Testing */}
              <button
                onClick={handleAddDemoGems}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-blue-50 border-2 border-blue-200 text-blue-600 text-xs font-black uppercase tracking-wider hover:bg-blue-100 active:translate-y-0.5 transition"
                title="Add 200 demo gems to test purchasing"
              >
                <Sparkles className="w-4 h-4" />
                <span>+200 Test Gems</span>
              </button>
            </div>

            {/* Toast Notification */}
            {notification && (
              <div className="p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-300 text-emerald-800 font-extrabold text-xs mb-6 animate-in fade-in">
                {notification}
              </div>
            )}

            {loading ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <RefreshCw className="w-6 h-6 text-gray-400 animate-spin" />
                <span className="text-xs font-bold text-gray-400">Loading Shop Items...</span>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {items.map((item) => {
                  const canAfford = (user?.gems ?? 0) >= item.cost_gems;

                  return (
                    <div
                      key={item.id}
                      className="p-5 rounded-3xl border-2 border-gray-200 bg-white flex items-center justify-between gap-4 transition hover:border-gray-300 shadow-xs"
                    >
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="w-14 h-14 rounded-2xl bg-gray-50 border border-gray-200 flex items-center justify-center shrink-0">
                          {getItemIcon(item.icon)}
                        </div>
                        <div>
                          <h4 className="text-base font-black text-gray-800">{item.title}</h4>
                          <p className="text-xs font-bold text-gray-400 leading-snug">
                            {item.description}
                          </p>
                        </div>
                      </div>

                      {/* Buy Button */}
                      <button
                        onClick={() => handleBuy(item)}
                        disabled={purchasingId === item.id}
                        className={`shrink-0 flex items-center gap-1.5 py-2.5 px-4 rounded-2xl text-xs font-black uppercase tracking-wider border-b-4 transition active:translate-y-0.5 active:border-b-0 ${
                          canAfford
                            ? 'bg-[#1cb0f6] text-white border-[#1899d6] hover:brightness-105'
                            : 'bg-gray-100 text-gray-400 border-gray-300 opacity-70'
                        }`}
                      >
                        <Gem className="w-4 h-4 fill-current" />
                        <span>{purchasingId === item.id ? 'BUYING...' : item.cost_gems}</span>
                      </button>
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
