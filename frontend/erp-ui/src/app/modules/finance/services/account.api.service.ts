import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FINANCE_API_BASE_URL } from './finance.api.service';

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
  getMyAccount(opts?: { suppressToasts?: boolean }) {
    const headers: any = {};
    if (opts?.suppressToasts) headers['X-Suppress-Error-Toast'] = '1';
    return this.http.get<any>(`${this.base}/accounts/me`, { headers });
  }
}
