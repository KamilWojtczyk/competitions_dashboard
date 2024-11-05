from pydantic import BaseModel, model_validator
from typing import Optional, List, Dict, Any
import math

class Event(BaseModel):
    id: Optional[str] = None  
    index: Optional[int] = None
    match_id: int 
    minute: Optional[int] = None
    second: Optional[int] = None
    possession: Optional[int] = None
    possession_team: Optional[str] = None
    possession_team_id: Optional[int] = None
    team: Optional[str] = None
    team_id: Optional[int] = None
    type: Optional[str] = None
    timestamp: Optional[str] = None
    period: Optional[int] = None
    play_pattern: Optional[str] = None
    player: Optional[str] = None
    player_id: Optional[int] = None
    position: Optional[str] = None
    location: Optional[List[float]] = None
    duration: Optional[float] = None
    related_events: Optional[List[str]] = None 
    tactics: Optional[Dict[str, Any]] = None
    ball_receipt_outcome: Optional[str] = None
    ball_recovery_recovery_failure: Optional[bool] = None
    block_deflection: Optional[bool] = None
    carry_end_location: Optional[List[float]] = None
    clearance_aerial_won: Optional[bool] = None
    clearance_body_part: Optional[str] = None
    clearance_head: Optional[bool] = None
    clearance_left_foot: Optional[bool] = None
    clearance_right_foot: Optional[bool] = None
    counterpress: Optional[bool] = None
    dribble_no_touch: Optional[bool] = None
    dribble_outcome: Optional[str] = None
    dribble_overrun: Optional[bool] = None
    duel_outcome: Optional[str] = None
    duel_type: Optional[str] = None
    foul_committed_advantage: Optional[bool] = None
    foul_committed_card: Optional[str] = None
    foul_committed_penalty: Optional[bool] = None
    foul_committed_type: Optional[str] = None
    foul_won_advantage: Optional[bool] = None
    foul_won_defensive: Optional[bool] = None
    foul_won_penalty: Optional[bool] = None
    goalkeeper_body_part: Optional[str] = None
    goalkeeper_end_location: Optional[List[float]] = None
    goalkeeper_outcome: Optional[str] = None
    goalkeeper_position: Optional[str] = None
    goalkeeper_technique: Optional[str] = None
    goalkeeper_type: Optional[str] = None
    injury_stoppage_in_chain: Optional[bool] = None
    interception_outcome: Optional[str] = None
    off_camera: Optional[bool] = None
    out: Optional[bool] = None
    pass_aerial_won: Optional[bool] = None
    pass_angle: Optional[float] = None
    pass_assisted_shot_id: Optional[str] = None  
    pass_backheel: Optional[bool] = None 
    pass_body_part: Optional[str] = None
    pass_cross: Optional[bool] = None
    pass_cut_back: Optional[bool] = None
    pass_deflected: Optional[bool] = None
    pass_end_location: Optional[List[float]] = None
    pass_goal_assist: Optional[bool] = None
    pass_height: Optional[str] = None
    pass_length: Optional[float] = None
    pass_miscommunication: Optional[bool] = None 
    pass_outcome: Optional[str] = None
    pass_outswinging: Optional[bool] = None
    pass_recipient: Optional[str] = None
    pass_recipient_id: Optional[int] = None
    pass_shot_assist: Optional[bool] = None
    pass_straight: Optional[bool] = None
    pass_switch: Optional[bool] = None
    pass_technique: Optional[str] = None
    pass_through_ball: Optional[bool] = None
    pass_type: Optional[str] = None
    pass_xclaim: Optional[float] = None
    shot_aerial_won: Optional[bool] = None
    shot_body_part: Optional[str] = None
    shot_deflected: Optional[bool] = None
    shot_end_location: Optional[List[float]] = None
    shot_first_time: Optional[bool] = None
    shot_freeze_frame: Optional[List[Dict[str, Any]]] = None
    shot_key_pass_id: Optional[str] = None  
    shot_one_on_one: Optional[bool] = None
    shot_outcome: Optional[str] = None
    shot_redirect: Optional[bool] = None
    shot_statsbomb_xg: Optional[float] = None
    shot_technique: Optional[str] = None
    shot_type: Optional[str] = None
    substitution_outcome: Optional[str] = None
    substitution_replacement: Optional[str] = None
    under_pressure: Optional[bool] = None

    @model_validator(mode="before")
    def replace_nan_with_none(cls, values):
        for field, value in values.items():
            if isinstance(value, float) and math.isnan(value):
                values[field] = None
        return values