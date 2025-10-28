import { Routes } from '@angular/router';
import { HrDashboardComponent } from './components/hr-dashboard.component';
import { AttendanceComponent } from './pages/attendance.component';
import { LeavesComponent } from './pages/leaves.component';
import { PerformanceComponent } from './pages/performance.component';
import { EmployeesComponent } from './pages/employees.component';
import { DepartmentsComponent } from './pages/departments.component';

export const hrRoutes: Routes = [
  { path: 'dashboard', component: HrDashboardComponent },
  { path: 'attendance', component: AttendanceComponent },
  { path: 'employees', component: EmployeesComponent },
  { path: 'departments', component: DepartmentsComponent },
  { path: 'leaves', component: LeavesComponent },
  { path: 'performance', component: PerformanceComponent },
];
