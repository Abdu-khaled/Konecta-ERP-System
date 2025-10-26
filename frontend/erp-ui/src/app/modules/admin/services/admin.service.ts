import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AUTH_API_BASE_URL } from '../../auth/services/auth.service';

export type InviteRole = 'ADMIN' | 'HR' | 'FINANCE' | 'EMPLOYEE';

export interface InviteUserRequest {
  name: string;
  email: string;
  role: InviteRole;
}

@Injectable({ providedIn: 'root' })
export class AdminService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(AUTH_API_BASE_URL);

  inviteUser(payload: InviteUserRequest) {
    return this.http.post(`${this.baseUrl}/users/invite`, payload);
  }
}

