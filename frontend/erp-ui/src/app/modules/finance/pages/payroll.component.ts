import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FinanceApiService } from '../services/finance.api.service';
import { Payroll, PayrollRequest } from '../services/finance.types';
import { EmployeeNamePipe } from '../../hr/pipes/employee-name.pipe';
import { ToastService } from '../../../core/services/toast.service';
import { downloadExcel } from '../../../shared/helpers/excel';

@Component({
  selector: 'app-finance-payroll',
  standalone: true,
  imports: [CommonModule, FormsModule, EmployeeNamePipe],
  templateUrl: './payroll.component.html'
})
export class PayrollComponent implements OnInit {
  private readonly api = inject(FinanceApiService);
  private readonly toast = inject(ToastService);
  period = '';
  items: Payroll[] = [];
  error = '';

  model: PayrollRequest = { employeeId: 0, period: '', baseSalary: 0, bonuses: 0, deductions: 0 } as any;

  ngOnInit(): void { }
  load() { if (!this.period) return; this.api.listPayrollByPeriod(this.period).subscribe({ next: d => this.items = d, error: () => { this.error = 'Failed to load payroll'; this.toast.error(this.error); } }); }
  submit() {
    this.api.calculateAndSavePayroll(this.model).subscribe({ next: () => { this.toast.success('Payroll saved'); this.period = this.model.period; this.load(); }, error: () => { this.error = 'Failed to calculate payroll'; this.toast.error(this.error); } });
  }
  download() {
    const cols = [
      { key: 'employeeId', header: 'Employee ID' },
      { key: 'period', header: 'Period' },
      { key: 'baseSalary', header: 'Base Salary' },
      { key: 'bonuses', header: 'Bonuses' },
      { key: 'deductions', header: 'Deductions' },
      { key: 'netSalary', header: 'Net Salary' }
    ] as any;
    downloadExcel(`payroll_${this.period || 'period'}.xlsx`, cols, this.items || []);
  }
}






