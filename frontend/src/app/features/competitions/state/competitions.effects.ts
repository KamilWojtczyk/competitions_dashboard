import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import {
  catchError,
  debounce,
  debounceTime,
  map,
  of,
  switchMap,
  takeUntil,
} from 'rxjs';
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
} from './competitions.actions';
import { CompetitionsHttpService } from '../services/competitions-http.service';
import { concatLatestFrom } from '@ngrx/operators';
import { Store } from '@ngrx/store';
import { selectSelectedCompetition } from './competitions.selectors';

@Injectable()
export class CompetitionsEffects {
  constructor(
    private actions$: Actions,
    private competitionsHttpService: CompetitionsHttpService,
    private store: Store
  ) {}

  loadCompetitions$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(loadCompetitions),
      switchMap(() =>
        this.competitionsHttpService.getCompetitions().pipe(
          map((competitions) => loadCompetitionsSuccess({ competitions })),
          catchError(() => of(loadCompetitionsFailure()))
        )
      )
    );
  });

  loadMatches$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(matchesScreenInitialied),
      concatLatestFrom(() => this.store.select(selectSelectedCompetition)),
      switchMap(([_, competition]) => {
        return this.competitionsHttpService
          .getMatches(competition?.competition_id, competition?.season_id)
          .pipe(
            map((matches) => loadMatchesSuccess({ matches })),
            catchError(() => of(loadMatchesFailure()))
          );
      })
    );
  });

  loadTopScorers$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(loadMatchesSuccess),
      concatLatestFrom(() => this.store.select(selectSelectedCompetition)),
      switchMap(([_, competition]) =>
        this.competitionsHttpService
          .getTopScorers(
            competition?.country_name,
            competition?.competition_name,
            competition?.season_name,
            competition.competition_gender
          )
          .pipe(
            takeUntil(this.actions$.pipe(ofType(loadCompetitions))),
            map((topScorers) => loadTopScorersSuccess({ topScorers })),
            catchError(() => of(loadTopScorersFailure()))
          )
      )
    );
  });

  loadTopAssists$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(loadMatchesSuccess),
      debounceTime(300),
      concatLatestFrom(() => this.store.select(selectSelectedCompetition)),
      switchMap(([_, competition]) =>
        this.competitionsHttpService
          .getTopAssists(
            competition?.country_name,
            competition?.competition_name,
            competition?.season_name,
            competition.competition_gender
          )
          .pipe(
            takeUntil(this.actions$.pipe(ofType(loadCompetitions))),
            map((topAssists) => loadTopAssistsSuccess({ topAssists })),
            catchError(() => of(loadTopAssistsFailure()))
          )
      )
    );
  });
}
