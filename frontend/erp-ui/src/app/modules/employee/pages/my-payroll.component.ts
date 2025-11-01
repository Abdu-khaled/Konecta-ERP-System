import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FinanceApiService, FINANCE_API_BASE_URL } from '../../finance/services/finance.api.service';
import { AuthState } from '../../../core/services/auth-state.service';
import { HrApiService } from '../../hr/services/hr.api.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-employee-my-payroll',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './my-payroll.component.html'
})
export class MyPayrollComponent implements OnInit {
  private readonly fin = inject(FinanceApiService);
  private readonly http = inject(HttpClient);
  private readonly finBase = inject(FINANCE_API_BASE_URL);
  private readonly hr = inject(HrApiService);
  private readonly state = inject(AuthState);
  period = new Date().toISOString().slice(0,7);
  record: any | null = null;
  error = '';

  ngOnInit(): void {
    this.load();
  }
  load() {
    this.http.get<any>(`${this.finBase}/payroll/me?period=${encodeURIComponent(this.period)}`).subscribe({ next: r => { this.record = r; }, error: () => this.error = 'No payroll found for this period' });
  }
}
