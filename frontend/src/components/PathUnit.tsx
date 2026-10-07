'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { BookOpen, Trophy, Gift, Sparkles, X, ArrowRight, Check } from 'lucide-react';
import { Unit, Skill } from '@/types';
import { SkillNode } from './SkillNode';
import { DuoMascot } from './DuoMascot';
import { playTapSound } from '@/lib/sound';

interface PathUnitProps {
  unit: Unit;
  activeSkillId?: number | null;
}

export const PathUnit: React.FC<PathUnitProps> = ({ unit, activeSkillId }) => {
  const router = useRouter();
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [showGuidebook, setShowGuidebook] = useState(false);
  const [chestOpened, setChestOpened] = useState(false);

  // Serpentine offset sequence: center, left, right, center
  const offsets = [0, -45, 45, 0, -35, 35];

  // Color schemes for units
  const isGreen = unit.color === 'green';
  const headerBg = isGreen ? 'bg-[#58cc02]' : 'bg-[#1cb0f6]';
  const headerBorder = isGreen ? 'border-[#46a302]' : 'border-[#1899d6]';
  const guidebookBtnBg = isGreen ? 'bg-[#46a302]' : 'bg-[#1899d6]';

  const handleStartLesson = (lessonId: number) => {
    playTapSound();
    router.push(`/lesson/${lessonId}`);
  };

  // Find next uncompleted lesson in the skill
  const getNextLessonId = (skill: Skill): number => {
    const uncompleted = skill.lessons.find(l => !l.completed);
    return uncompleted ? uncompleted.id : skill.lessons[0]?.id || 1;
  };

  return (
    <section className="mb-14 relative">
      {/* Unit Header Banner */}
      <div
        className={`rounded-3xl p-5 mb-8 text-white border-b-6 shadow-md ${headerBg} ${headerBorder} relative overflow-hidden`}
      >
        <div className="flex items-center justify-between">
          <div className="max-w-[70%]">
            <span className="text-xs font-black uppercase tracking-wider text-white/80">
              Unit {unit.unit_number}
            </span>
            <h3 className="text-xl font-black mt-0.5 leading-snug">{unit.title}</h3>
            <p className="text-xs font-bold text-white/90 mt-1">{unit.description}</p>
          </div>

          <button
            onClick={() => { playTapSound(); setShowGuidebook(true); }}
            className={`flex items-center gap-2 px-3.5 py-2.5 rounded-2xl ${guidebookBtnBg} hover:brightness-110 active:translate-y-0.5 border-b-3 border-black/20 text-xs font-black uppercase tracking-wider shadow transition`}
          >
            <BookOpen className="w-4 h-4" />
            <span className="hidden sm:inline">Guidebook</span>
          </button>
        </div>
      </div>

      {/* Path Stepping Stones & Skills */}
      <div className="flex flex-col items-center relative py-4">
        {unit.skills.map((skill, index) => {
          const offset = offsets[index % offsets.length];
          const isActive = skill.id === activeSkillId || (index === 0 && !activeSkillId && skill.status === 'available');

          return (
            <div key={skill.id} className="relative flex flex-col items-center">
              {/* Floating Duo Mascot beside the current active skill */}
              {isActive && (
                <div
                  className="absolute -top-6 z-20 flex items-center transition-all animate-bounce"
                  style={{
                    left: offset <= 0 ? '70px' : '-110px',
                  }}
                >
                  <DuoMascot mood="happy" size={70} />
                  <div
                    className={`bg-white text-gray-800 text-[11px] font-black uppercase tracking-wider py-1.5 px-3 rounded-2xl shadow-lg border-2 border-gray-200 ml-1 whitespace-nowrap relative ${
                      offset > 0 ? 'order-first mr-1 ml-0' : ''
                    }`}
                  >
                    START HERE!
                  </div>
                </div>
              )}

              {/* The Skill Node */}
              <SkillNode
                skill={skill}
                offsetPx={offset}
                isCurrentActive={isActive}
                onSelectSkill={(s) => setSelectedSkill(s)}
              />
            </div>
          );
        })}

        {/* Milestone Treasure Chest */}
        <div className="my-6 relative flex flex-col items-center">
          <button
            onClick={() => {
              playTapSound();
              setChestOpened(true);
            }}
            className={`w-16 h-16 rounded-2xl flex items-center justify-center border-b-4 transition-all shadow-md ${
              chestOpened
                ? 'bg-amber-100 border-amber-300'
                : 'bg-amber-400 border-amber-600 hover:brightness-105 active:translate-y-1'
            }`}
          >
            {chestOpened ? (
              <Sparkles className="w-8 h-8 text-amber-500 animate-spin" />
            ) : (
              <Gift className="w-8 h-8 text-white" />
            )}
          </button>
          <span className="text-[11px] font-black uppercase text-amber-600 mt-1">
            {chestOpened ? '+20 Gems Claimed!' : 'Bonus Chest'}
          </span>
        </div>

        {/* Unit Checkpoint Trophy */}
        <div className="my-4 flex flex-col items-center">
          <div className="w-20 h-20 rounded-full bg-slate-100 border-4 border-slate-300 flex items-center justify-center shadow-inner">
            <Trophy className="w-10 h-10 text-slate-400" />
          </div>
          <span className="text-xs font-black uppercase text-slate-400 mt-2">
            Unit {unit.unit_number} Review
          </span>
        </div>
      </div>

      {/* Skill Popover / Start Lesson Modal */}
      {selectedSkill && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border-2 border-gray-200 text-center relative animate-in zoom-in-95 duration-150">
            <button
              onClick={() => setSelectedSkill(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-16 h-16 mx-auto mb-3 bg-emerald-100 rounded-full flex items-center justify-center">
              <DuoMascot mood="happy" size={54} />
            </div>

            <h3 className="text-2xl font-black text-gray-800 mb-1">{selectedSkill.title}</h3>
            <p className="text-xs font-bold text-gray-500 mb-4">{selectedSkill.description}</p>

            <div className="bg-gray-50 rounded-2xl p-3.5 mb-5 border border-gray-200 flex items-center justify-between text-xs font-bold text-gray-600">
              <span>
                Lesson {Math.min(selectedSkill.completed_lessons + 1, selectedSkill.total_lessons)} of{' '}
                {selectedSkill.total_lessons}
              </span>
              <span className="text-amber-500 font-extrabold flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> +15 XP
              </span>
            </div>

            {/* Lesson List */}
            <div className="flex flex-col gap-2 mb-5">
              {selectedSkill.lessons.map((lesson) => (
                <div
                  key={lesson.id}
                  className={`flex items-center justify-between p-3 rounded-2xl border text-xs font-extrabold ${
                    lesson.completed
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                      : 'bg-white border-gray-200 text-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {lesson.completed ? (
                      <Check className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <div className="w-2.5 h-2.5 rounded-full bg-gray-300" />
                    )}
                    <span>{lesson.title}</span>
                  </div>
                  <button
                    onClick={() => handleStartLesson(lesson.id)}
                    className="px-3 py-1 bg-[#58cc02] text-white rounded-xl text-[11px] font-black uppercase tracking-wider hover:brightness-105 active:translate-y-0.5"
                  >
                    {lesson.completed ? 'Review' : 'Play'}
                  </button>
                </div>
              ))}
            </div>

            <button
              onClick={() => handleStartLesson(getNextLessonId(selectedSkill))}
              className="w-full py-3.5 px-4 rounded-2xl bg-[#58cc02] text-white font-extrabold text-sm uppercase tracking-wider border-b-4 border-[#46a302] active:translate-y-0.5 active:border-b-0 hover:brightness-105 shadow-md flex items-center justify-center gap-2"
            >
              <span>START +15 XP</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Guidebook Modal */}
      {showGuidebook && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border-2 border-gray-200 relative max-h-[85vh] overflow-y-auto">
            <button
              onClick={() => setShowGuidebook(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-[#58cc02] flex items-center justify-center text-white">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-black uppercase text-gray-400">Unit {unit.unit_number} Guidebook</span>
                <h3 className="text-xl font-black text-gray-800">{unit.title}</h3>
              </div>
            </div>

            <div className="space-y-4 text-sm text-gray-600">
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
                <h4 className="font-black text-emerald-900 mb-1 text-xs uppercase tracking-wider">
                  Key Vocabulary Phrases
                </h4>
                <ul className="space-y-1.5 text-xs text-emerald-950 font-bold">
                  <li>• <span className="font-extrabold">¡Hola!</span> — Hello / Hi</li>
                  <li>• <span className="font-extrabold">Buenos días</span> — Good morning</li>
                  <li>• <span className="font-extrabold">Por favor</span> — Please</li>
                  <li>• <span className="font-extrabold">Muchas gracias</span> — Thank you very much</li>
                  <li>• <span className="font-extrabold">¿Dónde está...?</span> — Where is...?</li>
                </ul>
              </div>

              <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200">
                <h4 className="font-black text-blue-900 mb-1 text-xs uppercase tracking-wider">
                  Grammar Tip: Articles in Spanish
                </h4>
                <p className="text-xs text-blue-950 leading-relaxed font-medium">
                  Nouns in Spanish are either masculine or feminine.
                  Use <span className="font-bold">el</span> for masculine singular nouns (e.g. <em>el niño</em>, <em>el café</em>) and <span className="font-bold">la</span> for feminine singular nouns (e.g. <em>la mujer</em>, <em>la manzana</em>).
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowGuidebook(false)}
              className="mt-6 w-full py-3 rounded-2xl bg-[#58cc02] text-white font-black text-xs uppercase tracking-wider border-b-4 border-[#46a302] hover:brightness-105 active:translate-y-0.5"
            >
              Got It!
            </button>
          </div>
        </div>
      )}
    </section>
  );
};
