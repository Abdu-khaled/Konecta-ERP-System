import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FinanceApiService } from '../../finance/services/finance.api.service';
import { AuthState } from '../../../core/services/auth-state.service';
import { HrApiService } from '../../hr/services/hr.api.service';

@Component({
  selector: 'app-employee-my-payroll',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './my-payroll.component.html'
})
export class MyPayrollComponent implements OnInit {
  private readonly fin = inject(FinanceApiService);
  private readonly hr = inject(HrApiService);
  private readonly state = inject(AuthState);
  employeeId: number | null = null;
  period = new Date().toISOString().slice(0,7);
  record: any | null = null;
  error = '';

  ngOnInit(): void {
    const email = this.state.profile?.email || '';
    this.hr.getEmployeeByEmail(email).subscribe({ next: (emp) => { this.employeeId = emp?.id || null; this.load(); } });
  }
  load() {
    if (!this.employeeId) return;
    this.fin.getPayrollForEmployee(this.employeeId, this.period).subscribe({ next: r => { this.record = r; }, error: () => this.error = 'No payroll found for this period' });
  }
}

