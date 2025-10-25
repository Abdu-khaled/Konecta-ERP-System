import { Routes } from '@angular/router';
import { HrDashboardComponent } from './components/hr-dashboard.component';
import { AttendanceComponent } from './pages/attendance.component';

export const hrRoutes: Routes = [
  { path: 'dashboard', component: HrDashboardComponent },
  { path: 'attendance', component: AttendanceComponent },
];

