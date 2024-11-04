from pydantic import BaseModel, model_validator
from datetime import datetime, time
from typing import Optional
import math

class Match(BaseModel):
    match_id: int
    match_date: datetime
    kick_off: Optional[time]
    competition: Optional[str]
    season: Optional[str]
    home_team: Optional[str]
    away_team: Optional[str]
    home_score: int
    away_score: int
    match_status: Optional[str]
    match_week: Optional[int]
    competition_stage: Optional[str]
    stadium: Optional[str]
    referee: Optional[str]
    home_managers: Optional[str] = None
    away_managers: Optional[str] = None

    @model_validator(mode="before")
    def replace_nan_with_none(cls, values):
        for field, value in values.items():
            if isinstance(value, float) and math.isnan(value):
                values[field] = None
        return values
