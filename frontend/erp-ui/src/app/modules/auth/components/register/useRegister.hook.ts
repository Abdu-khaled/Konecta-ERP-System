import { inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

export function useRegister() {
  const auth = inject(AuthService);
  const router = inject(Router);

  const validateInputs = (username: string, email: string, password: string) => {
    let usernameError = '';
    let emailError = '';
    let passwordError = '';

    if (!username.trim()) {
      usernameError = 'Username is required';
    } else if (username.length < 3 || username.length > 20) {
      usernameError = 'Username must be 3–20 characters long';
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      emailError = 'Email is required';
    } else if (!emailPattern.test(email)) {
      emailError = 'Please enter a valid email address';
    }

    const passwordPattern = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{6,12}$/;
    if (!password.trim()) {
      passwordError = 'Password is required';
    } else if (!passwordPattern.test(password)) {
      passwordError =
        'Password must be 6–12 characters long and include at least one letter, one number, and one special character (@, #, $, etc.)';
    }

    return { usernameError, emailError, passwordError };
  };

  const handleRegister = async (username: string, email: string, password: string) => {
    await firstValueFrom(auth.register({ username, email, password }));
  };

  const submit = async (username: string, email: string, password: string) => {
    const { usernameError, emailError, passwordError } = validateInputs(username, email, password);
    if (usernameError || emailError || passwordError) {
      return { ok: false, errors: { usernameError, emailError, passwordError } } as const;
    }
    await handleRegister(username, email, password);
    // Navigate to login after a short delay so UI can show a toast
    setTimeout(() => router.navigate(['/auth/login'], { queryParams: { registered: '1' } }), 1000);
    return { ok: true, message: 'Registration successful!' } as const;
  };

  return { handleRegister, validateInputs, submit };
}
