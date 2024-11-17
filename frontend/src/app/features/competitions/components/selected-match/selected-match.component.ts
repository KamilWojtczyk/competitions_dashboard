import { Component, OnInit } from '@angular/core';
import { Match } from '../../models/match.model';
import { Events } from '../../models/events.model';
import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import {
  selectMatchEvents,
  selectMatchStatistics,
  selectSelectedMatch,
  selectTopPlayerStats,
} from '../../state/competitions.selectors';
import { selectedMatchScreenInitialied } from '../../state/competitions.actions';
import { AsyncPipe, CommonModule, NgClass } from '@angular/common';
import { PassNetworkComponent } from '../../../../shared/components/pass-network/pass-network.component';
import { ShotMapComponent } from '../../../../shared/components/shot-map/shot-map.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatchStatsComponent } from '../../../../shared/components/match-stats/match-stats.component';
import { TeamStatistics } from '../../models/statistics.model';
import { StartingLineupComponent } from '../../../../shared/components/starting-lineup/starting-lineup.component';
import { ProgressivePassesComponent } from '../../../../shared/components/progressive-passes/progressive-passes.component';
import { xTChartComponent } from '../../../../shared/components/xt-chart/xt-chart.component';
import { HeatMapComponent } from '../../../../shared/components/heat-map/heat-map.component';
import { ShotQualityTimelineComponent } from '../../../../shared/components/shot-quality-timeline/shot-quality-timeline.component';
import { PassDirectionLengthDistributionComponent } from '../../../../shared/components/pass-direction-length-distribution/pass-direction-length-distribution.component';
import { CrossMapComponent } from '../../../../shared/components/cross-map/cross-map.component';
import { PressResistanceMapComponent } from '../../../../shared/components/press-resistance-map/press-resistance-map.component';
import { TransitionMapComponent } from '../../../../shared/components/transition-map/transition-map.component';
import { Zone14AnalysisComponent } from '../../../../shared/components/zone14-analysis/zone14-analysis.component';
import { MatToolbarModule } from '@angular/material/toolbar';
import { TopDefenderPitchComponent } from '../../../../shared/components/top-defender-pitch/top-defender-pitch.component';
import { TopDefendersBarChartComponent } from '../../../../shared/components/top-defenders-bar-chart/top-defenders-bar-chart.component';
import { TopPasserPitchComponent } from '../../../../shared/components/top-passer-pitch/top-passer-pitch.component';
import { TopPassersBarChartComponent } from '../../../../shared/components/top-passers-bar-chart/top-passers-bar-chart.component';
import { MatchTopPlayerStats } from '../../models/player.model';

@Component({
  selector: 'app-selected-match',
  standalone: true,
  imports: [
    CommonModule,
    NgClass,
    AsyncPipe,
    PassNetworkComponent,
    ShotMapComponent,
    MatchStatsComponent,
    StartingLineupComponent,
    ProgressivePassesComponent,
    xTChartComponent,
    HeatMapComponent,
    ShotQualityTimelineComponent,
    PassDirectionLengthDistributionComponent,
    CrossMapComponent,
    PressResistanceMapComponent,
    TransitionMapComponent,
    Zone14AnalysisComponent,
    TopPasserPitchComponent,
    TopPassersBarChartComponent,
    TopDefenderPitchComponent,
    TopDefendersBarChartComponent,
    MatProgressSpinnerModule,
    MatToolbarModule,
  ],
  templateUrl: './selected-match.component.html',
  styleUrl: './selected-match.component.scss',
})
export class SelectedMatchComponent implements OnInit {
  selectedMatch$: Observable<Match | null> =
    this.store.select(selectSelectedMatch);
  matchEvents$: Observable<Events[]> = this.store.select(selectMatchEvents);

  statistics$: Observable<TeamStatistics[] | null> = this.store.select(
    selectMatchStatistics
  );

  topPlayerStats$: Observable<MatchTopPlayerStats | null> =
    this.store.select(selectTopPlayerStats);

  constructor(private store: Store) {}

  ngOnInit() {
    this.store.dispatch(selectedMatchScreenInitialied());
  }
}
