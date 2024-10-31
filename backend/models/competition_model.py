from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class Competition(BaseModel):
    competition_id: int
    season_id: int
    country_name: str
    competition_name: str
    competition_gender: str
    competition_youth: bool
    competition_international: bool
    season_name: str
    match_updated: Optional[datetime]
    match_available: Optional[datetime]