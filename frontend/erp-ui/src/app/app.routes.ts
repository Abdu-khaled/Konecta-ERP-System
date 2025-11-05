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
    path: 'profile',
    canActivate: [roleGuard],
    data: { roles: ['ADMIN','HR','FINANCE','EMPLOYEE','MANAGER'] },
    component: MainLayoutComponent,
    children: [
      { path: '', loadComponent: () => import('./pages/profile/profile.component').then(m => m.ProfileComponent) }
    ]
  },
  {
    path: 'reports',
    canActivate: [roleGuard],
    data: { roles: ['ADMIN','MANAGER','HR','FINANCE'] },
    component: MainLayoutComponent,
    loadChildren: () => import('./modules/reports/reports.routes').then(m => m.reportsRoutes)
  },
  {
    path: 'admin/invite',
    canActivate: [roleGuard],
    data: { roles: ['ADMIN'] },
    component: MainLayoutComponent,
    children: [
      {
        path: '',
        loadComponent: () => import('./modules/admin/components/invite-user/invite-user.component').then(m => m.InviteUserComponent)
      }
    ]
  },
  {
    path: 'hr/invite',
    canActivate: [roleGuard],
    data: { roles: ['HR'] },
    component: MainLayoutComponent,
    children: [
      {
        path: '',
        loadComponent: () => import('./modules/admin/components/invite-user/invite-user.component').then(m => m.InviteUserComponent)
      }
    ]
  },
  {
    path: 'admin/dashboard',
    canActivate: [roleGuard],
    data: { roles: ['ADMIN'] },
    component: MainLayoutComponent,
    children: [
      {
        path: '',
        loadComponent: () => import('./modules/admin/components/admin-dashboard.component').then(m => m.AdminDashboardComponent)
      }
    ]
  },
  { path: 'admin', redirectTo: 'admin/dashboard', pathMatch: 'full' },
  {
    path: 'admin/users',
    canActivate: [roleGuard],
    data: { roles: ['ADMIN'] },
    component: MainLayoutComponent,
    children: [
      { path: '', loadComponent: () => import('./modules/admin/components/users-list/users-list.component').then(m => m.UsersListComponent) }
    ]
  },
  // Role dashboards via lazy routes
  {
    path: 'hr',
    canActivate: [roleGuard],
    data: { roles: ['HR'] },
    component: MainLayoutComponent,
    loadChildren: () => import('./modules/hr/hr.routes').then(m => m.hrRoutes)
  },
  {
    path: 'hr/users',
    canActivate: [roleGuard],
    data: { roles: ['HR'] },
    component: MainLayoutComponent,
    children: [
      { path: '', loadComponent: () => import('./modules/admin/components/users-list/users-list.component').then(m => m.UsersListComponent) }
    ]
  },
  {
    path: 'finance',
    canActivate: [roleGuard],
    data: { roles: ['FINANCE'] },
    component: MainLayoutComponent,
    loadChildren: () => import('./modules/finance/finance.routes').then(m => m.financeRoutes)
  },
  {
    path: 'employee',
    canActivate: [roleGuard],
    data: { roles: ['EMPLOYEE'] },
    component: MainLayoutComponent,
    loadChildren: () => import('./modules/employee/employee.routes').then(m => m.employeeRoutes)
  },
  {
    path: 'auth',
    loadChildren: () => import('./modules/auth/auth.routes').then(m => m.authRoutes)
  },
  { path: '**', redirectTo: '' },
];
