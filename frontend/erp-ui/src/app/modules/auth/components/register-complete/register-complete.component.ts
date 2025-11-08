import { Component, computed, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { RegistrationService } from '../../services/registration.service';

@Component({
  selector: 'app-register-complete',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
  <div class="mx-auto max-w-md py-10">
    <h1 class="text-2xl font-semibold mb-6">Complete Your Profile</h1>
    <ng-container *ngIf="validation()?.valid; else invalid">
      <form (ngSubmit)="submit()" class="space-y-4">
        <div>
          <label class="block text-sm font-medium">Full name</label>
          <input [(ngModel)]="fullName" name="fullName" required class="w-full border rounded px-3 py-2"/>
        </div>
        <div>
          <label class="block text-sm font-medium">Phone</label>
          <input [(ngModel)]="phone" name="phone" class="w-full border rounded px-3 py-2"/>
        </div>
        <div>
          <label class="block text-sm font-medium">Username (optional)</label>
          <input [(ngModel)]="username" name="username" class="w-full border rounded px-3 py-2"/>
        </div>
        <div>
          <label class="block text-sm font-medium">Password</label>
          <input [(ngModel)]="password" name="password" type="password" required class="w-full border rounded px-3 py-2"/>
        </div>
        <div>
          <label class="block text-sm font-medium">Payout Card Type</label>
          <select [(ngModel)]="cardType" name="cardType" required class="w-full border rounded px-3 py-2">
            <option [ngValue]="'VISA'">Visa</option>
            <option [ngValue]="'MASTERCARD'">Mastercard</option>
          </select>
          <p class="text-xs text-slate-600 mt-1">Used by Finance to pay your salary.</p>
        </div>
        <div>
          <label class="block text-sm font-medium">Account Number</label>
          <input [(ngModel)]="accountNumber" name="accountNumber" required class="w-full border rounded px-3 py-2" placeholder="16-19 digits"/>
        </div>
        <button class="w-full bg-primary-600 text-white rounded px-3 py-2" [disabled]="loading()">Continue</button>
        <p *ngIf="error()" class="text-red-600 text-sm">{{error()}}</p>
        <p *ngIf="success()" class="text-green-700 text-sm">OTP sent to your email. Redirecting…</p>
      </form>
    </ng-container>
    <ng-template #invalid>
      <p class="text-red-600">Invalid or expired link. Please contact your admin for a new invite.</p>
    </ng-template>
  </div>
  `
})
export class RegisterCompleteComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly reg = inject(RegistrationService);

  token = this.route.snapshot.queryParamMap.get('token') || '';
  validation = signal<{ valid: boolean; reason?: string } | null>(null);
  loading = signal(false);
  error = signal('');
  success = signal(false);

  fullName = '';
  phone = '';
  username = '';
  password = '';
  accountNumber = '';
  cardType: 'VISA'|'MASTERCARD' = 'VISA';

  constructor() {
    this.reg.validate(this.token).subscribe({
      next: (v) => this.validation.set(v),
      error: () => this.validation.set({ valid: false })
    });
  }

  submit() {
    if (!this.token) { this.error.set('Missing token'); return; }
    this.loading.set(true);
    this.error.set('');
    this.reg.complete({ token: this.token, fullName: this.fullName, phone: this.phone, username: this.username, password: this.password })
      .subscribe({
        next: () => {
          this.success.set(true);
          setTimeout(() => this.router.navigate(['/auth/register/verify-otp'], { queryParams: { token: this.token, accountNumber: this.accountNumber, cardType: this.cardType } }), 800);
        },
        error: (e) => {
          this.error.set(e?.error?.message || 'Failed to send OTP');
          this.loading.set(false);
        }
      });
  }
}

