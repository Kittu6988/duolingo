from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from app.database import get_db
from app.models import User, UserSkillProgress, UserLessonProgress, UserQuest, Skill
from app.schemas import UserOut, UserUpdate

router = APIRouter(prefix="/api/user", tags=["user"])

@router.get("", response_model=UserOut)
def get_user_profile(user_id: int = 1, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.patch("", response_model=UserOut)
def update_user_profile(update_data: UserUpdate, user_id: int = 1, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if update_data.display_name is not None:
        user.display_name = update_data.display_name
    if update_data.avatar is not None:
        user.avatar = update_data.avatar

    db.commit()
    db.refresh(user)
    return user

@router.post("/refill-hearts", response_model=UserOut)
def refill_hearts(user_id: int = 1, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.hearts = user.max_hearts
    db.commit()
    db.refresh(user)
    return user

@router.post("/simulate-day", response_model=UserOut)
def simulate_new_day(action: str = "advance_and_practice", user_id: int = 1, db: Session = Depends(get_db)):
    """
    Simulation endpoint to test streak increment, streak freeze, or streak reset without waiting 24 hours.
    action:
    - 'advance_and_practice': user practiced next day, streak increments
    - 'miss_day': user missed a day (uses freeze or resets)
    - 'add_gems': gives +100 gems for testing shop
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if action == "advance_and_practice":
        user.streak += 1
        user.xp += 15
        user.last_active_date = datetime.utcnow().strftime("%Y-%m-%d")
    elif action == "miss_day":
        if user.streak_freeze_count > 0:
            user.streak_freeze_count -= 1
            # Protected by freeze
        else:
            user.streak = 0
    elif action == "add_gems":
        user.gems += 200

    db.commit()
    db.refresh(user)
    return user

@router.post("/reset-progress", response_model=UserOut)
def reset_progress(user_id: int = 1, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Clear lesson progress
    db.query(UserLessonProgress).filter(UserLessonProgress.user_id == user_id).delete()

    # Reset skills
    skills = db.query(Skill).order_by(Skill.order_index).all()
    for idx, skill in enumerate(skills):
        sp = db.query(UserSkillProgress).filter(
            UserSkillProgress.user_id == user_id,
            UserSkillProgress.skill_id == skill.id
        ).first()
        if sp:
            sp.completed_lessons = 0
            sp.crown_level = 0
            sp.status = "available" if idx == 0 else "locked"

    # Reset quests
    db.query(UserQuest).filter(UserQuest.user_id == user_id).update({
        "current_progress": 0,
        "completed": False,
        "claimed": False
    })

    user.hearts = 5
    user.xp = 0
    user.streak = 1
    user.gems = 500

    db.commit()
    db.refresh(user)
    return user
