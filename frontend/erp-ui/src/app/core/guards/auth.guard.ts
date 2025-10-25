import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { AuthState } from '../services/auth-state.service';

export const authGuard: CanActivateFn = () => {
  const state = inject(AuthState);
  return !!state.token;
};

