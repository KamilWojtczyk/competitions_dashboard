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
    title: 'Competitions',
    data: { breadcrumb: 'Competitions' },
  },
  {
    path: ':competition_id/matches',
    title: 'Matches',
    component: MatchesComponent,
    canActivate: [competitionsGuard],
    data: { breadcrumb: 'Matches' },
  },
  {
    path: ':competition_id/matches/players',
    title: 'Players',
    component: PlayersComponent,
    canActivate: [competitionsGuard],
    data: { breadcrumb: 'Players' },
  },
  {
    path: ':competition_id/matches/:match_id',
    title: 'Selected Match',
    component: SelectedMatchComponent,
    canActivate: [competitionsGuard],
    data: { breadcrumb: 'Match Details' },
  },

  {
    path: '**',
    redirectTo: '',
  },
];
