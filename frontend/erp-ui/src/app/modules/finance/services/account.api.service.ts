import { Injectable, InjectionToken, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export const FINANCE_API_BASE_URL = new InjectionToken<string>('FINANCE_API_BASE_URL', {
  providedIn: 'root',
  factory: () => '/api/finance'
});

@Injectable({ providedIn: 'root' })
export class AccountApiService {
  private readonly http = inject(HttpClient);
  private readonly base = inject(FINANCE_API_BASE_URL);

  ensureAccount(payload: { userId?: number; username?: string; email?: string; accountNumber: string; cardType: 'VISA'|'MASTERCARD' }) {
    return this.http.post(`${this.base}/accounts/ensure`, payload);
  }
  getAccountByEmail(email: string) {
    return this.http.get<any>(`${this.base}/accounts/by-email`, { params: { email } });
  }
  getMyAccount() { return this.http.get<any>(`${this.base}/accounts/me`); }
}
