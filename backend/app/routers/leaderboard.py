from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import LeaderboardUser, User
from app.schemas import LeaderboardUserOut

router = APIRouter(prefix="/api/leaderboard", tags=["leaderboard"])

@router.get("", response_model=List[LeaderboardUserOut])
def get_leaderboard(user_id: int = 1, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    bots = db.query(LeaderboardUser).filter(LeaderboardUser.is_user == False).all()

    all_entries = []
    # Add real user dynamically
    if user:
        all_entries.append({
            "id": user.id,
            "username": user.username,
            "display_name": f"{user.display_name} (You)",
            "avatar": user.avatar,
            "xp": user.xp,
            "league": user.league,
            "is_user": True
        })

    for b in bots:
        all_entries.append({
            "id": b.id + 1000,
            "username": b.username,
            "display_name": b.display_name,
            "avatar": b.avatar,
            "xp": b.xp,
            "league": b.league,
            "is_user": False
        })

    # Sort descending by XP
    all_entries.sort(key=lambda x: x["xp"], reverse=True)

    result = []
    for rank, item in enumerate(all_entries, start=1):
        result.append(LeaderboardUserOut(
            id=item["id"],
            username=item["username"],
            display_name=item["display_name"],
            avatar=item["avatar"],
            xp=item["xp"],
            league=item["league"],
            rank=rank,
            is_user=item["is_user"]
        ))

    return result
