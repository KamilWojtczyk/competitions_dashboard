from pydantic import BaseModel
from typing import Optional
from datetime import date

class Player(BaseModel):
    player_id: int
    player_name: str
    player_nickname: Optional[str] = None
    birth_date: Optional[date] = None
    player_gender: Optional[str] = None
    player_height: Optional[float] = None
    player_weight: Optional[float] = None
    jersey_number: Optional[int] = None
    country: Optional[str] = None
