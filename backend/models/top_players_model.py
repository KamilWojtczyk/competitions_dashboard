from pydantic import BaseModel
from typing import List
from typing import Optional

class TopPlayer(BaseModel):
    player: str
    team: Optional[str]
    number: int

class TopPlayerResponse(BaseModel):
    top_scorers: List[TopPlayer]
    top_assists: List[TopPlayer]
