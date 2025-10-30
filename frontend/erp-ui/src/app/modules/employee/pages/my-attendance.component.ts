import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HrApiService } from '../../hr/services/hr.api.service';
import { AuthState } from '../../../core/services/auth-state.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-employee-my-attendance',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './my-attendance.component.html'
})
export class MyAttendanceComponent implements OnInit {
  private readonly hr = inject(HrApiService);
  private readonly state = inject(AuthState);
  private readonly toast = inject(ToastService);

  employeeId: number | null = null;
  month = new Date().toISOString().slice(0, 7); // YYYY-MM
  items: Array<{ date: string; present: boolean; hours?: number } > = [];
  error = '';

  async ngOnInit() {
    const email = this.state.profile?.email || '';
    this.hr.getEmployeeByEmail(email).subscribe({
      next: (emp) => { this.employeeId = emp?.id || null; this.load(); },
      error: () => { this.error = 'Could not resolve employee record'; }
    });
  }

  load() {
    if (!this.employeeId) return;
    this.hr.listAttendanceByEmployee(this.employeeId).subscribe({
      next: (list: any[]) => {
        const mm = this.month;
        this.items = (list || []).filter(a => (a.date || '').startsWith(mm)).sort((a,b) => (a.date > b.date ? -1 : 1));
      },
      error: () => this.error = 'Failed to load attendance'
    });
  }
}

