import { createAction, props } from '@ngrx/store';
import { Competition } from '../models/competition.model';
import { Match } from '../models/match.model';
import { TopPlayer } from '../models/top-players.model';

export const loadCompetitions = createAction(
  '[Competitions] Load Competitions'
);
export const loadCompetitionsSuccess = createAction(
  '[Competitions] Load Competitions Success',
  props<{ competitions: Competition[] }>()
);
export const loadCompetitionsFailure = createAction(
  '[Competitions] Load Competitions Failure'
);

export const selectCompetitionButtonClicked = createAction(
  '[Competitions] Select competition',
  props<{ selectedCompetition: Competition }>()
);

export const matchesScreenInitialied = createAction(
  '[Matches] Matches screen initialized'
);
export const loadMatchesSuccess = createAction(
  '[Matches] Load Matches Success',
  props<{ matches: Match[] }>()
);
export const loadMatchesFailure = createAction(
  '[Matches] Load Matches Failure'
);

export const selectMatchButtonClicked = createAction(
  '[Matches] Select match',
  props<{ selectedMatch: Match }>()
);

export const loadTopScorersSuccess = createAction(
  '[Matches Sidebar] Load Top Scorers Success',
  props<{ topScorers: TopPlayer[] }>()
);
export const loadTopScorersFailure = createAction(
  '[Matches Sidebar] Load Top Scorers Failure'
);

export const loadTopAssistsSuccess = createAction(
  '[Matches Sidebar] Load Top Assists Success',
  props<{ topAssists: TopPlayer[] }>()
);
export const loadTopAssistsFailure = createAction(
  '[Matches Sidebar] Load Top Assists Failure'
);

export const loadTopPlayersSuccess = createAction(
  '[Matches Sidebar] Load Top Players Success',
  props<{ topScorers: TopPlayer[]; topAssists: TopPlayer[] }>()
);
export const loadTopPlayersFailure = createAction(
  '[Matches Sidebar] Load Top Players Failure'
);
