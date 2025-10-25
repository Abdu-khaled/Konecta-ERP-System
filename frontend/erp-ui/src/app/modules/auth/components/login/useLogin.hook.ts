import { inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { AuthState } from '../../../../core/services/auth-state.service';
import { Router } from '@angular/router';

export function useLogin() {
  const api = inject(AuthService);
  const state = inject(AuthState);
  const router = inject(Router);

  const validateInputs = (email: string, password: string) => {
    let emailError = '';
    let passwordError = '';

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      emailError = 'Email is required';
    } else if (!emailPattern.test(email)) {
      emailError = 'Please enter a valid email address';
    }

    const passwordPattern = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?#&])[A-Za-z\d@$!%*?#&]{6,12}$/;
    if (!password.trim()) {
      passwordError = 'Password is required';
    } else if (!passwordPattern.test(password)) {
      passwordError =
        'Password must be 6–12 characters long and include at least one letter, one number, and one special character (@, #, $, etc.)';
    }

    return { emailError, passwordError };
  };

  const handleLogin = async (email: string, password: string, remember: boolean) => {
    const { token } = await firstValueFrom(api.login({ email, password }));
    state.setToken(token, remember);
    const profile = await firstValueFrom(api.me());
    state.setProfile(profile);
  };

  const signInWithGoogle = () => {
    // Placeholder for social login
    console.log('Google login clicked');
  };

  const submit = async (email: string, password: string, remember: boolean) => {
    const { emailError, passwordError } = validateInputs(email, password);
    if (emailError || passwordError) {
      return { ok: false, errors: { emailError, passwordError } } as const;
    }

    await handleLogin(email, password, remember);

    const role = (state.profile?.role || '').toString().toLowerCase();
    const message = role ? `Welcome ${role}` : 'Login successful!';

    // Route to home after a short delay to allow the UI to show the toast
    setTimeout(() => router.navigate(['/']), 1000);

    return { ok: true, message } as const;
  };

  return { handleLogin, signInWithGoogle, validateInputs, submit };
}
