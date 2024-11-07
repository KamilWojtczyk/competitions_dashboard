import { createFeatureSelector, createSelector } from '@ngrx/store';
import { CompetitionsState } from './competitions.reducer';
import { selectCurrentRouteState } from '../../../router.selector';
import { Breadcrumb } from '../../../shared/models/breadcrumb.model';
import { TeamStatistics } from '../models/statistics.model';

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

export const selectSelectedMatch = createSelector(
  selectCompetitionsState,
  (state) => {
    if (!state.selectedMatch) return undefined;
    return state.selectedMatch;
  }
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

export const selectMatchEvents = createSelector(
  selectCompetitionsState,
  (state) => state.selectedMatchEvents
);
export const selectMatchEventsLoading = createSelector(
  selectCompetitionsState,
  (state) => state.matchEventsLoading
);

export const selectMatchStatistics = createSelector(
  selectSelectedMatch,
  selectMatchEvents,
  (selectedMatch, matchEvents): TeamStatistics[] | null => {
    if (!selectedMatch || !matchEvents) {
      return null;
    }

    const homeTeamName = selectedMatch.home_team;
    const awayTeamName = selectedMatch.away_team;

    // Filter events by team
    const team1Events = matchEvents.filter(
      (event) => event.team === homeTeamName && event.type
    );
    const team2Events = matchEvents.filter(
      (event) => event.team === awayTeamName && event.type
    );

    // Remove 'Unknown' pass outcomes
    const team1EventsFiltered = team1Events.filter(
      (event) => event.pass_outcome !== 'Unknown'
    );
    const team2EventsFiltered = team2Events.filter(
      (event) => event.pass_outcome !== 'Unknown'
    );

    // xG
    const xGTeam1 = parseFloat(
      team1EventsFiltered
        .filter((event) => event.shot_statsbomb_xg)
        .reduce((sum, event) => sum + (event.shot_statsbomb_xg || 0), 0)
        .toFixed(2)
    );
    const xGTeam2 = parseFloat(
      team2EventsFiltered
        .filter((event) => event.shot_statsbomb_xg)
        .reduce((sum, event) => sum + (event.shot_statsbomb_xg || 0), 0)
        .toFixed(2)
    );

    // Shots
    const shotsTeam1 = team1EventsFiltered.filter(
      (event) => event.type === 'Shot'
    ).length;
    const shotsTeam2 = team2EventsFiltered.filter(
      (event) => event.type === 'Shot'
    ).length;

    // Shots on Target
    const shotsOnTargetTeam1 = team1EventsFiltered.filter(
      (event) =>
        event.type === 'Shot' &&
        event.shot_end_location &&
        event.shot_end_location.length > 2 &&
        event.shot_outcome !== 'Off T'
    ).length;
    const shotsOnTargetTeam2 = team2EventsFiltered.filter(
      (event) =>
        event.type === 'Shot' &&
        event.shot_end_location &&
        event.shot_end_location.length > 2 &&
        event.shot_outcome !== 'Off T'
    ).length;

    // Passes
    const passesTeam1 = team1EventsFiltered.filter(
      (event) => event.type === 'Pass'
    ).length;
    const passesTeam2 = team2EventsFiltered.filter(
      (event) => event.type === 'Pass'
    ).length;

    // Pass Completion
    const successfulPassesTeam1 = team1EventsFiltered.filter(
      (event) => event.type === 'Pass' && !event.pass_outcome
    ).length;
    const passCompletionTeam1 = parseFloat(
      ((successfulPassesTeam1 / (passesTeam1 || 1)) * 100).toFixed(2)
    );

    const successfulPassesTeam2 = team2EventsFiltered.filter(
      (event) => event.type === 'Pass' && !event.pass_outcome
    ).length;
    const passCompletionTeam2 = parseFloat(
      ((successfulPassesTeam2 / (passesTeam2 || 1)) * 100).toFixed(2)
    );

    return [
      { name: 'xG', team1Value: xGTeam1, team2Value: xGTeam2 },
      { name: 'Shots', team1Value: shotsTeam1, team2Value: shotsTeam2 },
      {
        name: 'Shots on Target',
        team1Value: shotsOnTargetTeam1,
        team2Value: shotsOnTargetTeam2,
      },
      { name: 'Passes', team1Value: passesTeam1, team2Value: passesTeam2 },
      {
        name: 'Pass Completion %',
        team1Value: passCompletionTeam1,
        team2Value: passCompletionTeam2,
      },
    ];
  }
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
