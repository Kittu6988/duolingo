from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import Quest, UserQuest, User
from app.schemas import QuestOut

router = APIRouter(prefix="/api/quests", tags=["quests"])

@router.get("", response_model=List[QuestOut])
def get_user_quests(user_id: int = 1, db: Session = Depends(get_db)):
    quests = db.query(Quest).all()
    user_quests_map = {}
    uqs = db.query(UserQuest).filter(UserQuest.user_id == user_id).all()
    for uq in uqs:
        user_quests_map[uq.quest_id] = uq

    result = []
    for q in quests:
        uq = user_quests_map.get(q.id)
        current_progress = uq.current_progress if uq else 0
        completed = uq.completed if uq else False
        claimed = uq.claimed if uq else False

        result.append(QuestOut(
            id=q.id,
            title=q.title,
            description=q.description,
            icon=q.icon,
            target=q.target,
            xp_reward=q.xp_reward,
            gem_reward=q.gem_reward,
            quest_type=q.quest_type,
            current_progress=current_progress,
            completed=completed,
            claimed=claimed
        ))

    return result

@router.post("/{quest_id}/claim", response_model=QuestOut)
def claim_quest_reward(quest_id: str, user_id: int = 1, db: Session = Depends(get_db)):
    quest = db.query(Quest).filter(Quest.id == quest_id).first()
    if not quest:
        raise HTTPException(status_code=404, detail="Quest not found")

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    uq = db.query(UserQuest).filter(
        UserQuest.user_id == user_id,
        UserQuest.quest_id == quest_id
    ).first()

    if not uq or not uq.completed:
        raise HTTPException(status_code=400, detail="Quest not completed yet")

    if uq.claimed:
        raise HTTPException(status_code=400, detail="Reward already claimed")

    uq.claimed = True
    user.xp += quest.xp_reward
    user.gems += quest.gem_reward

    db.commit()
    db.refresh(uq)

    return QuestOut(
        id=quest.id,
        title=quest.title,
        description=quest.description,
        icon=quest.icon,
        target=quest.target,
        xp_reward=quest.xp_reward,
        gem_reward=quest.gem_reward,
        quest_type=quest.quest_type,
        current_progress=uq.current_progress,
        completed=uq.completed,
        claimed=uq.claimed
    )
