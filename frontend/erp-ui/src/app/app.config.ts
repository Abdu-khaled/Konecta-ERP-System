import { ApplicationConfig } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { AUTH_API_BASE_URL } from './features/auth/services/auth.service';
import { authInterceptor } from './features/auth/services/auth.interceptor';

const isDevOn4200 = typeof window !== 'undefined' && window.location.port === '4200';
const API_BASE = isDevOn4200 ? 'http://localhost:8081/api/auth' : '/api/auth';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
    { provide: AUTH_API_BASE_URL, useValue: API_BASE }
  ]
};
