import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AUTH_API_BASE_URL } from '../../modules/auth/services/auth.service';

export type UserRole = 'ADMIN' | 'HR' | 'FINANCE' | 'EMPLOYEE';

export interface SystemUser {
  id: number;
  username: string;
  fullName?: string;
  email: string;
  role: UserRole;
  status?: 'ACTIVE' | 'INACTIVE';
  otpVerified?: boolean;
  createdAt?: string;
}

@Injectable({ providedIn: 'root' })
export class UserApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(AUTH_API_BASE_URL);

  listUsers(q?: string, role?: UserRole): Observable<SystemUser[]> {
    const params: string[] = [];
    if (q && q.trim()) params.push(`q=${encodeURIComponent(q.trim())}`);
    if (role) params.push(`role=${encodeURIComponent(role)}`);
    const qs = params.length ? `?${params.join('&')}` : '';
    return this.http.get<SystemUser[]>(`${this.baseUrl}/users${qs}`);
  }

  listEmployeeUsers(q?: string): Observable<SystemUser[]> {
    return this.listUsers(q, 'EMPLOYEE');
  }
}

