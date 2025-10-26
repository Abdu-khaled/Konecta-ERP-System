import { Routes } from '@angular/router';
import { MainLayoutComponent } from './core/layouts/main-layout/main-layout.component';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      {
        path: '',
        pathMatch: 'full',
        loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent)
      }
    ]
  },
  // Public registration deep links from email
  {
    path: 'register',
    loadComponent: () => import('./modules/auth/components/register-complete/register-complete.component').then(m => m.RegisterCompleteComponent)
  },
  {
    path: 'register/verify-otp',
    loadComponent: () => import('./modules/auth/components/register-verify/register-verify.component').then(m => m.RegisterVerifyComponent)
  },
  {
    path: 'admin/invite',
    canActivate: [roleGuard],
    data: { roles: ['ADMIN'] },
    component: MainLayoutComponent,
    children: [
      {
        path: '',
        data: { inviteView: true },
        loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent)
      }
    ]
  },
  {
    path: 'auth',
    loadChildren: () => import('./modules/auth/auth.routes').then(m => m.authRoutes)
  },
  { path: '**', redirectTo: '' },
];
