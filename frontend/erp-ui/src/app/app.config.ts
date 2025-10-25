import { ApplicationConfig } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { routes } from './app.routes';
import { AUTH_API_BASE_URL } from './modules/auth/services/auth.service';
import { authInterceptor } from './core/interceptors/auth.interceptor';

const API_BASE = '/api/auth';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(
      routes,
      withInMemoryScrolling({
        anchorScrolling: 'enabled',
        scrollPositionRestoration: 'enabled'
      })
    ),
    provideHttpClient(withInterceptors([authInterceptor])),
    { provide: AUTH_API_BASE_URL, useValue: API_BASE }
  ]
};
