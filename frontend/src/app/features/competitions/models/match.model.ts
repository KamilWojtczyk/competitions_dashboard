export interface Match {
  match_id: number;
  match_date: Date;
  kick_off: Date;
  competition: string;
  season: string;
  home_team: string;
  away_team: string;
  home_score: string;
  away_score: string;
  match_status: string;
  match_week: number;
  competition_stage: string;
  stadium: string;
  referee: string;
  home_managers: string;
  away_managers: string;
}
