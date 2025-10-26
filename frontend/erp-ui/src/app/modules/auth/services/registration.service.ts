import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AUTH_API_BASE_URL } from './auth.service';

export interface RegistrationValidateResponse {
  valid: boolean;
  reason?: string;
  email?: string;
  name?: string;
  role?: string;
}

export interface RegistrationCompleteRequest {
  token: string;
  fullName: string;
  phone?: string;
  username?: string;
  password: string;
}

export interface VerifyOtpRequest {
  token: string;
  otp: string;
}

@Injectable({ providedIn: 'root' })
export class RegistrationService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(AUTH_API_BASE_URL);

  validate(token: string) {
    return this.http.get<RegistrationValidateResponse>(`${this.baseUrl}/register/validate`, { params: { token } });
  }

  complete(payload: RegistrationCompleteRequest) {
    return this.http.post(`${this.baseUrl}/register/complete`, payload);
  }

  verifyOtp(payload: VerifyOtpRequest) {
    return this.http.post(`${this.baseUrl}/register/verify-otp`, payload);
  }
}

