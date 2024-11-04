import { createFeatureSelector, createSelector } from '@ngrx/store';
import { CompetitionsState } from './competitions.reducer';
import { selectCurrentRouteState } from '../../../router.selector';
import { Breadcrumb } from '../../../shared/models/breadcrumb.model';

export const selectCompetitionsState =
  createFeatureSelector<CompetitionsState>('competitions');

export const selectAllCompetitions = createSelector(
  selectCompetitionsState,
  (state) => state.competitions
);
export const selectCompetitionsLoading = createSelector(
  selectCompetitionsState,
  (state) => state.loadingCompetitions
);

export const selectSelectedCompetition = createSelector(
  selectCompetitionsState,
  (state) => {
    if (!state.selectedCompetition) return undefined;
    return state.selectedCompetition;
  }
);

export const selectMatches = createSelector(
  selectCompetitionsState,
  (state) => state.matches
);
export const selectMatchesLoading = createSelector(
  selectCompetitionsState,
  (state) => state.loadingMatches
);

export const selectPlayersStats = createSelector(
  selectCompetitionsState,
  (state) => state.playersStats
);

export const selectTopScorers = createSelector(
  selectPlayersStats,
  (playersStats) => {
    if (!playersStats) return undefined;
    return playersStats.topScorers;
  }
);
export const selectTopAssists = createSelector(
  selectPlayersStats,
  (playersStats) => {
    if (!playersStats) return undefined;
    return playersStats.topAssists;
  }
);
export const selectTopPlayersLoading = createSelector(
  selectPlayersStats,
  (playersStats) => {
    if (!playersStats) return undefined;
    return playersStats.loadingTopPlayers;
  }
);
export const selectTopScorersLoading = createSelector(
  selectPlayersStats,
  (playersStats) => {
    if (!playersStats) return undefined;
    return playersStats.loadingTopScorers;
  }
);
export const selectTopAssistsLoading = createSelector(
  selectPlayersStats,
  (playersStats) => {
    if (!playersStats) return undefined;
    return playersStats.loadingTopAssists;
  }
);

export const selectPlayers = createSelector(
  selectCompetitionsState,
  (state) => state.players
);
export const selectPlayersLoading = createSelector(
  selectCompetitionsState,
  (state) => state.loadingPlayers
);

//Breadcrumb selector
export const selectBreadcrumbs = createSelector(
  selectCurrentRouteState,
  selectMatches,
  (routeState, matches) => {
    if (!routeState) return [];
    const breadcrumbs: Breadcrumb[] = [];

    const urlSegments = routeState.url.split('/').filter((segment) => segment);

    let accumulatedUrl = '';
    let competitionId: number = routeState.params['competition_id'];
    let matchId: number = routeState.params['match_id'];

    urlSegments.forEach((segment, index) => {
      let label = '';
      let url = '';

      accumulatedUrl += `/${segment}`;

      if (segment === competitionId.toString()) {
        label = 'Competitions';
        url = '/'; // Root path for "Competitions"
      } else {
        url = accumulatedUrl; // Use accumulated URL for other breadcrumbs

        if (segment === 'matches') {
          label = 'Matches';
        } else if (segment === matchId?.toString()) {
          const match = matches?.find((m) => m.match_id == matchId);
          label = match ? `${match.home_team} - ${match.away_team}` : 'Match';
        } else if (segment === 'players') {
          console.log('ss');
          label = 'Players';
        } else {
          label = routeState.data['breadcrumb'] || segment;
        }
      }

      const isClickable = index < urlSegments.length - 1;

      breadcrumbs.push({
        label,
        url,
        clickable: isClickable,
      });
    });

    return breadcrumbs;
  }
);
