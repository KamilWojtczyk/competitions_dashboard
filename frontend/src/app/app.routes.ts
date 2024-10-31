import { Routes } from '@angular/router';
import { CompetitionsComponent } from './features/competitions/components/competitions/competitions.component';
import { MatchesComponent } from './features/competitions/components/matches/matches.component';
import { SelectedMatchComponent } from './features/competitions/components/selected-match/selected-match.component';
import { PlayersComponent } from './features/competitions/components/players/players.component';
import { competitionsGuard } from './shared/guards/competitions.guard';

export const routes: Routes = [
  {
    path: '',
    component: CompetitionsComponent,
    data: { breadcrumb: 'Competitions' },
  },
  {
    path: ':competition_id/matches',
    component: MatchesComponent,
    canActivate: [competitionsGuard],
    data: { breadcrumb: 'Matches' },
  },
  {
    path: ':competition_id/matches/:match_id',
    component: SelectedMatchComponent,
    canActivate: [competitionsGuard],
    data: { breadcrumb: 'Match Details' },
  },
  {
    path: ':competition_id/matches/players',
    component: PlayersComponent,
    canActivate: [competitionsGuard],
    data: { breadcrumb: 'Players' },
  },
  {
    path: '**',
    redirectTo: '',
  },
];
