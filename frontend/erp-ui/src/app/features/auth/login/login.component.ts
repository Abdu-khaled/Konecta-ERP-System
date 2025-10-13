import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { useLogin } from './useLogin.hook';
import { AuthState } from '../services/auth.state';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
  <div
    *ngIf="showSuccess"
    class="fixed right-5 top-[calc(var(--navbar-height)+1rem)] z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-fade-in"
  >
    <span>{{ successText }}</span>
  </div>

  <div class="flex items-start justify-center min-h-[calc(100vh-64px)] pt-10">
<div class="w-full max-w-lg bg-white shadow-2xl rounded-2xl p-10 border border-gray-200">
      <p class="text-gray-500 text-sm mb-1">Please enter your details</p>
      <h2 class="text-3xl font-semibold mb-8">Welcome back</h2>

      <form (ngSubmit)="onSubmit()" class="flex flex-col gap-5">
        <div>
          <label class="block text-base text-gray-600 mb-2">Email address</label>
          <input
            [(ngModel)]="email"
            (ngModelChange)="validateLive()"
            name="email"
            type="email"
            placeholder="Enter your email"
            class="w-full border border-gray-300 rounded-lg px-4 py-3 text-base focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-sm"
            required
          />
          <p *ngIf="emailError" class="text-red-500 text-sm mt-1">{{ emailError }}</p>
        </div>

        <div>
          <label class="block text-base text-gray-600 mb-2">Password</label>
          <input
            [(ngModel)]="password"
            (ngModelChange)="validateLive()"
            name="password"
            type="password"
            placeholder="••••••••"
            class="w-full border border-gray-300 rounded-lg px-4 py-3 text-base focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-sm"
            required
          />
          <p *ngIf="passwordError" class="text-red-500 text-sm mt-1">{{ passwordError }}</p>
        </div>

        <div class="flex items-center justify-between text-sm">
          <label class="flex items-center gap-2 text-gray-600">
            <input type="checkbox" [(ngModel)]="remember" name="remember" class="accent-blue-600" />
            Remember for 30 days
          </label>
          <a href="#" class="text-blue-600 hover:underline">Forgot password</a>
        </div>

        <button
          type="submit"
          class="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg text-base font-medium transition-colors shadow-md"
        >
          Login
        </button>

        <button
          type="button"
          (click)="signInWithGoogle()"
          class="w-full border border-gray-300 py-3 rounded-lg flex items-center justify-center gap-3 text-gray-700 hover:bg-gray-100 text-base shadow-sm"
        >
          <img src="https://www.svgrepo.com/show/355037/google.svg" width="22" height="22" />
          Sign in with Google
        </button>

        <p class="text-center text-gray-600 text-sm mt-3">
          Don’t have an account?
          <a (click)="goToRegister()" class="text-blue-600 hover:underline font-medium cursor-pointer">
            Sign up
          </a>
        </p>
      </form>
    </div>
  </div>
  `,
  styles: [`
    @keyframes fade-in {
      from { opacity: 0; transform: translateY(-10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-fade-in { animation: fade-in 0.3s ease-in-out; }
  `]
})
export class LoginComponent {
  email = '';
  password = '';
  remember = false;
  emailError = '';
  passwordError = '';
  showSuccess = false;
  successText = 'Login successful!';

  login = useLogin();
  private readonly state = inject(AuthState);

  constructor(private router: Router) {}

  async onSubmit() {
    const validation = this.login.validateInputs(this.email, this.password);
    this.emailError = validation.emailError;
    this.passwordError = validation.passwordError;

    if (!this.emailError && !this.passwordError) {
      try {
        await this.login.handleLogin(this.email, this.password, this.remember);
        const role = (this.state.profile?.role || '').toString().toLowerCase();
        this.successText = role ? `Welcome ${role}` : 'Login successful!';
        this.showSuccess = true;
        setTimeout(() => {
          this.showSuccess = false;
          this.router.navigate(['/']);
        }, 1000);
      } catch {
        this.passwordError = 'Invalid email or password';
      }
    }
  }

  validateLive() {
    const validation = this.login.validateInputs(this.email, this.password);
    this.emailError = validation.emailError;
    this.passwordError = validation.passwordError;
  }

  goToRegister() {
    this.router.navigate(['/auth/register']);
  }

  signInWithGoogle() {
    this.login.signInWithGoogle();
  }
}
