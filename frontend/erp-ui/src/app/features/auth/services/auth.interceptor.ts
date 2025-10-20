import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthState } from './auth.state';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const state = inject(AuthState);
  const token = state.token;
  // Do not attach token to auth endpoints (login/register/validate)
  const url = req.url || '';
  const isAuthEndpoint = url.includes('/api/auth/login') || url.includes('/api/auth/register') || url.includes('/api/auth/validate');
  if (token && !isAuthEndpoint) {
    req = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
  }
  return next(req);
};
