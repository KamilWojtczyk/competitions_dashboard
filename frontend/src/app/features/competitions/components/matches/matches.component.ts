import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { Match } from '../../models/match.model';
import { Store } from '@ngrx/store';
import {
  selectMatches,
  selectMatchesLoading,
  selectTopAssists,
  selectTopAssistsLoading,
  selectTopPlayersLoading,
  selectTopScorers,
  selectTopScorersLoading,
} from '../../state/competitions.selectors';
import { CommonModule, AsyncPipe } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatToolbarModule } from '@angular/material/toolbar';
import {
  matchesScreenInitialied,
  selectMatchButtonClicked,
} from '../../state/competitions.actions';
import { TopPlayer } from '../../models/top-players.model';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-matches',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    AsyncPipe,
  ],
  templateUrl: './matches.component.html',
  styleUrl: './matches.component.scss',
})
export class MatchesComponent {
  matches$: Observable<Match[]>;
  loadingMatches$: Observable<boolean>;

  topScorers$: Observable<TopPlayer[]>;
  topAssists$: Observable<TopPlayer[]>;
  loadingTopPlayers$: Observable<boolean>;

  loadingTopScorers$: Observable<boolean>;
  loadingTopAssists$: Observable<boolean>;

  constructor(
    private store: Store,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.matches$ = this.store.select(selectMatches);
    this.loadingMatches$ = this.store.select(selectMatchesLoading);

    this.topScorers$ = this.store.select(selectTopScorers);
    this.topAssists$ = this.store.select(selectTopAssists);
    this.loadingTopPlayers$ = this.store.select(selectTopPlayersLoading);

    this.loadingTopScorers$ = this.store.select(selectTopScorersLoading);
    this.loadingTopAssists$ = this.store.select(selectTopAssistsLoading);
  }

  ngOnInit() {
    this.store.dispatch(matchesScreenInitialied());
  }

  navigateToSelectedMatch(match: Match) {
    console.log(match);
    this.store.dispatch(selectMatchButtonClicked({ selectedMatch: match }));
    this.router.navigate([match.match_id], { relativeTo: this.route });
  }
}
