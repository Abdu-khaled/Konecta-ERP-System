import { CanActivateFn, ActivatedRouteSnapshot } from '@angular/router';
import { inject } from '@angular/core';
import { AuthState } from '../services/auth-state.service';

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const state = inject(AuthState);
  const required = (route.data?.['roles'] as string[] | undefined) || [];
  const role = state.profile?.role;
  return required.length ? required.includes(role || '') : true;
};