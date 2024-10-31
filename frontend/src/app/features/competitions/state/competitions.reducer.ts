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

export interface CompetitionsState {
  competitions: Competition[];
  selectedCompetition: Competition;
  loadingCompetitions: boolean;
  matches: Match[];
  loadingMatches: boolean;
  playersStats: PlayersStatsState;
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
};

export const competitionsReducer = createReducer(
  initialState,
  on(loadCompetitions, (state) => ({
    ...state,
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
    loadingMatches: true,
    playersStats: {
      ...state.playersStats,
      loadingTopPlayers: true,
      loadingTopScorers: true,
      loadingTopAssists: true,
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
