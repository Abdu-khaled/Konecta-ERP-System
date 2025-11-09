import { ApplicationConfig } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { routes } from './app.routes';
import { AUTH_API_BASE_URL } from './modules/auth/services/auth.service';
import { HR_API_BASE_URL } from './modules/hr/services/hr.api.service';
import { FINANCE_API_BASE_URL } from './modules/finance/services/finance.api.service';
import { REPORTING_API_BASE_URL } from './modules/reports/services/reporting.api.service';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { loaderInterceptor } from './core/interceptors/loader.interceptor';
import { errorInterceptor } from './core/interceptors/error.interceptor';
import { API_BASES } from './core/config/api.config';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(
      routes,
      withInMemoryScrolling({
        anchorScrolling: 'enabled',
        scrollPositionRestoration: 'enabled'
      })
    ),
    provideHttpClient(withInterceptors([authInterceptor, loaderInterceptor, errorInterceptor])),
    { provide: AUTH_API_BASE_URL, useValue: API_BASES.auth },
    { provide: HR_API_BASE_URL, useValue: API_BASES.hr },
    { provide: FINANCE_API_BASE_URL, useValue: API_BASES.finance },
    { provide: REPORTING_API_BASE_URL, useValue: API_BASES.reporting }
  ]
};
