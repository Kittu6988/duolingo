from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from app.database import get_db
from app.models import (
    Lesson, Exercise, Skill, User, UserLessonProgress,
    UserSkillProgress, UserQuest, Quest
)
from app.schemas import (
    LessonDetail, ExerciseOut, LessonSubmitRequest,
    LessonSubmitResponse, PracticeResponse
)

router = APIRouter(prefix="/api/lessons", tags=["lessons"])

@router.get("/{lesson_id}", response_model=LessonDetail)
def get_lesson(lesson_id: int, db: Session = Depends(get_db)):
    lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")

    exercises = db.query(Exercise).filter(Exercise.lesson_id == lesson_id).order_by(Exercise.order_index).all()
    exercises_out = [
        ExerciseOut(
            id=ex.id,
            lesson_id=ex.lesson_id,
            type=ex.type,
            prompt=ex.prompt,
            question=ex.question,
            audio_text=ex.audio_text,
            correct_answer=ex.correct_answer,
            options_json=ex.options_json,
            explanation=ex.explanation,
            order_index=ex.order_index
        ) for ex in exercises
    ]

    return LessonDetail(
        id=lesson.id,
        skill_id=lesson.skill_id,
        title=lesson.title,
        xp_reward=lesson.xp_reward,
        order_index=lesson.order_index,
        exercises=exercises_out
    )

@router.post("/{lesson_id}/complete", response_model=LessonSubmitResponse)
def complete_lesson(
    lesson_id: int,
    req: LessonSubmitRequest,
    user_id: int = 1,
    db: Session = Depends(get_db)
):
    lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    skill = db.query(Skill).filter(Skill.id == lesson.skill_id).first()

    # 1. Update user hearts
    user.hearts = max(0, min(user.max_hearts, user.hearts - req.hearts_lost))

    # 2. Award XP
    xp_gained = lesson.xp_reward
    user.xp += xp_gained

    # 3. Handle streak logic
    today_str = datetime.utcnow().strftime("%Y-%m-%d")
    yesterday_str = (datetime.utcnow() - timedelta(days=1)).strftime("%Y-%m-%d")

    if user.last_active_date != today_str:
        if user.last_active_date == yesterday_str:
            user.streak += 1
        elif user.last_active_date is None:
            user.streak = 1
        else:
            # Missed more than 1 day
            if user.streak_freeze_count > 0:
                user.streak_freeze_count -= 1
                user.streak += 1  # saved by freeze
            else:
                user.streak = 1
        user.last_active_date = today_str

    # 4. Save Lesson Progress
    existing_lp = db.query(UserLessonProgress).filter(
        UserLessonProgress.user_id == user.id,
        UserLessonProgress.lesson_id == lesson.id
    ).first()

    if not existing_lp:
        lp = UserLessonProgress(
            user_id=user.id,
            lesson_id=lesson.id,
            skill_id=skill.id,
            completed=True,
            accuracy=req.accuracy,
            mistakes_count=req.mistakes_count,
            completed_at=datetime.utcnow()
        )
        db.add(lp)
    else:
        existing_lp.completed = True
        existing_lp.accuracy = max(existing_lp.accuracy, req.accuracy)
        existing_lp.completed_at = datetime.utcnow()

    # 5. Update Skill Progress
    sp = db.query(UserSkillProgress).filter(
        UserSkillProgress.user_id == user.id,
        UserSkillProgress.skill_id == skill.id
    ).first()

    if not sp:
        sp = UserSkillProgress(
            user_id=user.id,
            skill_id=skill.id,
            status="available",
            completed_lessons=0,
            crown_level=0,
            is_legendary=False
        )
        db.add(sp)
        db.flush()

    # Count how many distinct lessons user completed in this skill
    completed_lessons_count = db.query(UserLessonProgress).filter(
        UserLessonProgress.user_id == user.id,
        UserLessonProgress.skill_id == skill.id,
        UserLessonProgress.completed == True
    ).count()

    leveled_up = False
    next_unlocked_skill_id = None

    sp.completed_lessons = min(skill.total_lessons, completed_lessons_count)
    if sp.completed_lessons >= skill.total_lessons:
        if sp.status != "completed":
            leveled_up = True
            sp.crown_level = max(1, sp.crown_level + 1)
            sp.status = "completed"

            # Unlock the next skill in the same unit or next unit
            next_skill = db.query(Skill).filter(
                Skill.unit_id == skill.unit_id,
                Skill.order_index > skill.order_index
            ).order_by(Skill.order_index).first()

            if not next_skill:
                # Check next unit
                current_unit = skill.unit
                next_unit = db.query(Skill).join(Skill.unit).filter(
                    Skill.unit.has(order_index=current_unit.order_index + 1)
                ).order_by(Skill.order_index).first()
                if next_unit:
                    next_skill = next_unit

            if next_skill:
                next_sp = db.query(UserSkillProgress).filter(
                    UserSkillProgress.user_id == user.id,
                    UserSkillProgress.skill_id == next_skill.id
                ).first()
                if not next_sp:
                    next_sp = UserSkillProgress(
                        user_id=user.id,
                        skill_id=next_skill.id,
                        status="available",
                        completed_lessons=0,
                        crown_level=0
                    )
                    db.add(next_sp)
                else:
                    if next_sp.status == "locked":
                        next_sp.status = "available"
                next_unlocked_skill_id = next_skill.id

    # 6. Update Quests Progress
    user_quests = db.query(UserQuest).filter(
        UserQuest.user_id == user.id,
        UserQuest.completed == False
    ).all()
    quests_completed = []

    for uq in user_quests:
        quest = uq.quest
        if quest.quest_type == "xp":
            uq.current_progress += xp_gained
        elif quest.quest_type == "lessons":
            uq.current_progress += 1
        elif quest.quest_type == "accuracy" and req.accuracy >= 90.0:
            uq.current_progress += 1

        if uq.current_progress >= quest.target:
            uq.current_progress = quest.target
            uq.completed = True
            quests_completed.append(quest.title)

    db.commit()
    db.refresh(user)

    return LessonSubmitResponse(
        success=True,
        xp_gained=xp_gained,
        total_xp=user.xp,
        hearts_remaining=user.hearts,
        streak=user.streak,
        leveled_up=leveled_up,
        new_crown_level=sp.crown_level,
        next_unlocked_skill_id=next_unlocked_skill_id,
        quests_completed=quests_completed
    )

@router.post("/practice", response_model=PracticeResponse)
def complete_practice(user_id: int = 1, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    hearts_restored = 0
    if user.hearts < user.max_hearts:
        user.hearts += 1
        hearts_restored = 1

    xp_gained = 10
    user.xp += xp_gained

    # Update quest for XP
    user_quests = db.query(UserQuest).filter(
        UserQuest.user_id == user.id,
        UserQuest.completed == False
    ).all()
    for uq in user_quests:
        if uq.quest.quest_type == "xp":
            uq.current_progress += xp_gained
            if uq.current_progress >= uq.quest.target:
                uq.current_progress = uq.quest.target
                uq.completed = True

    db.commit()
    db.refresh(user)

    return PracticeResponse(
        success=True,
        hearts_restored=hearts_restored,
        current_hearts=user.hearts,
        xp_gained=xp_gained,
        total_xp=user.xp
    )
