from pydantic import BaseModel
from typing import List, Optional, Any
from datetime import datetime

class ExerciseOut(BaseModel):
    id: int
    lesson_id: int
    type: str  # multiple_choice, translate, match_pairs, fill_blank, type_answer
    prompt: str
    question: str
    audio_text: Optional[str] = None
    correct_answer: str
    options_json: Optional[str] = None
    explanation: Optional[str] = None
    order_index: int

    class Config:
        from_attributes = True

class LessonBrief(BaseModel):
    id: int
    skill_id: int
    title: str
    xp_reward: int
    order_index: int
    completed: bool = False

    class Config:
        from_attributes = True

class LessonDetail(BaseModel):
    id: int
    skill_id: int
    title: str
    xp_reward: int
    order_index: int
    exercises: List[ExerciseOut]

    class Config:
        from_attributes = True

class SkillOut(BaseModel):
    id: int
    unit_id: int
    title: str
    description: Optional[str] = None
    icon: str
    total_lessons: int
    order_index: int
    status: str = "locked"  # "locked", "available", "completed"
    completed_lessons: int = 0
    crown_level: int = 0
    is_legendary: bool = False
    lessons: List[LessonBrief] = []

    class Config:
        from_attributes = True

class UnitOut(BaseModel):
    id: int
    course_id: str
    unit_number: int
    title: str
    description: str
    color: str
    order_index: int
    skills: List[SkillOut] = []

    class Config:
        from_attributes = True

class CourseOut(BaseModel):
    id: str
    title: str
    description: Optional[str] = None
    flag_emoji: str
    total_xp: int
    units: List[UnitOut] = []

    class Config:
        from_attributes = True

class UserOut(BaseModel):
    id: int
    username: str
    display_name: str
    email: str
    avatar: str
    xp: int
    streak: int
    hearts: int
    max_hearts: int
    gems: int
    league: str
    last_active_date: str
    streak_freeze_count: int
    created_at: datetime

    class Config:
        from_attributes = True

class UserUpdate(BaseModel):
    display_name: Optional[str] = None
    avatar: Optional[str] = None

class LessonSubmitRequest(BaseModel):
    accuracy: float = 100.0
    hearts_lost: int = 0
    mistakes_count: int = 0

class LessonSubmitResponse(BaseModel):
    success: bool
    xp_gained: int
    total_xp: int
    hearts_remaining: int
    streak: int
    leveled_up: bool
    new_crown_level: int
    next_unlocked_skill_id: Optional[int] = None
    quests_completed: List[str] = []

class PracticeResponse(BaseModel):
    success: bool
    hearts_restored: int
    current_hearts: int
    xp_gained: int
    total_xp: int

class LeaderboardUserOut(BaseModel):
    id: int
    username: str
    display_name: str
    avatar: str
    xp: int
    league: str
    rank: int
    is_user: bool = False

    class Config:
        from_attributes = True

class QuestOut(BaseModel):
    id: str
    title: str
    description: str
    icon: str
    target: int
    xp_reward: int
    gem_reward: int
    quest_type: str
    current_progress: int = 0
    completed: bool = False
    claimed: bool = False

    class Config:
        from_attributes = True

class ShopItemOut(BaseModel):
    id: str
    title: str
    description: str
    icon: str
    cost_gems: int
    item_type: str

    class Config:
        from_attributes = True

class ShopPurchaseRequest(BaseModel):
    item_id: str

class ShopPurchaseResponse(BaseModel):
    success: bool
    message: str
    gems_remaining: int
    hearts: Optional[int] = None
    streak_freeze_count: Optional[int] = None
