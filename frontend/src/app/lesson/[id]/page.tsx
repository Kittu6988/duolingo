'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { LessonDetail, User } from '@/types';
import { getLesson, getUser } from '@/lib/api';
import { LessonPlayer } from '@/components/LessonPlayer';
import { DuoMascot } from '@/components/DuoMascot';
import { RefreshCw, ArrowLeft } from 'lucide-react';

function LessonContent() {
  const router = useRouter();
  const routeParams = useParams();
  const lessonId = typeof routeParams?.id === 'string' ? parseInt(routeParams.id, 10) : 1;

  const [lesson, setLesson] = useState<LessonDetail | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      if (!lessonId) return;
      try {
        setLoading(true);
        const [lData, uData] = await Promise.all([
          getLesson(lessonId),
          getUser(),
        ]);
        setLesson(lData);
        setUser(uData);
      } catch (err: unknown) {
        console.error('Failed to load lesson:', err);
        setError('Lesson could not be loaded. Please check that the server is online.');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [lessonId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 gap-4">
        <DuoMascot mood="thinking" size={120} />
        <div className="flex items-center gap-2 text-gray-400 font-black text-sm">
          <RefreshCw className="w-5 h-5 animate-spin" />
          <span>Preparing Your Lesson Exercises...</span>
        </div>
      </div>
    );
  }

  if (error || !lesson || !user) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
        <DuoMascot mood="sad" size={120} className="mb-4" />
        <h2 className="text-2xl font-black text-gray-800 mb-2">Lesson Not Available</h2>
        <p className="text-sm font-bold text-gray-500 max-w-sm mb-6">
          {error || 'Unable to retrieve exercise questions for this lesson.'}
        </p>
        <button
          onClick={() => router.push('/')}
          className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#58cc02] text-white font-black text-xs uppercase tracking-wider border-b-4 border-[#46a302] hover:brightness-105 active:translate-y-0.5"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Learning Path
        </button>
      </div>
    );
  }

  return <LessonPlayer lesson={lesson} initialUser={user} />;
}

export default function LessonPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 gap-4">
          <DuoMascot mood="happy" size={100} />
          <div className="flex items-center gap-2 text-gray-400 font-black text-sm">
            <RefreshCw className="w-5 h-5 animate-spin" />
            <span>Loading Lesson...</span>
          </div>
        </div>
      }
    >
      <LessonContent />
    </Suspense>
  );
}
