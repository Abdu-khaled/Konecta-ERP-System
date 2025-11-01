import { Injectable, InjectionToken, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export const HR_API_BASE_URL = new InjectionToken<string>('HR_API_BASE_URL', {
  providedIn: 'root',
  factory: () => '/api/hr'
});

@Injectable({ providedIn: 'root' })
export class HrService {}
