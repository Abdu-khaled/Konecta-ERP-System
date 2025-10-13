import { inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../services/auth.service';

export function useRegister() {
  const auth = inject(AuthService);

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
    await firstValueFrom(
      auth.register({ username, email, password })
    );
  };

  return { handleRegister, validateInputs };
}
