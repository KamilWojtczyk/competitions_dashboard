import { Component, input } from '@angular/core';
import { TeamStatistics } from '../../../features/competitions/models/statistics.model';

@Component({
  selector: 'app-match-stats',
  templateUrl: './match-stats.component.html',
  styleUrls: ['./match-stats.component.scss'],
  standalone: true,
})
export class MatchStatsComponent {
  statistics = input.required<TeamStatistics[]>();
  homeTeamName = input.required<string>();
  awayTeamName = input.required<string>();

  calculateBarWidth(value: number, otherValue: number): number {
    const total = value + otherValue;
    return total === 0 ? 50 : (value / total) * 100;
  }
}
