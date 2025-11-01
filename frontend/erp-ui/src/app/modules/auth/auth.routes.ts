import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { AuthLayoutComponent } from '../../core/layouts/auth-layout/auth-layout.component';
import { RegisterCompleteComponent } from './components/register-complete/register-complete.component';
import { RegisterVerifyComponent } from './components/register-verify/register-verify.component';

export const authRoutes: Routes = [
  {
    path: '',
    component: AuthLayoutComponent,
    children: [
      { path: 'login', component: LoginComponent },
      { path: 'register/complete', component: RegisterCompleteComponent },
      { path: 'register/verify-otp', component: RegisterVerifyComponent },
      { path: '', redirectTo: 'login', pathMatch: 'full' },
    ]
  }
];
