import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HrApiService } from '../services/hr.api.service';
import { ToastService } from '../../../core/services/toast.service';
import { Employee } from '../services/hr.types';
import { UserApiService, SystemUser } from '../../../core/services/user-api.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-hr-leaves',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './leaves.component.html'
})
export class LeavesComponent implements OnInit {
  private readonly api = inject(HrApiService);
  private readonly toast = inject(ToastService);
  private readonly usersApi = inject(UserApiService);
  employees: Employee[] = [];
  selectedEmployeeId: number | null = null;
  items: any[] = [];
  error = '';
  model = { startDate: '', endDate: '', reason: '' };

  ngOnInit(): void {
    this.usersApi.listEmployeeUsers().subscribe({
      next: (users) => {
        const calls = (users || []).map(u => this.api.ensureEmployee({ email: u.email, fullName: u.fullName }));
        if (!calls.length) { this.employees = []; return; }
        forkJoin(calls).subscribe({
          next: (emps) => { this.employees = emps as any; },
          error: () => { this.employees = []; this.error = 'Failed to prepare employees'; }
        });
      },
      error: () => { this.employees = []; this.error = 'Failed to load users'; }
    });
  }
  load() { if (!this.selectedEmployeeId) return; this.api.listLeavesByEmployee(this.selectedEmployeeId).subscribe({ next: d => this.items = d, error: () => { this.error = 'Failed to load leaves'; this.toast.error(this.error); } }); }
  submit() {
    if (!this.selectedEmployeeId) return; const payload = { employeeId: this.selectedEmployeeId, ...this.model };
    this.api.createLeave(payload).subscribe({ next: () => { this.toast.success('Leave created'); this.model = { startDate: '', endDate: '', reason: '' }; this.load(); }, error: () => { this.error = 'Failed to create leave'; this.toast.error(this.error); } });
  }
  approve(id: number) { this.api.approveLeave(id).subscribe({ next: () => { this.toast.success('Leave approved'); this.load(); } }); }
  reject(id: number) { this.api.rejectLeave(id).subscribe({ next: () => { this.toast.info('Leave rejected'); this.load(); } }); }
}
