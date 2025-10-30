import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HrApiService } from '../../hr/services/hr.api.service';
import { AuthState } from '../../../core/services/auth-state.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-employee-my-leaves',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './my-leaves.component.html'
})
export class MyLeavesComponent implements OnInit {
  private readonly hr = inject(HrApiService);
  private readonly state = inject(AuthState);
  private readonly toast = inject(ToastService);

  employeeId: number | null = null;
  items: any[] = [];
  error = '';
  model = { startDate: '', endDate: '', reason: '' };

  ngOnInit(): void {
    const email = this.state.profile?.email || '';
    this.hr.getEmployeeByEmail(email).subscribe({ next: (emp) => { this.employeeId = emp?.id || null; this.load(); } });
  }
  load() { if (!this.employeeId) return; this.hr.listLeavesByEmployee(this.employeeId).subscribe({ next: d => this.items = d || [], error: () => this.error = 'Failed to load leaves' }); }
  submit() {
    if (!this.employeeId) return; const payload = { employeeId: this.employeeId, ...this.model };
    this.hr.createLeave(payload).subscribe({ next: () => { this.toast.success('Leave requested'); this.model = { startDate: '', endDate: '', reason: '' }; this.load(); }, error: () => this.toast.error('Failed to request leave') });
  }
}

