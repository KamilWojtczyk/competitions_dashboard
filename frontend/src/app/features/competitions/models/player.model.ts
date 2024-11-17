export interface Player {
  player_id: number;
  player_name: string;
  player_nickname: string;
  birth_date: Date;
  player_gender: string;
  player_height: number;
  player_weight: number;
  jersey_number: number;
  country: string;
}

export interface PlayerPassStats {
  playerId: number;
  playerName: string;
  team: string;
  successfulPasses: number;
  progressivePasses: number;
  keyPasses: number;
}

export interface PlayerDefensiveStats {
  playerId: number;
  playerName: string;
  team: string;
  tackles: number;
  interceptions: number;
  fouls: number;
  ballRecoveries: number;
  clearances: number;
  totalDefensiveActions: number;
}

export interface TeamTopPlayerStats {
  team: string;
  topPassers: PlayerPassStats[];
  topDefenders: PlayerDefensiveStats[];
  topPasserPlayer: PlayerPassStats;
  topDefenderPlayer: PlayerDefensiveStats;
}

export interface MatchTopPlayerStats {
  homeTeamStats: TeamTopPlayerStats;
  awayTeamStats: TeamTopPlayerStats;
}
