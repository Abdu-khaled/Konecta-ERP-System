import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NavThemeService } from '../../../../shared/nav-theme.service';
import { useRegister } from './useRegister.hook';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './register.component.html',
  styles: [`
    @keyframes fade-in {
      from { opacity: 0; transform: translateY(-10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-fade-in { animation: fade-in 0.3s ease-in-out; }
  `]
})
export class RegisterComponent implements OnInit, OnDestroy {
  username = '';
  email = '';
  password = '';

  usernameError = '';
  emailError = '';
  passwordError = '';
  showSuccess = false;
  successText = 'Registration successful!';

  register = useRegister();

  private readonly navTheme = inject(NavThemeService);
  constructor(private router: Router) {}

  ngOnInit(): void {
    this.navTheme.setBrand(true); // Blue navbar like Home
  }

  ngOnDestroy(): void {
    this.navTheme.setBrand(false);
  }

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
