import { createReducer, on } from '@ngrx/store';
import { Competition } from '../models/competition.model';
import {
  loadCompetitions,
  loadCompetitionsFailure,
  loadCompetitionsSuccess,
  loadMatchesFailure,
  loadMatchesSuccess,
  loadTopAssistsFailure,
  loadTopAssistsSuccess,
  loadTopScorersFailure,
  loadTopScorersSuccess,
  matchesScreenInitialied,
  selectCompetitionButtonClicked,
} from './competitions.actions';
import { Match } from '../models/match.model';
import { TopPlayer } from '../models/top-players.model';
import { Player } from '../models/player.model';

export interface CompetitionsState {
  competitions: Competition[];
  selectedCompetition: Competition;
  loadingCompetitions: boolean;
  matches: Match[];
  loadingMatches: boolean;
  playersStats: PlayersStatsState;
  players: Player[];
  loadingPlayers: boolean;
}

export interface PlayersStatsState {
  topScorers: TopPlayer[];
  topAssists: TopPlayer[];
  loadingTopPlayers: boolean;
  loadingTopScorers: boolean;
  loadingTopAssists: boolean;
}

export const playersStatsState: PlayersStatsState = {
  topScorers: undefined,
  topAssists: undefined,
  loadingTopPlayers: false,
  loadingTopScorers: true,
  loadingTopAssists: true,
};

export const initialState: CompetitionsState = {
  competitions: undefined,
  selectedCompetition: undefined,
  loadingCompetitions: false,
  matches: undefined,
  loadingMatches: false,
  playersStats: playersStatsState,
  players: undefined,
  loadingPlayers: false,
};

export const competitionsReducer = createReducer(
  initialState,
  on(loadCompetitions, () => ({
    ...initialState,
    loadingCompetitions: true,
  })),
  on(loadCompetitionsSuccess, (state, { competitions }) => ({
    ...state,
    competitions,
    loadingCompetitions: false,
  })),
  on(loadCompetitionsFailure, (state) => ({
    ...state,
    loadingCompetitions: false,
  })),

  on(selectCompetitionButtonClicked, (state, { selectedCompetition }) => ({
    ...state,
    selectedCompetition,
  })),

  on(matchesScreenInitialied, (state) => ({
    ...state,
    loadingMatches: !state.matches,
    playersStats: {
      ...state.playersStats,
      loadingTopPlayers: !(
        state.playersStats.topScorers || state.playersStats.topAssists
      ),
      loadingTopScorers: !state.playersStats.topScorers,
      loadingTopAssists: !state.playersStats.topAssists,
    },
  })),
  on(loadMatchesSuccess, (state, { matches }) => ({
    ...state,
    matches,
    loadingMatches: false,
  })),
  on(loadMatchesFailure, (state) => ({
    ...state,
    loadingMatches: false,
  })),

  on(loadTopScorersSuccess, (state, { topScorers }) => ({
    ...state,
    playersStats: {
      ...state.playersStats,
      topScorers,
      loadingTopScorers: false,
      loadingTopPlayers: false,
    },
  })),
  on(loadTopScorersFailure, (state) => ({
    ...state,
    playersStats: {
      ...state.playersStats,
      loadingTopScorers: false,
      loadingTopPlayers: false,
    },
  })),

  on(loadTopAssistsSuccess, (state, { topAssists }) => ({
    ...state,
    playersStats: {
      ...state.playersStats,
      topAssists,
      loadingTopAssists: false,
      loadingTopPlayers: false,
    },
  })),
  on(loadTopAssistsFailure, (state) => ({
    ...state,
    playersStats: {
      ...state.playersStats,
      loadingTopAssists: false,
      loadingTopPlayers: false,
    },
  }))
);
