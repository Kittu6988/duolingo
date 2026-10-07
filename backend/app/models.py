from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey, DateTime, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, default="duo_learner")
    display_name = Column(String, default="Alex Learner")
    email = Column(String, default="learner@duolingo.local")
    avatar = Column(String, default="duo-owl")
    xp = Column(Integer, default=120)
    streak = Column(Integer, default=3)
    hearts = Column(Integer, default=5)
    max_hearts = Column(Integer, default=5)
    gems = Column(Integer, default=450)
    league = Column(String, default="Silver League")
    last_active_date = Column(String, default=lambda: datetime.utcnow().strftime("%Y-%m-%d"))
    streak_freeze_count = Column(Integer, default=1)
    created_at = Column(DateTime, default=datetime.utcnow)

    skill_progress = relationship("UserSkillProgress", back_populates="user", cascade="all, delete-orphan")
    lesson_progress = relationship("UserLessonProgress", back_populates="user", cascade="all, delete-orphan")
    quests = relationship("UserQuest", back_populates="user", cascade="all, delete-orphan")


class Course(Base):
    __tablename__ = "courses"

    id = Column(String, primary_key=True)  # e.g., "es-en"
    title = Column(String, nullable=False)
    description = Column(String, nullable=True)
    flag_emoji = Column(String, default="🇪🇸")
    total_xp = Column(Integer, default=1500)

    units = relationship("Unit", back_populates="course", cascade="all, delete-orphan", order_by="Unit.order_index")


class Unit(Base):
    __tablename__ = "units"

    id = Column(Integer, primary_key=True, index=True)
    course_id = Column(String, ForeignKey("courses.id"), nullable=False)
    unit_number = Column(Integer, nullable=False)
    title = Column(String, nullable=False)
    description = Column(String, nullable=False)
    color = Column(String, default="green")  # green, blue, purple, yellow, orange
    order_index = Column(Integer, default=1)

    course = relationship("Course", back_populates="units")
    skills = relationship("Skill", back_populates="unit", cascade="all, delete-orphan", order_by="Skill.order_index")


class Skill(Base):
    __tablename__ = "skills"

    id = Column(Integer, primary_key=True, index=True)
    unit_id = Column(Integer, ForeignKey("units.id"), nullable=False)
    title = Column(String, nullable=False)
    description = Column(String, nullable=True)
    icon = Column(String, default="book")  # book, coffee, chat, bag, plane, crown, star
    total_lessons = Column(Integer, default=3)
    order_index = Column(Integer, default=1)

    unit = relationship("Unit", back_populates="skills")
    lessons = relationship("Lesson", back_populates="skill", cascade="all, delete-orphan", order_by="Lesson.order_index")
    user_progress = relationship("UserSkillProgress", back_populates="skill", cascade="all, delete-orphan")


class Lesson(Base):
    __tablename__ = "lessons"

    id = Column(Integer, primary_key=True, index=True)
    skill_id = Column(Integer, ForeignKey("skills.id"), nullable=False)
    title = Column(String, nullable=False)
    xp_reward = Column(Integer, default=15)
    order_index = Column(Integer, default=1)

    skill = relationship("Skill", back_populates="lessons")
    exercises = relationship("Exercise", back_populates="lesson", cascade="all, delete-orphan", order_by="Exercise.order_index")


class Exercise(Base):
    __tablename__ = "exercises"

    id = Column(Integer, primary_key=True, index=True)
    lesson_id = Column(Integer, ForeignKey("lessons.id"), nullable=False)
    type = Column(String, nullable=False)  # multiple_choice, translate, match_pairs, fill_blank, type_answer
    prompt = Column(String, nullable=False)
    question = Column(String, nullable=False)
    audio_text = Column(String, nullable=True)
    correct_answer = Column(Text, nullable=False)  # String or JSON string for match pairs / array
    options_json = Column(Text, nullable=True)     # JSON string of options / word tokens
    explanation = Column(String, nullable=True)
    order_index = Column(Integer, default=1)

    lesson = relationship("Lesson", back_populates="exercises")


class UserSkillProgress(Base):
    __tablename__ = "user_skill_progress"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    skill_id = Column(Integer, ForeignKey("skills.id"), nullable=False)
    status = Column(String, default="locked")  # locked, available, completed
    completed_lessons = Column(Integer, default=0)
    crown_level = Column(Integer, default=0)
    is_legendary = Column(Boolean, default=False)

    user = relationship("User", back_populates="skill_progress")
    skill = relationship("Skill", back_populates="user_progress")


class UserLessonProgress(Base):
    __tablename__ = "user_lesson_progress"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    lesson_id = Column(Integer, ForeignKey("lessons.id"), nullable=False)
    skill_id = Column(Integer, ForeignKey("skills.id"), nullable=False)
    completed = Column(Boolean, default=True)
    accuracy = Column(Float, default=100.0)
    mistakes_count = Column(Integer, default=0)
    completed_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="lesson_progress")


class Quest(Base):
    __tablename__ = "quests"

    id = Column(String, primary_key=True)
    title = Column(String, nullable=False)
    description = Column(String, nullable=False)
    icon = Column(String, default="target")
    target = Column(Integer, default=30)
    xp_reward = Column(Integer, default=20)
    gem_reward = Column(Integer, default=10)
    quest_type = Column(String, default="xp")  # xp, lessons, accuracy


class UserQuest(Base):
    __tablename__ = "user_quests"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    quest_id = Column(String, ForeignKey("quests.id"), nullable=False)
    current_progress = Column(Integer, default=0)
    completed = Column(Boolean, default=False)
    claimed = Column(Boolean, default=False)

    user = relationship("User", back_populates="quests")
    quest = relationship("Quest")


class LeaderboardUser(Base):
    __tablename__ = "leaderboard_users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, nullable=False)
    display_name = Column(String, nullable=False)
    avatar = Column(String, default="bear")
    xp = Column(Integer, default=100)
    league = Column(String, default="Silver League")
    is_user = Column(Boolean, default=False)


class ShopItem(Base):
    __tablename__ = "shop_items"

    id = Column(String, primary_key=True)
    title = Column(String, nullable=False)
    description = Column(String, nullable=False)
    icon = Column(String, default="heart")
    cost_gems = Column(Integer, nullable=False)
    item_type = Column(String, nullable=False)  # refill_hearts, streak_freeze, outfit, wager
