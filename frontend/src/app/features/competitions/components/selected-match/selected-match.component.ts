import { Component, OnInit } from '@angular/core';
import { Match } from '../../models/match.model';
import { Events } from '../../models/events.model';
import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import {
  selectMatchEvents,
  selectSelectedMatch,
} from '../../state/competitions.selectors';
import { selectedMatchScreenInitialied } from '../../state/competitions.actions';
import { AsyncPipe, CommonModule, NgClass } from '@angular/common';
import { PassNetworkComponent } from '../../../../shared/components/pass-network/pass-network.component';
import { ShotMapComponent } from '../../../../shared/components/shot-map/shot-map.component';

@Component({
  selector: 'app-selected-match',
  standalone: true,
  imports: [
    CommonModule,
    NgClass,
    AsyncPipe,
    PassNetworkComponent,
    ShotMapComponent,
  ],
  templateUrl: './selected-match.component.html',
  styleUrl: './selected-match.component.scss',
})
export class SelectedMatchComponent implements OnInit {
  selectedMatch$: Observable<Match | null> =
    this.store.select(selectSelectedMatch);
  matchEvents$: Observable<Events[]> = this.store.select(selectMatchEvents);

  constructor(private store: Store) {}

  ngOnInit() {
    this.store.dispatch(selectedMatchScreenInitialied());
  }
}
