import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AUTH_API_BASE_URL } from '../../auth/services/auth.service';
import { Observable } from 'rxjs';

export type InviteRole = 'ADMIN' | 'HR' | 'FINANCE' | 'EMPLOYEE';

export interface InviteUserRequest {
  name: string;
  email: string;
  role: InviteRole;
}

export interface SystemUser {
  id: number;
  username: string;
  fullName?: string;
  email: string;
  role: InviteRole;
  status?: 'ACTIVE' | 'INACTIVE';
  otpVerified?: boolean;
  createdAt?: string;
}

@Injectable({ providedIn: 'root' })
export class AdminService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(AUTH_API_BASE_URL);

  inviteUser(payload: InviteUserRequest) {
    return this.http.post(`${this.baseUrl}/users/invite`, payload);
  }

  listUsers(q?: string): Observable<SystemUser[]> {
    const url = q && q.trim() ? `${this.baseUrl}/users?q=${encodeURIComponent(q.trim())}` : `${this.baseUrl}/users`;
    return this.http.get<SystemUser[]>(url);
  }
}
