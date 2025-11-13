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
  {
    path: 'activity',
    canActivate: [roleGuard],
    data: { roles: ['ADMIN','MANAGER','HR','FINANCE','EMPLOYEE','INVENTORY','IT_OPERATION','SALES_ONLY','OPERATIONS'] },
    component: MainLayoutComponent,
    children: [
      { path: '', loadComponent: () => import('./pages/activity/activity-feed.component').then(m => m.ActivityFeedComponent) }
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
    data: { roles: ['ADMIN','MANAGER','HR','FINANCE','INVENTORY','EMPLOYEE','IT_OPERATION','SALES_ONLY','OPERATIONS'] },
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
        loadComponent: () => import('./modules/admin/components/invite-user/invite-user-extended.component').then(m => m.InviteUserExtendedComponent)
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
        loadComponent: () => import('./modules/admin/components/invite-user/invite-user-extended.component').then(m => m.InviteUserExtendedComponent)
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
  {
    path: 'admin/roles',
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
    path: 'inventory',
    canActivate: [roleGuard],
    data: { roles: ['ADMIN','INVENTORY'] },
    component: MainLayoutComponent,
    loadChildren: () => import('./modules/inventory/inventory.routes').then(m => m.inventoryRoutes)
  },
  {
    path: 'employee',
    canActivate: [roleGuard],
    data: { roles: ['EMPLOYEE'] },
    component: MainLayoutComponent,
    loadChildren: () => import('./modules/employee/employee.routes').then(m => m.employeeRoutes)
  },
  {
    path: 'itops',
    canActivate: [roleGuard],
    data: { roles: ['IT_OPERATION'] },
    component: MainLayoutComponent,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      { path: 'dashboard', loadComponent: () => import('./pages/itops/itops.component').then(m => m.ItOpsComponent) },
      { path: 'systems', loadComponent: () => import('./pages/itops/itops-systems.component').then(m => m.ItOpsSystemsComponent) },
      { path: 'monitoring', loadComponent: () => import('./pages/itops/itops-monitoring.component').then(m => m.ItOpsMonitoringComponent) },
      { path: 'tickets', loadComponent: () => import('./pages/itops/itops-tickets.component').then(m => m.ItOpsTicketsComponent) }
    ]
  },
  {
    path: 'sales',
    canActivate: [roleGuard],
    data: { roles: ['SALES_ONLY'] },
    component: MainLayoutComponent,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      { path: 'dashboard', loadComponent: () => import('./pages/sales/sales.component').then(m => m.SalesComponent) },
      { path: 'leads', loadComponent: () => import('./pages/sales/sales-leads.component').then(m => m.SalesLeadsComponent) },
      { path: 'opportunities', loadComponent: () => import('./pages/sales/sales-opportunities.component').then(m => m.SalesOpportunitiesComponent) },
      { path: 'reports', loadComponent: () => import('./pages/sales/sales-reports.component').then(m => m.SalesReportsComponent) }
    ]
  },
  {
    path: 'operations',
    canActivate: [roleGuard],
    data: { roles: ['OPERATIONS'] },
    component: MainLayoutComponent,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      { path: 'dashboard', loadComponent: () => import('./pages/operations/operations.component').then(m => m.OperationsComponent) },
      { path: 'processes', loadComponent: () => import('./pages/operations/operations-processes.component').then(m => m.OperationsProcessesComponent) },
      { path: 'logistics', loadComponent: () => import('./pages/operations/operations-logistics.component').then(m => m.OperationsLogisticsComponent) },
      { path: 'reports', loadComponent: () => import('./pages/operations/operations-reports.component').then(m => m.OperationsReportsComponent) }
    ]
  },
  {
    path: 'auth',
    loadChildren: () => import('./modules/auth/auth.routes').then(m => m.authRoutes)
  },
  { path: '**', redirectTo: '' },
];

