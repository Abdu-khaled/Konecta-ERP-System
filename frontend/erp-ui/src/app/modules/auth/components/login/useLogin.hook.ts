import { inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { AuthState } from '../../../../core/services/auth-state.service';
import { Router } from '@angular/router';

export function useLogin() {
  const api = inject(AuthService);
  const state = inject(AuthState);
  const router = inject(Router);

  // No client-side validation; rely on server responses
  const validateInputs = (_email: string, _password: string) => ({ emailError: '', passwordError: '' });

  const handleLogin = async (email: string, password: string, remember: boolean) => {
    const { token } = await firstValueFrom(api.login({ email, password }));
    state.setToken(token, remember);
    const profile = await firstValueFrom(api.me());
    state.setProfile(profile);
  };


  const submit = async (email: string, password: string, remember: boolean) => {
    try {
      await handleLogin(email, password, remember);
    } catch (err: any) {
      const status = err?.status ?? err?.error?.status ?? 0;
      if (status === 401) {
        return { ok: false, errors: { emailError: 'Wrong email or password', passwordError: 'Wrong email or password' } } as const;
      }
      if (status === 403) {
        return { ok: false, errors: { emailError: 'Account not activated. Please check your email.', passwordError: '' } } as const;
      }
      return { ok: false, errors: { emailError: 'Login failed. Try again.', passwordError: '' } } as const;
    }

    const role = (state.profile?.role || '').toString().toLowerCase();
    const message = role ? `Welcome ${role}` : 'Login successful!';

    // Navigate to the appropriate dashboard after a short delay
    setTimeout(() => {
      switch (role) {
        case 'admin':
          router.navigate(['/admin/dashboard']); break;
        case 'hr':
          router.navigate(['/hr/dashboard']); break;
        case 'finance':
          router.navigate(['/finance/dashboard']); break;
        case 'employee':
          router.navigate(['/employee/dashboard']); break;
        case 'sales_only':
          router.navigate(['/sales/dashboard']); break;
        case 'it_operation':
          router.navigate(['/itops/dashboard']); break;
        case 'operations':
          router.navigate(['/operations/dashboard']); break;
        case 'inventory':
          router.navigate(['/inventory/dashboard']); break;
        default:
          router.navigate(['/']);
      }
    }, 1000);

    return { ok: true, message } as const;
  };

  return { handleLogin, validateInputs, submit };
}
