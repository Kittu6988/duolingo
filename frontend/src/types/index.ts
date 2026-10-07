export interface Exercise {
  id: number;
  lesson_id: number;
  type: 'multiple_choice' | 'translate' | 'match_pairs' | 'fill_blank' | 'type_answer';
  prompt: string;
  question: string;
  audio_text?: string;
  correct_answer: string;
  options_json?: string;
  explanation?: string;
  order_index: number;
}

export interface LessonBrief {
  id: number;
  skill_id: number;
  title: string;
  xp_reward: number;
  order_index: number;
  completed: boolean;
}

export interface LessonDetail {
  id: number;
  skill_id: number;
  title: string;
  xp_reward: number;
  order_index: number;
  exercises: Exercise[];
}

export interface Skill {
  id: number;
  unit_id: number;
  title: string;
  description?: string;
  icon: string;
  total_lessons: number;
  order_index: number;
  status: 'locked' | 'available' | 'completed';
  completed_lessons: number;
  crown_level: number;
  is_legendary: boolean;
  lessons: LessonBrief[];
}

export interface Unit {
  id: number;
  course_id: string;
  unit_number: number;
  title: string;
  description: string;
  color: string;
  order_index: number;
  skills: Skill[];
}

export interface Course {
  id: string;
  title: string;
  description?: string;
  flag_emoji: string;
  total_xp: number;
  units: Unit[];
}

export interface User {
  id: number;
  username: string;
  display_name: string;
  email: string;
  avatar: string;
  xp: number;
  streak: number;
  hearts: number;
  max_hearts: number;
  gems: number;
  league: string;
  last_active_date: string;
  streak_freeze_count: number;
  created_at: string;
}

export interface LessonSubmitRequest {
  accuracy: number;
  hearts_lost: number;
  mistakes_count: number;
}

export interface LessonSubmitResponse {
  success: boolean;
  xp_gained: number;
  total_xp: number;
  hearts_remaining: number;
  streak: number;
  leveled_up: boolean;
  new_crown_level: number;
  next_unlocked_skill_id?: number | null;
  quests_completed: string[];
}

export interface PracticeResponse {
  success: boolean;
  hearts_restored: number;
  current_hearts: number;
  xp_gained: number;
  total_xp: number;
}

export interface LeaderboardUser {
  id: number;
  username: string;
  display_name: string;
  avatar: string;
  xp: number;
  league: string;
  rank: number;
  is_user: boolean;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  icon: string;
  target: number;
  xp_reward: number;
  gem_reward: number;
  quest_type: 'xp' | 'lessons' | 'accuracy';
  current_progress: number;
  completed: boolean;
  claimed: boolean;
}

export interface ShopItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  cost_gems: number;
  item_type: string;
}

export interface ShopPurchaseResponse {
  success: boolean;
  message: string;
  gems_remaining: number;
  hearts?: number;
  streak_freeze_count?: number;
}
