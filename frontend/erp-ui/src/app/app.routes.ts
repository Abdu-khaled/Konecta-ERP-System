import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () =>
      import('./pages/home/home.component').then(m => m.HomeComponent)
  },
  
  // IT / Operations main route only (static content)
  {
    path: 'it',
    pathMatch: 'full',
    loadComponent: () =>
      import('./dashboard/it-dashboard/it-dashboard.component').then(m => m.ItDashboardComponent)
  },

  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then(m => m.authRoutes)
  },

  { path: '**', redirectTo: '' },
];
