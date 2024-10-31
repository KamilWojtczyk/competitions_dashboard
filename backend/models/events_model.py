from pydantic import BaseModel
from typing import Optional, List

class Event(BaseModel):
    id: Optional[str] = None
    index: int
    period: int
    timestamp: str
    minute: int
    second: int
    type: str
    team: str
    player: Optional[str] = None
    position: Optional[str] = None
    under_pressure: Optional[bool] = None
    counterpress: Optional[bool] = None

    # Location fields split into x and y components
    location_x: Optional[float] = None
    location_y: Optional[float] = None
    carry_end_location_x: Optional[float] = None
    carry_end_location_y: Optional[float] = None
    pass_end_location_x: Optional[float] = None
    pass_end_location_y: Optional[float] = None
    goalkeeper_end_location_x: Optional[float] = None
    goalkeeper_end_location_y: Optional[float] = None
    shot_end_location_x: Optional[float] = None
    shot_end_location_y: Optional[float] = None

    # Additional fields
    ball_receipt_outcome: Optional[str] = None
    pass_length: Optional[float] = None
    pass_type: Optional[str] = None
    pass_outcome: Optional[str] = None
    pass_goal_assist: Optional[bool] = None

    shot_statsbomb_xg: Optional[float] = None
    shot_outcome: Optional[str] = None
    shot_type: Optional[str] = None

    duel_type: Optional[str] = None
    duel_outcome: Optional[str] = None

    foul_committed_card: Optional[str] = None
    foul_committed_type: Optional[str] = None

    interception_outcome: Optional[str] = None

    clearance_body_part: Optional[str] = None

    goalkeeper_type: Optional[str] = None
    goalkeeper_position: Optional[str] = None
    goalkeeper_technique: Optional[str] = None
    goalkeeper_body_part: Optional[str] = None
    goalkeeper_outcome: Optional[str] = None
    goalkeeper_punched_out: Optional[bool] = None

    substitution_outcome: Optional[str] = None
    substitution_replacement: Optional[str] = None

    shot_blocked: Optional[bool] = None

    shot_key_pass_id: Optional[str] = None
    pass_assisted_shot_id: Optional[str] = None

class EventResponse(BaseModel):
    total_events: int
    total_pages: int
    current_page: int
    events: List[Event]
