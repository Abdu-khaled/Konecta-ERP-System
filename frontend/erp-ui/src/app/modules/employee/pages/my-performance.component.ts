import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HrApiService } from '../../hr/services/hr.api.service';
import { AuthState } from '../../../core/services/auth-state.service';

@Component({
  selector: 'app-employee-my-performance',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './my-performance.component.html'
})
export class MyPerformanceComponent implements OnInit {
  private readonly hr = inject(HrApiService);
  private readonly state = inject(AuthState);
  employeeId: number | null = null;
  items: any[] = [];
  error = '';

  ngOnInit(): void {
    const email = this.state.profile?.email || '';
    this.hr.getEmployeeByEmail(email).subscribe({ next: (emp) => { this.employeeId = emp?.id || null; this.load(); } });
  }
  load() { if (!this.employeeId) return; this.hr.listPerformanceByEmployee(this.employeeId).subscribe({ next: d => this.items = d || [], error: () => this.error = 'Failed to load performance' }); }
}

