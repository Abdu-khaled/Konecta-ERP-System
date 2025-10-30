import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HrApiService, HR_API_BASE_URL } from '../../hr/services/hr.api.service';
import { AuthState } from '../../../core/services/auth-state.service';
import { ToastService } from '../../../core/services/toast.service';
import { HttpClient } from '@angular/common/http';
import { interval, Subscription } from 'rxjs';

@Component({
  selector: 'app-employee-my-attendance',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './my-attendance.component.html'
})
export class MyAttendanceComponent implements OnInit, OnDestroy {
  private readonly hr = inject(HrApiService);
  private readonly http = inject(HttpClient);
  private readonly hrBase = inject(HR_API_BASE_URL);
  private readonly state = inject(AuthState);
  private readonly toast = inject(ToastService);

  month = new Date().toISOString().slice(0, 7); // YYYY-MM
  items: Array<{ date: string; present: boolean; hours?: number } > = [];
  error = '';
  todayHours: number | null = null;
  private poll?: Subscription;

  async ngOnInit() {
    this.load();
  }

  load() {
    this.http.get<any[]>(`${this.hrBase}/attendance/me`).subscribe({
      next: (list: any[]) => {
        const mm = this.month;
        this.items = (list || []).filter(a => (a.date || '').startsWith(mm)).sort((a,b) => (a.date > b.date ? -1 : 1));
      },
      error: () => this.error = 'Failed to load attendance'
    });
  }

  markTodayPresent() {
    const today = new Date().toISOString().slice(0, 10);
    const payload: any = { date: today, present: true };
    if (this.todayHours != null) payload.workingHours = this.todayHours;
    this.http.post<any>(`${this.hrBase}/attendance`, payload).subscribe({
      next: () => { this.toast.success('Attendance marked'); this.load(); },
      error: () => { this.toast.error('Failed to mark attendance'); }
    });
  }
  ngAfterViewInit() { this.poll = interval(30000).subscribe(() => this.load()); }
  ngOnDestroy(): void { this.poll?.unsubscribe(); }
}
