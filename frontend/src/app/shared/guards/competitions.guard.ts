import { inject } from '@angular/core';
import { Router, UrlTree } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { selectAllCompetitions } from '../../features/competitions/state/competitions.selectors';

export const competitionsGuard = (): Observable<boolean | UrlTree> => {
  const store = inject(Store);
  const router = inject(Router);

  return store.select(selectAllCompetitions).pipe(
    take(1),
    map((competitions) => {
      if (competitions && competitions.length > 0) {
        return true;
      } else {
        return router.createUrlTree(['/']);
      }
    })
  );
};
