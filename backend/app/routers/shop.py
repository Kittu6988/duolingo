from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import ShopItem, User
from app.schemas import ShopItemOut, ShopPurchaseRequest, ShopPurchaseResponse

router = APIRouter(prefix="/api/shop", tags=["shop"])

@router.get("", response_model=List[ShopItemOut])
def get_shop_items(db: Session = Depends(get_db)):
    return db.query(ShopItem).all()

@router.post("/buy", response_model=ShopPurchaseResponse)
def buy_shop_item(req: ShopPurchaseRequest, user_id: int = 1, db: Session = Depends(get_db)):
    item = db.query(ShopItem).filter(ShopItem.id == req.item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if user.gems < item.cost_gems:
        raise HTTPException(status_code=400, detail="Not enough gems! Complete lessons or quests to earn more.")

    user.gems -= item.cost_gems

    if item.item_type == "refill_hearts":
        user.hearts = user.max_hearts
        msg = "Hearts fully restored to 5!"
    elif item.item_type == "streak_freeze":
        user.streak_freeze_count += 1
        msg = "Streak Freeze equipped! Your streak is protected."
    elif item.item_type == "wager":
        msg = "Double or Nothing wager active! Maintain your streak for 7 days."
    elif item.item_type == "outfit":
        msg = "Duo is now dressed to impress in a sharp tuxedo!"
    else:
        msg = f"Purchased {item.title} successfully!"

    db.commit()
    db.refresh(user)

    return ShopPurchaseResponse(
        success=True,
        message=msg,
        gems_remaining=user.gems,
        hearts=user.hearts,
        streak_freeze_count=user.streak_freeze_count
    )
