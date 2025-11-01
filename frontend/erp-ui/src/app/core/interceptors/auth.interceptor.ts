import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthState } from '../services/auth-state.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const state = inject(AuthState);
  const token = state.token;
  // Do not attach token to public auth endpoints
  const url = req.url || '';
  const isAuthEndpoint = (
    url.includes('/api/auth/login') ||
    url.includes('/api/auth/registration/') ||
    url.includes('/api/auth/register/validate') ||
    url.includes('/api/auth/register/complete') ||
    url.includes('/api/auth/register/verify-otp') ||
    url.includes('/api/auth/validate')
  );
  if (token && !isAuthEndpoint) {
    req = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
  }
  return next(req);
};
