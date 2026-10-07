import {
  Course,
  LessonDetail,
  LessonSubmitRequest,
  LessonSubmitResponse,
  PracticeResponse,
  User,
  LeaderboardUser,
  Quest,
  ShopItem,
  ShopPurchaseResponse
} from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(errorBody.detail || `HTTP Error ${res.status}: ${res.statusText}`);
  }
  return res.json();
}

export async function getLearningPath(courseId: string = 'es-en'): Promise<Course> {
  const res = await fetch(`${API_BASE_URL}/api/courses/${courseId}/path`, { cache: 'no-store' });
  return handleResponse<Course>(res);
}

export async function getLesson(lessonId: number): Promise<LessonDetail> {
  const res = await fetch(`${API_BASE_URL}/api/lessons/${lessonId}`, { cache: 'no-store' });
  return handleResponse<LessonDetail>(res);
}

export async function completeLesson(
  lessonId: number,
  payload: LessonSubmitRequest
): Promise<LessonSubmitResponse> {
  const res = await fetch(`${API_BASE_URL}/api/lessons/${lessonId}/complete`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  return handleResponse<LessonSubmitResponse>(res);
}

export async function completePractice(): Promise<PracticeResponse> {
  const res = await fetch(`${API_BASE_URL}/api/lessons/practice`, {
    method: 'POST'
  });
  return handleResponse<PracticeResponse>(res);
}

export async function getUser(): Promise<User> {
  const res = await fetch(`${API_BASE_URL}/api/user`, { cache: 'no-store' });
  return handleResponse<User>(res);
}

export async function updateUser(data: { display_name?: string; avatar?: string }): Promise<User> {
  const res = await fetch(`${API_BASE_URL}/api/user`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return handleResponse<User>(res);
}

export async function refillHearts(): Promise<User> {
  const res = await fetch(`${API_BASE_URL}/api/user/refill-hearts`, {
    method: 'POST'
  });
  return handleResponse<User>(res);
}

export async function simulateDay(action: 'advance_and_practice' | 'miss_day' | 'add_gems'): Promise<User> {
  const res = await fetch(`${API_BASE_URL}/api/user/simulate-day?action=${action}`, {
    method: 'POST'
  });
  return handleResponse<User>(res);
}

export async function resetProgress(): Promise<User> {
  const res = await fetch(`${API_BASE_URL}/api/user/reset-progress`, {
    method: 'POST'
  });
  return handleResponse<User>(res);
}

export async function getLeaderboard(): Promise<LeaderboardUser[]> {
  const res = await fetch(`${API_BASE_URL}/api/leaderboard`, { cache: 'no-store' });
  return handleResponse<LeaderboardUser[]>(res);
}

export async function getQuests(): Promise<Quest[]> {
  const res = await fetch(`${API_BASE_URL}/api/quests`, { cache: 'no-store' });
  return handleResponse<Quest[]>(res);
}

export async function claimQuest(questId: string): Promise<Quest> {
  const res = await fetch(`${API_BASE_URL}/api/quests/${questId}/claim`, {
    method: 'POST'
  });
  return handleResponse<Quest>(res);
}

export async function getShopItems(): Promise<ShopItem[]> {
  const res = await fetch(`${API_BASE_URL}/api/shop`, { cache: 'no-store' });
  return handleResponse<ShopItem[]>(res);
}

export async function buyShopItem(itemId: string): Promise<ShopPurchaseResponse> {
  const res = await fetch(`${API_BASE_URL}/api/shop/buy`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ item_id: itemId })
  });
  return handleResponse<ShopPurchaseResponse>(res);
}
