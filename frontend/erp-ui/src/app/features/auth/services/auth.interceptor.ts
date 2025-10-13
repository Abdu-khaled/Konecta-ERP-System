import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthState } from './auth.state';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const state = inject(AuthState);
  const token = state.token;
  if (token) {
    req = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
  }
  return next(req);
};

