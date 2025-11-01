import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { RegistrationService } from '../../services/registration.service';

@Component({
  selector: 'app-register-verify',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
  <div class="mx-auto max-w-md py-10">
    <h1 class="text-2xl font-semibold mb-6">Verify OTP</h1>
    <form (ngSubmit)="submit()" class="space-y-4">
      <div>
        <label class="block text-sm font-medium">OTP</label>
        <input [(ngModel)]="otp" name="otp" required class="w-full border rounded px-3 py-2"/>
      </div>
      <button class="w-full bg-primary-600 text-white rounded px-3 py-2" [disabled]="loading()">Verify</button>
      <p *ngIf="error()" class="text-red-600 text-sm">{{error()}}</p>
      <p *ngIf="success()" class="text-green-700 text-sm">Account activated. Redirecting to login…</p>
    </form>
  </div>
  `
})
export class RegisterVerifyComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly reg = inject(RegistrationService);

  token = this.route.snapshot.queryParamMap.get('token') || '';
  otp = '';
  loading = signal(false);
  error = signal('');
  success = signal(false);

  submit() {
    if (!this.token) { this.error.set('Missing token'); return; }
    this.loading.set(true);
    this.error.set('');
    this.reg.verifyOtp({ token: this.token, otp: this.otp }).subscribe({
      next: () => {
        this.success.set(true);
        setTimeout(() => this.router.navigate(['/auth/login'], { queryParams: { activated: '1' } }), 800);
      },
      error: (e) => {
        this.error.set(e?.error?.message || 'Invalid or expired OTP');
        this.loading.set(false);
      }
    })
  }
}

