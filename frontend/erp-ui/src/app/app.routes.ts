import { Routes } from '@angular/router';
import { HomeComponent } from './features/home/home.component';

export const routes: Routes = [
  // Default home route
  { path: '', component: HomeComponent, pathMatch: 'full' },

  // Lazy-loaded auth routes
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then(m => m.authRoutes)
  },

  // Redirect any unknown routes to home
  { path: '**', redirectTo: '' },
];
