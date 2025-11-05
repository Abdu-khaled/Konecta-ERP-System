import { Routes } from '@angular/router';
import { HrDashboardComponent } from './components/hr-dashboard.component';
import { AttendanceComponent } from './pages/attendance.component';
import { LeavesComponent } from './pages/leaves.component';
import { PerformanceComponent } from './pages/performance.component';
import { EmployeesComponent } from './pages/employees.component';
import { DepartmentsComponent } from './pages/departments.component';
import { JobsComponent } from './pages/jobs.component';
import { TrainingComponent } from './pages/training.component';
import { TrainingEnrollmentsComponent } from './pages/training-enrollments.component';

export const hrRoutes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  { path: 'dashboard', component: HrDashboardComponent },
  { path: 'attendance', component: AttendanceComponent },
  { path: 'employees', component: EmployeesComponent },
  { path: 'departments', component: DepartmentsComponent },
  { path: 'jobs', component: JobsComponent },
  { path: 'training', component: TrainingComponent },
  { path: 'training/:id/enrollments', component: TrainingEnrollmentsComponent },
  { path: 'leaves', component: LeavesComponent },
  { path: 'performance', component: PerformanceComponent },
];
