export interface Events {
  id: string;
  index: number;
  match_id: number;
  minute: number;
  second: number;
  possession: number;
  possession_team: string;
  possession_team_id: number;
  team: string;
  team_id: number;
  type: string;
  timestamp: string;
  period: number;
  play_pattern: string;
  player: string;
  player_id: number;
  position: string;
  location: [number, number];
  duration: number;
  related_events: string[];
  tactics: Tactic;
  ball_receipt_outcome: string;
  ball_recovery_recovery_failure: boolean;
  block_deflection: boolean;
  carry_end_location: [number, number];
  clearance_aerial_won: boolean;
  clearance_body_part: string;
  clearance_head: boolean;
  clearance_left_foot: boolean;
  clearance_right_foot: boolean;
  counterpress: boolean;
  dribble_no_touch: boolean;
  dribble_outcome: string;
  dribble_overrun: boolean;
  duel_outcome: string;
  duel_type: string;
  foul_committed_advantage: boolean;
  foul_committed_card: string;
  foul_committed_penalty: boolean;
  foul_committed_type: string;
  foul_won_advantage: boolean;
  foul_won_defensive: boolean;
  foul_won_penalty: boolean;
  goalkeeper_body_part: string;
  goalkeeper_end_location: [number, number];
  goalkeeper_outcome: string;
  goalkeeper_position: string;
  goalkeeper_technique: string;
  goalkeeper_type: string;
  injury_stoppage_in_chain: boolean;
  interception_outcome: string;
  off_camera: boolean;
  out: boolean;
  pass_aerial_won: boolean;
  pass_angle: number;
  pass_assisted_shot_id: string;
  pass_backheel: boolean;
  pass_body_part: string;
  pass_cross: boolean;
  pass_cut_back: boolean;
  pass_deflected: boolean;
  pass_end_location: [number, number];
  pass_goal_assist: boolean;
  pass_height: string;
  pass_length: number;
  pass_miscommunication: boolean;
  pass_outcome: string;
  pass_outswinging: boolean;
  pass_recipient: string;
  pass_recipient_id: number;
  pass_shot_assist: boolean;
  pass_straight: boolean;
  pass_switch: boolean;
  pass_technique: string;
  pass_through_ball: boolean;
  pass_type: string;
  pass_xclaim: number;
  shot_aerial_won: boolean;
  shot_body_part: string;
  shot_deflected: boolean;
  shot_end_location: [number, number];
  shot_first_time: boolean;
  shot_freeze_frame: any[];
  shot_key_pass_id: string;
  shot_one_on_one: boolean;
  shot_outcome: string;
  shot_redirect: boolean;
  shot_statsbomb_xg: number;
  shot_technique: string;
  shot_type: string;
  substitution_outcome: string;
  substitution_replacement: string;
  under_pressure: boolean;
  newsecond?: number;
}

export interface Tactic {
  formation: number;
  lineup: Lineup[];
}

export interface Lineup {
  jersey_number: number;
  player: Player;
  position: Position;
}

export interface Player {
  id: number;
  name: string;
}

export interface Position {
  id: number;
  name: string;
}
