import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { provideRouterStore, routerReducer } from '@ngrx/router-store';

import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { competitionsReducer } from './features/competitions/state/competitions.reducer';
import { CompetitionsEffects } from './features/competitions/state/competitions.effects';
import { environment } from '../environments/environment';
import { MergedRouterStateSerializer } from './router.selector';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideClientHydration(),
    provideAnimationsAsync(),
    provideHttpClient(withFetch()),
    provideStore({
      competitions: competitionsReducer,
      router: routerReducer,
    }),
    provideRouterStore({ serializer: MergedRouterStateSerializer }),
    provideEffects([CompetitionsEffects]),
    provideStoreDevtools({ maxAge: 25, logOnly: environment.production }),
  ],
};
