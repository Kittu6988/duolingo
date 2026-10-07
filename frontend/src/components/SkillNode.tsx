'use client';

import React from 'react';
import {
  BookOpen,
  Coffee,
  MessageCircle,
  Plane,
  Heart,
  Crown,
  Lock,
  Check,
  Star,
  Sparkles
} from 'lucide-react';
import { Skill } from '@/types';
import { playTapSound } from '@/lib/sound';

interface SkillNodeProps {
  skill: Skill;
  offsetPx: number;
  isCurrentActive: boolean;
  onSelectSkill: (skill: Skill) => void;
}

export const SkillNode: React.FC<SkillNodeProps> = ({
  skill,
  offsetPx,
  isCurrentActive,
  onSelectSkill,
}) => {
  // Map icon string to Lucide icon
  const getIcon = () => {
    switch (skill.icon) {
      case 'coffee':
        return <Coffee className="w-8 h-8 text-white" />;
      case 'chat':
        return <MessageCircle className="w-8 h-8 text-white" />;
      case 'plane':
        return <Plane className="w-8 h-8 text-white" />;
      case 'heart':
        return <Heart className="w-8 h-8 text-white fill-white" />;
      case 'star':
        return <Star className="w-8 h-8 text-white fill-white" />;
      case 'book':
      default:
        return <BookOpen className="w-8 h-8 text-white" />;
    }
  };

  const isCompleted = skill.status === 'completed';
  const isAvailable = skill.status === 'available';
  const isLocked = skill.status === 'locked';

  // Progress percentage (0 to 100)
  const progressRatio = skill.total_lessons > 0 ? skill.completed_lessons / skill.total_lessons : 0;
  const circumference = 2 * Math.PI * 45; // radius 45 -> circumference approx 282.7
  const strokeDashoffset = circumference - progressRatio * circumference;

  // Button styles based on state
  let buttonBg = 'bg-[#58cc02]';
  let buttonBorder = 'border-[#46a302]';
  let iconColor = 'text-white';

  if (isCompleted) {
    buttonBg = 'bg-[#ffc800]';
    buttonBorder = 'border-[#e5a500]';
  } else if (isLocked) {
    buttonBg = 'bg-gray-200';
    buttonBorder = 'border-gray-300';
    iconColor = 'text-gray-400';
  }

  const handleClick = () => {
    playTapSound();
    onSelectSkill(skill);
  };

  return (
    <div
      className="relative flex flex-col items-center my-6 select-none transition-transform"
      style={{ transform: `translateX(${offsetPx}px)` }}
    >
      {/* Active Pulse Animation if Current Active Skill */}
      {isCurrentActive && (
        <div className="absolute -inset-3 rounded-full bg-[#58cc02]/20 animate-ping pointer-events-none" />
      )}

      {/* Main Node Container */}
      <div className="relative group">
        {/* Progress SVG Ring around button (only for available in-progress skills) */}
        {isAvailable && (
          <svg
            className="absolute -top-2.5 -left-2.5 w-[100px] h-[100px] -rotate-90 pointer-events-none"
            viewBox="0 0 100 100"
          >
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="#e5e5e5"
              strokeWidth="6"
            />
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="#58cc02"
              strokeWidth="6"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-700 ease-out"
            />
          </svg>
        )}

        {/* 3D Tactile Button */}
        <button
          onClick={handleClick}
          disabled={isLocked}
          className={`relative w-20 h-20 rounded-full flex items-center justify-center border-b-6 active:border-b-0 active:translate-y-1.5 transition-all shadow-md group-hover:scale-105 ${buttonBg} ${buttonBorder} ${
            isLocked ? 'cursor-not-allowed opacity-75' : 'cursor-pointer hover:brightness-105'
          }`}
        >
          {isLocked ? (
            <Lock className="w-8 h-8 text-gray-400" />
          ) : isCompleted ? (
            <Check className="w-10 h-10 text-white stroke-[3.5]" />
          ) : (
            getIcon()
          )}

          {/* Crown badge on top-right if completed or crowns earned */}
          {skill.crown_level > 0 && (
            <div className="absolute -top-1 -right-1 bg-amber-400 text-white border-2 border-amber-600 rounded-full w-6 h-6 flex items-center justify-center text-[10px] font-black shadow">
              <Crown className="w-3.5 h-3.5 fill-white" />
            </div>
          )}
        </button>
      </div>

      {/* Skill Title Badge below */}
      <div className="mt-2 text-center">
        <span
          className={`text-xs font-black tracking-wide uppercase px-2.5 py-0.5 rounded-full ${
            isLocked ? 'text-gray-400' : 'text-gray-700'
          }`}
        >
          {skill.title}
        </span>
      </div>
    </div>
  );
};
