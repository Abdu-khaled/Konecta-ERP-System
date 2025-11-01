import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FinanceApiService } from '../services/finance.api.service';
import { Payroll, PayrollRequest } from '../services/finance.types';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-finance-payroll',
  standalone: true,
  imports: [CommonModule, FormsModule],
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
    this.api.calculateAndSavePayroll(this.model).subscribe({ next: () => { this.toast.success('Payroll saved'); this.load(); }, error: () => { this.error = 'Failed to calculate payroll'; this.toast.error(this.error); } });
  }
}
