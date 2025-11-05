import { Routes } from '@angular/router';
import { EmployeeDashboardComponent } from './components/employee-dashboard.component';
import { MyAttendanceComponent } from './pages/my-attendance.component';
import { MyLeavesComponent } from './pages/my-leaves.component';
import { MyPerformanceComponent } from './pages/my-performance.component';
import { MyPayrollComponent } from './pages/my-payroll.component';
import { MyTrainingComponent } from './pages/my-training.component';

export const employeeRoutes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  { path: 'dashboard', component: EmployeeDashboardComponent },
  { path: 'my-attendance', component: MyAttendanceComponent },
  { path: 'my-leaves', component: MyLeavesComponent },
  { path: 'my-performance', component: MyPerformanceComponent },
  { path: 'my-payroll', component: MyPayrollComponent },
  { path: 'training', component: MyTrainingComponent },
];
