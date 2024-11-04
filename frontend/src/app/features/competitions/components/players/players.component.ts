import { Component, OnInit } from '@angular/core';
import { playersScreenInitialied } from '../../state/competitions.actions';
import { Store } from '@ngrx/store';

@Component({
  selector: 'app-players',
  standalone: true,
  imports: [],
  templateUrl: './players.component.html',
  styleUrl: './players.component.scss',
})
export class PlayersComponent implements OnInit {
  constructor(private store: Store) {}

  ngOnInit(): void {
    this.store.dispatch(playersScreenInitialied());
  }
}
