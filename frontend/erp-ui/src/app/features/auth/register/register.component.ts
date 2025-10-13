import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { useRegister } from './useRegister.hook';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
  <div
    *ngIf="showSuccess"
    class="fixed right-5 top-[calc(var(--navbar-height)+1rem)] z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-fade-in"
  >
    <span>{{ successText }}</span>
  </div>

  <!-- Registration form -->
  <div class="flex items-start justify-center min-h-[calc(100vh-64px)] pt-10">
  <div class="w-full max-w-lg bg-white shadow-2xl rounded-2xl p-10 border border-gray-200">

      <p class="text-gray-500 text-sm mb-1">Create your account</p>
      <h2 class="text-3xl font-semibold mb-8">Sign up</h2>

      <form (ngSubmit)="onSubmit()" class="flex flex-col gap-5">
        <!-- Username -->
        <div>
          <label class="block text-base text-gray-600 mb-2">Username</label>
          <input
            [(ngModel)]="username"
            (ngModelChange)="validateLive()"
            name="username"
            type="text"
            placeholder="Enter your username"
            class="w-full border border-gray-300 rounded-lg px-4 py-3 text-base focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-sm"
            required
          />
          <p *ngIf="usernameError" class="text-red-500 text-sm mt-1">{{ usernameError }}</p>
        </div>

        <!-- Email -->
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

        <!-- Password -->
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

        <button
          type="submit"
          class="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg text-base font-medium transition-colors shadow-md"
        >
          Create Account
        </button>

        <p class="text-center text-gray-600 text-sm mt-3">
          Already have an account?
          <a (click)="goToLogin()" class="text-blue-600 hover:underline font-medium cursor-pointer">
            Login
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
export class RegisterComponent {
  username = '';
  email = '';
  password = '';

  usernameError = '';
  emailError = '';
  passwordError = '';
  showSuccess = false;
  successText = 'Registration successful!';

  register = useRegister();

  constructor(private router: Router) {}

  async onSubmit() {
    const res = await this.register.submit(this.username, this.email, this.password);
    if (!res.ok) {
      this.usernameError = res.errors?.usernameError ?? '';
      this.emailError = res.errors?.emailError ?? '';
      this.passwordError = res.errors?.passwordError ?? '';
      return;
    }
    this.usernameError = '';
    this.emailError = '';
    this.passwordError = '';
    this.successText = res.message ?? this.successText;
    this.showSuccess = true;
    setTimeout(() => (this.showSuccess = false), 1200);
  }

  validateLive() {
    const validation = this.register.validateInputs(this.username, this.email, this.password);
    this.usernameError = validation.usernameError;
    this.emailError = validation.emailError;
    this.passwordError = validation.passwordError;
  }

  goToLogin() {
    this.router.navigate(['/auth/login']);
  }
}
