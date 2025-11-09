import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { ToastService } from '../services/toast.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toast = inject(ToastService);
  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      // Generic, privacy‑preserving user message (no URL, no status code)
      // Only surface for network/server errors; let feature code handle 4xx
      const isNetwork = err.status === 0;
      const isServer = err.status >= 500;
      if (isNetwork || isServer) {
        const message = isNetwork
          ? 'Network error. Please check your connection.'
          : 'Server error. Please try again later.';
        const suppress = req.headers.get('X-Suppress-Error-Toast');
        if (!suppress) toast.error(message);
      }
      return throwError(() => err);
    })
  );
};
