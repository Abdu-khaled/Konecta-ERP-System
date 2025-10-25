import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NavThemeService } from '../../../../shared/nav-theme.service';
import { useLogin } from './useLogin.hook';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styles: [`
    @keyframes fade-in {
      from { opacity: 0; transform: translateY(-10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-fade-in { animation: fade-in 0.3s ease-in-out; }
  `]
})
export class LoginComponent implements OnInit, OnDestroy {
  email = '';
  password = '';
  remember = false;
  emailError = '';
  passwordError = '';
  showSuccess = false;
  successText = 'Login successful!';

  login = useLogin();

  private readonly navTheme = inject(NavThemeService);
  constructor(private router: Router) {}

  ngOnInit(): void {
    this.navTheme.setBrand(true);
  }

  ngOnDestroy(): void {
    this.navTheme.setBrand(false);
  }

  async onSubmit() {
    const res = await this.login.submit(this.email, this.password, this.remember);
    if (!res.ok) {
      this.emailError = res.errors?.emailError ?? '';
      this.passwordError = res.errors?.passwordError ?? '';
      return;
    }
    this.emailError = '';
    this.passwordError = '';
    this.successText = res.message ?? this.successText;
    this.showSuccess = true;
    setTimeout(() => (this.showSuccess = false), 1200);
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
