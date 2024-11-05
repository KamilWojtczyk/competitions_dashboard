import { createAction, props } from '@ngrx/store';
import { Competition } from '../models/competition.model';
import { Match } from '../models/match.model';
import { TopPlayer } from '../models/top-players.model';
import { Player } from '../models/player.model';
import { Events } from '../models/events.model';

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

export const playersScreenInitialied = createAction(
  '[Players screen] Players screen screen initialized'
);
export const loadPlayersSuccess = createAction(
  '[Players screen] Load Players Success',
  props<{ players: Player[] }>()
);
export const loadPlayersFailure = createAction(
  '[Players screen] Load Players Failure'
);

export const selectedMatchScreenInitialied = createAction(
  '[Selected Match screen] Selected match screen initialized'
);
export const loadMatchEventsSuccess = createAction(
  '[Selected Match screen] Load Match Events Success',
  props<{ events: Events[] }>()
);
export const loadMatchEventsFailure = createAction(
  '[Selected Match screen] Load Match Events Failure'
);
