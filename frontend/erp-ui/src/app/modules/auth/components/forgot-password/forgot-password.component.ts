import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { NavThemeService } from '../../../../shared/nav-theme.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
  <div class="flex items-start justify-center min-h-[calc(100vh-64px)] pt-10">
    <div class="w-full max-w-lg bg-white shadow-2xl rounded-2xl p-10 border border-gray-200">
      <h2 class="text-2xl font-semibold mb-6">Forgot password</h2>

      <ng-container *ngIf="step() === 1; else step2Tpl">
        <p class="text-slate-600 mb-4">Enter your email. We'll send a 6‑digit code.</p>
        <label class="block text-base text-gray-600 mb-2">Email address</label>
        <input [(ngModel)]="email" type="email" class="w-full border border-gray-300 rounded-lg px-4 py-3 mb-2 focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-sm" placeholder="you@example.com" />
        <div class="text-red-600 text-sm" *ngIf="error()">{{ error() }}</div>
        <div class="text-green-600 text-sm" *ngIf="info()">{{ info() }}</div>
        <button (click)="sendCode()" class="w-full mt-4 bg-primary-600 hover:bg-primary-700 text-white py-3 rounded-lg text-base font-medium transition-colors shadow-md" [disabled]="sending()">{{ sending() ? 'Sending…' : 'Send Code' }}</button>
      </ng-container>

      <ng-template #step2Tpl>
        <p class="text-slate-600 mb-4">We sent a code to <b>{{ email }}</b>. Enter it and choose a new password.</p>
        <label class="block text-base text-gray-600 mb-2">OTP Code</label>
        <input [(ngModel)]="otp" maxlength="6" class="w-full border border-gray-300 rounded-lg px-4 py-3 mb-4 focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-sm" placeholder="123456" />

        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label class="block text-base text-gray-600 mb-2">New Password</label>
            <div class="relative">
              <input [(ngModel)]="password" [type]="showPw() ? 'text' : 'password'" class="w-full border border-gray-300 rounded-lg px-4 py-3 pr-10 focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-sm" placeholder="Enter new password" />
              <button type="button" (click)="showPw.set(!showPw())" class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700">
                <svg *ngIf="!showPw()" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8"><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                <svg *ngIf="showPw()" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.05 7.03 19 11.5 19c1.41 0 2.754-.265 3.975-.748l-1.73-1.73A6.973 6.973 0 0111.5 17C8.462 17 6 14.538 6 11.5c0-.69.11-1.354.314-1.973L3.98 8.223z"/><path d="M8.53 6.47l8.999 8.999 1.06-1.06L9.59 5.41 8.53 6.47z"/></svg>
              </button>
            </div>
          </div>
          <div>
            <label class="block text-base text-gray-600 mb-2">Confirm Password</label>
            <div class="relative">
              <input [(ngModel)]="confirmPassword" [type]="showPw2() ? 'text' : 'password'" class="w-full border border-gray-300 rounded-lg px-4 py-3 pr-10 focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-sm" placeholder="Confirm password" />
              <button type="button" (click)="showPw2.set(!showPw2())" class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700">
                <svg *ngIf="!showPw2()" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8"><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                <svg *ngIf="showPw2()" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.05 7.03 19 11.5 19c1.41 0 2.754-.265 3.975-.748l-1.73-1.73A6.973 6.973 0 0111.5 17C8.462 17 6 14.538 6 11.5c0-.69.11-1.354.314-1.973L3.98 8.223z"/><path d="M8.53 6.47l8.999 8.999 1.06-1.06L9.59 5.41 8.53 6.47z"/></svg>
              </button>
            </div>
          </div>
        </div>

        <div class="text-red-600 text-sm" *ngIf="error()">{{ error() }}</div>
        <div class="text-green-600 text-sm" *ngIf="info()">{{ info() }}</div>
        <button (click)="reset()" class="w-full mt-4 bg-primary-600 hover:bg-primary-700 text-white py-3 rounded-lg text-base font-medium transition-colors shadow-md" [disabled]="sending()">{{ sending() ? 'Resetting…' : 'Reset Password' }}</button>
      </ng-template>
    </div>
  </div>
  `
})
export class ForgotPasswordComponent {
  private readonly api = inject(AuthService);
  private readonly theme = inject(NavThemeService);
  private readonly router = inject(Router);

  step = signal<1 | 2>(1);
  email = '';
  otp = '';
  password = '';
  confirmPassword = '';
  sending = signal(false);
  error = signal<string | null>(null);
  info = signal<string | null>(null);
  showPw = signal(false);
  showPw2 = signal(false);

  constructor() { this.theme.setBrand(true); }

  async sendCode() {
    this.error.set(null); this.info.set(null);
    if (!this.email.trim()) { this.error.set('Email is required'); return; }
    this.sending.set(true);
    this.api.forgotStart(this.email).subscribe({
      next: () => { this.sending.set(false); this.step.set(2); this.info.set('OTP sent to your email'); },
      error: (e: any) => { this.sending.set(false); this.error.set(e?.error?.message || e?.message || 'Failed to send OTP'); }
    });
  }

  reset() {
    this.error.set(null); this.info.set(null);
    if ((this.password || '').length < 6) { this.error.set('Password should be at least 6 characters'); return; }
    if (this.password !== this.confirmPassword) { this.error.set('Passwords do not match'); return; }
    this.sending.set(true);
    this.api.forgotComplete({ email: this.email, otp: this.otp, password: this.password, confirmPassword: this.confirmPassword })
      .subscribe({
        next: () => { this.sending.set(false); this.info.set('Password reset successful'); setTimeout(() => this.router.navigate(['/auth/login']), 800); },
        error: (e: any) => { this.sending.set(false); this.error.set(e?.error?.message || e?.message || 'Failed to reset'); }
      });
  }
}
