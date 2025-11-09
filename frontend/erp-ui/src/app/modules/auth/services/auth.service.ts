import { Injectable, InjectionToken, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UserProfile } from '../../../core/services/auth-state.service';

export const AUTH_API_BASE_URL = new InjectionToken<string>('AUTH_API_BASE_URL');

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse { token: string; }

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(AUTH_API_BASE_URL);

  login(payload: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/login`, payload);
  }

  me(): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.baseUrl}/me`);
  }

  updateMe(payload: { username?: string; password?: string; confirmPassword?: string }): Observable<UserProfile> {
    return this.http.put<UserProfile>(`${this.baseUrl}/me`, payload);
  }

  // Forgot password flow
  forgotStart(email: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/forgot/start`, { email });
  }

  forgotComplete(payload: { email: string; otp: string; password: string; confirmPassword: string }): Observable<any> {
    return this.http.post(`${this.baseUrl}/forgot/complete`, payload);
  }
}
