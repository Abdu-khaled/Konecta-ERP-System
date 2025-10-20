import { ApplicationConfig } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { AUTH_API_BASE_URL } from './features/auth/services/auth.service';
import { authInterceptor } from './features/auth/services/auth.interceptor';

// Always use a relative API base so requests go through the reverse proxy
// (Nginx in containers, dev-server proxy in local `ng serve`).
const API_BASE = '/api/auth';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
    { provide: AUTH_API_BASE_URL, useValue: API_BASE }
  ]
};
