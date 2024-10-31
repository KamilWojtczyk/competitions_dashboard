import { Component } from '@angular/core';
import { AsyncPipe, CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Observable } from 'rxjs';
import { Competition } from '../../models/competition.model';
import { Store } from '@ngrx/store';
import {
  selectAllCompetitions,
  selectCompetitionsLoading,
} from '../../state/competitions.selectors';
import {
  loadCompetitions,
  selectCompetitionButtonClicked,
} from '../../state/competitions.actions';
import { Router } from '@angular/router';

@Component({
  selector: 'app-competitions',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatToolbarModule,
    MatProgressSpinnerModule,
    AsyncPipe,
  ],
  templateUrl: './competitions.component.html',
  styleUrls: ['./competitions.component.scss'],
})
export class CompetitionsComponent {
  competitions$: Observable<Competition[]>;
  loading$: Observable<boolean>;
  displayedColumns: string[] = [
    'competition_name',
    'country_name',
    'season_name',
    'competition_gender',
  ];

  constructor(private store: Store, private router: Router) {
    this.competitions$ = this.store.select(selectAllCompetitions);
    this.loading$ = this.store.select(selectCompetitionsLoading);
  }

  ngOnInit() {
    this.store.dispatch(loadCompetitions());
  }

  onRowClick(competition: Competition) {
    this.store.dispatch(
      selectCompetitionButtonClicked({ selectedCompetition: competition })
    );
    this.router.navigate([`${competition.competition_id}/matches`]);
  }
}
