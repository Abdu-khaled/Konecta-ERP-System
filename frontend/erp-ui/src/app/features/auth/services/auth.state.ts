import { Injectable, inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { AUTH_API_BASE_URL } from './auth.service';

export interface UserProfile {
  id: number;
  username: string;
  email: string;
  role: string;
}

@Injectable({ providedIn: 'root' })
export class AuthState {
  private readonly tokenKey = 'auth_token';
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(AUTH_API_BASE_URL);

  private tokenSubject = new BehaviorSubject<string | null>(null);
  token$ = this.tokenSubject.asObservable();

  private profileSubject = new BehaviorSubject<UserProfile | null>(null);
  profile$ = this.profileSubject.asObservable();

  constructor() {
    // Try to hydrate from storage
    const token = localStorage.getItem(this.tokenKey) || sessionStorage.getItem(this.tokenKey);
    if (token) {
      this.tokenSubject.next(token);
      // Attempt a lazy profile fetch; ignore failure silently
      this.http.get<UserProfile>(`${this.baseUrl}/me`).subscribe({
        next: (p) => this.profileSubject.next(p),
        error: (err) => {
          // If token is invalid/expired, clear state so app treats user as logged out
          const status = err?.status ?? 0;
          if (status === 401 || status === 403) {
            this.clear();
          }
        }
      });
    }
  }

  get token(): string | null { return this.tokenSubject.value; }
  get profile(): UserProfile | null { return this.profileSubject.value; }

  setToken(token: string, remember: boolean) {
    this.clearTokenOnly();
    (remember ? localStorage : sessionStorage).setItem(this.tokenKey, token);
    this.tokenSubject.next(token);
  }

  setProfile(profile: UserProfile) {
    this.profileSubject.next(profile);
  }

  clear() {
    this.clearTokenOnly();
    this.profileSubject.next(null);
  }

  private clearTokenOnly() {
    localStorage.removeItem(this.tokenKey);
    sessionStorage.removeItem(this.tokenKey);
    this.tokenSubject.next(null);
  }
}
