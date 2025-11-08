import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../modules/auth/services/auth.service';
import { AccountApiService } from '../../modules/finance/services/account.api.service';
import { AuthState } from '../../core/services/auth-state.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
  <section class="p-6 max-w-2xl mx-auto">
    <h1 class="text-2xl font-semibold mb-4">My Profile</h1>
    <div class="rounded-lg border bg-white p-4">
      <form [formGroup]="form" (ngSubmit)="save()" class="space-y-4">
        <div>
          <label class="block text-sm text-slate-600 mb-1">Email</label>
          <input class="w-full border rounded px-3 py-2 bg-slate-50" [value]="email" disabled />
        </div>
        <div>
          <label class="block text-sm text-slate-600 mb-1">Username</label>
          <input class="w-full border rounded px-3 py-2" formControlName="username" />
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label class="block text-sm text-slate-600 mb-1">New Password</label>
            <div class="relative">
              <input [type]="showPw() ? 'text' : 'password'" class="w-full border rounded px-3 py-2 pr-10" formControlName="password" autocomplete="new-password" />
              <button type="button" (click)="togglePw()" class="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700" aria-label="Toggle password visibility">
                <svg *ngIf="!showPw()" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                  <path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                </svg>
                <svg *ngIf="showPw()" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.05 7.03 19 11.5 19c1.41 0 2.754-.265 3.975-.748l-1.73-1.73A6.973 6.973 0 0111.5 17C8.462 17 6 14.538 6 11.5c0-.69.11-1.354.314-1.973L3.98 8.223z"/>
                  <path d="M8.53 6.47l8.999 8.999 1.06-1.06L9.59 5.41 8.53 6.47z"/>
                </svg>
              </button>
            </div>
          </div>
          <div>
            <label class="block text-sm text-slate-600 mb-1">Confirm Password</label>
            <div class="relative">
              <input [type]="showPw2() ? 'text' : 'password'" class="w-full border rounded px-3 py-2 pr-10" formControlName="confirmPassword" autocomplete="new-password" />
              <button type="button" (click)="togglePw2()" class="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700" aria-label="Toggle confirm password visibility">
                <svg *ngIf="!showPw2()" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                  <path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                </svg>
                <svg *ngIf="showPw2()" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.05 7.03 19 11.5 19c1.41 0 2.754-.265 3.975-.748l-1.73-1.73A6.973 6.973 0 0111.5 17C8.462 17 6 14.538 6 11.5c0-.69.11-1.354.314-1.973L3.98 8.223z"/>
                  <path d="M8.53 6.47l8.999 8.999 1.06-1.06L9.59 5.41 8.53 6.47z"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label class="block text-sm text-slate-600 mb-1">Card Type</label>
            <select class="w-full border rounded px-3 py-2" formControlName="cardType">
              <option [ngValue]="'VISA'">Visa</option>
              <option [ngValue]="'MASTERCARD'">Mastercard</option>
            </select>
          </div>
          <div>
            <label class="block text-sm text-slate-600 mb-1">Account Number</label>
            <input class="w-full border rounded px-3 py-2" formControlName="accountNumber" placeholder="16-19 digits" />
          </div>
        </div>
        <div *ngIf="error()" class="text-red-600 text-sm">{{ error() }}</div>
        <div *ngIf="success()" class="text-green-600 text-sm" aria-live="polite">{{ success() }}</div>
        <div class="flex gap-2">
          <button type="submit" [disabled]="saving() || form.invalid" class="px-4 py-2 rounded bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-50">
            {{ saving() ? 'Saving...' : 'Save Changes' }}
          </button>
        </div>
      </form>
    </div>
  </section>
  `
})
export class ProfileComponent {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(AuthService);
  private readonly accountApi = inject(AccountApiService);
  private readonly state = inject(AuthState);

  saving = signal(false);
  error = signal<string | null>(null);
  success = signal<string | null>(null);
  showPw = signal(false);
  showPw2 = signal(false);

  email = this.state.profile?.email || '';

  form: FormGroup = this.fb.group({
    username: [this.state.profile?.username || '', [Validators.required, Validators.minLength(3)]],
    password: [''],
    confirmPassword: [''],
    cardType: ['VISA', [Validators.required]],
    accountNumber: ['', []]
  });

  constructor() {
    // Prefill account fields for the logged-in user
    this.accountApi.getMyAccount().subscribe({
      next: (acc: any) => {
        if (acc) {
          this.form.patchValue({
            accountNumber: acc.accountNumber || '',
            cardType: (acc.cardType || 'VISA') as any
          });
        }
      },
      error: () => {}
    });
  }

  save() {
    this.error.set(null);
    this.success.set(null);
    if (this.form.invalid) return;
    const { username, password, confirmPassword } = this.form.value as { username: string; password?: string; confirmPassword?: string };
    if ((password || '').length > 0 && password !== confirmPassword) {
      this.error.set('Passwords do not match');
      return;
    }
    this.saving.set(true);
    // First update auth profile
    this.api.updateMe({ username, password: password || undefined, confirmPassword: confirmPassword || undefined })
      .subscribe({
        next: (profile) => {
          this.state.setProfile(profile);
          // Then ensure payout account (best-effort)
          const accNum = (this.form.value as any).accountNumber as string;
          const cardType = (this.form.value as any).cardType as 'VISA'|'MASTERCARD';
          if (accNum && cardType) {
            this.accountApi.ensureAccount({ userId: profile.id, username: profile.username, email: profile.email, accountNumber: accNum, cardType }).subscribe({
              next: () => {
                this.form.patchValue({ password: '', confirmPassword: '' });
                this.success.set((password || '').length > 0 ? 'Password and account updated' : 'Account updated');
                this.saving.set(false);
              },
              error: () => {
                this.form.patchValue({ password: '', confirmPassword: '' });
                this.success.set((password || '').length > 0 ? 'Password updated (account save failed)' : 'Profile updated (account save failed)');
                this.saving.set(false);
              }
            });
          } else {
            // No account changes
            this.form.patchValue({ password: '', confirmPassword: '' });
            this.success.set((password || '').length > 0 ? 'Password updated successfully' : 'Profile updated');
            this.saving.set(false);
          }
        },
        error: (e) => { this.error.set(e?.error?.message || e?.message || 'Failed to update'); this.saving.set(false); }
      });
  }

  togglePw() { this.showPw.set(!this.showPw()); }
  togglePw2() { this.showPw2.set(!this.showPw2()); }
}
