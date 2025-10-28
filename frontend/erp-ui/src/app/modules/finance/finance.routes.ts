import { Routes } from '@angular/router';
import { FinanceDashboardComponent } from './components/finance-dashboard.component';
import { InvoicesComponent } from './pages/invoices.component';
import { ExpensesComponent } from './pages/expenses.component';
import { PayrollComponent } from './pages/payroll.component';
import { BudgetsComponent } from './pages/budgets.component';

export const financeRoutes: Routes = [
  { path: 'dashboard', component: FinanceDashboardComponent },
  { path: 'invoices', component: InvoicesComponent },
  { path: 'expenses', component: ExpensesComponent },
  { path: 'payroll', component: PayrollComponent },
  { path: 'budgets', component: BudgetsComponent },
];
