import { Component, OnInit } from '@angular/core';
import { playersScreenInitialied } from '../../state/competitions.actions';
import { Store } from '@ngrx/store';
import { CommonModule, AsyncPipe } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivatedRoute, Router } from '@angular/router';
import { Player } from '../../models/player.model';
import { Observable } from 'rxjs';
import {
  selectPlayers,
  selectPlayersLoading,
} from '../../state/competitions.selectors';

@Component({
  selector: 'app-players',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    AsyncPipe,
  ],
  templateUrl: './players.component.html',
  styleUrl: './players.component.scss',
})
export class PlayersComponent implements OnInit {
  players$: Observable<Player[]>;
  loadingPlayers$: Observable<boolean>;

  constructor(
    private store: Store,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.players$ = this.store.select(selectPlayers);
    this.loadingPlayers$ = this.store.select(selectPlayersLoading);
  }

  ngOnInit(): void {
    this.store.dispatch(playersScreenInitialied());
  }

  navigateToSelectedPlayer(player: Player) {
    // this.store.dispatch(selectMatchButtonClicked({ selectedMatch: match }));
    // this.router.navigate([match.match_id], { relativeTo: this.route });
  }
}
