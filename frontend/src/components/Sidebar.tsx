'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Shield,
  Target,
  Store,
  User as UserIcon,
  HeartPulse,
  Sparkles
} from 'lucide-react';
import { DuoMascot } from './DuoMascot';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

export const Sidebar: React.FC = () => {
  const pathname = usePathname();

  const navItems: NavItem[] = [
    { label: 'LEARN', href: '/', icon: <Home className="w-7 h-7" /> },
    { label: 'LEADERBOARDS', href: '/leaderboard', icon: <Shield className="w-7 h-7" /> },
    { label: 'QUESTS', href: '/quests', icon: <Target className="w-7 h-7" /> },
    { label: 'SHOP', href: '/shop', icon: <Store className="w-7 h-7" /> },
    { label: 'PROFILE', href: '/profile', icon: <UserIcon className="w-7 h-7" /> },
    { label: 'PRACTICE', href: '/practice', icon: <HeartPulse className="w-7 h-7 text-rose-500" /> },
  ];

  return (
    <>
      {/* Desktop Left Sidebar */}
      <aside className="hidden md:flex flex-col w-64 h-screen fixed left-0 top-0 border-r-2 border-gray-200 bg-white px-4 py-6 z-40 select-none">
        {/* Duolingo Brand Header */}
        <Link href="/" className="flex items-center gap-3 px-3 mb-8 group">
          <DuoMascot mood="happy" size={42} />
          <span className="text-3xl font-extrabold tracking-tight text-[#58cc02] group-hover:scale-105 transition-transform">
            duolingo
          </span>
        </Link>

        {/* Navigation Items */}
        <nav className="flex flex-col gap-2 flex-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-4 px-4 py-3 rounded-2xl text-sm font-black tracking-wider transition-all duration-150 uppercase
                  ${
                    isActive
                      ? 'bg-[#ddf4ff] text-[#1cb0f6] border-2 border-[#84d8ff]'
                      : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700 border-2 border-transparent'
                  }`}
              >
                <span className={`${isActive ? 'text-[#1cb0f6]' : 'text-gray-400'}`}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Super Duolingo Promotion Mini Card */}
        <div className="mt-auto p-4 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-md relative overflow-hidden">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-5 h-5 text-amber-300 animate-spin" />
            <span className="font-extrabold text-xs uppercase tracking-wider text-amber-200">SUPER</span>
          </div>
          <p className="text-xs font-bold leading-snug mb-3">Unlimited hearts & no ads with Super Duolingo</p>
          <Link
            href="/shop"
            className="block text-center text-xs font-black py-2 px-3 bg-white text-indigo-700 rounded-xl uppercase tracking-wider shadow active:translate-y-0.5 hover:bg-gray-50"
          >
            Try Free
          </Link>
        </div>
      </aside>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t-2 border-gray-200 flex items-center justify-around px-2 z-50">
        {navItems.slice(0, 5).map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center p-2 rounded-xl transition-colors ${
                isActive ? 'text-[#1cb0f6]' : 'text-gray-400'
              }`}
            >
              {item.icon}
            </Link>
          );
        })}
      </nav>
    </>
  );
};
