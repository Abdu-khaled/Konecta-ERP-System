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
  private dailyDefaultHours: number | null = null;
  private poll?: Subscription;

  ngOnInit() {
    this.initDefaultHours();
    this.load();
  }

  private initDefaultHours() {
    const email = this.state.profile?.email || this.state.profile?.username || '';
    if (!email) return;
    this.hr.getEmployeeByEmail(email).subscribe({
      next: (emp) => {
        const weekly = (emp?.workingHours ?? null);
        // Convert weekly working hours → per-day (assume 5 working days)
        const daily = weekly != null ? (Number(weekly) / 5) : 8;
        this.dailyDefaultHours = Number.isFinite(daily) ? Math.round(daily * 100) / 100 : 8;
        if (this.todayHours == null) this.todayHours = this.dailyDefaultHours;
      },
      error: () => { this.dailyDefaultHours = 8; if (this.todayHours == null) this.todayHours = 8; }
    });
  }

  load() {
    this.http.get<any[]>(`${this.hrBase}/attendance/me`).subscribe({
      next: (list: any[]) => {
        const mm = this.month;
        this.items = (list || [])
          .filter(a => (a.date || '').startsWith(mm))
          .map(a => ({ date: a.date, present: !!a.present, hours: a.workingHours }))
          .sort((a,b) => (a.date > b.date ? -1 : 1));
      },
      error: () => this.error = 'Failed to load attendance'
    });
  }

  async markTodayPresent() {
    const today = new Date().toISOString().slice(0, 10);
    const payload: any = { date: today, present: true };
    const hrs = (this.todayHours != null ? this.todayHours : this.dailyDefaultHours);
    if (hrs != null) payload.workingHours = hrs;

    if (!('geolocation' in navigator)) {
      this.toast.error('Location is required to mark attendance, but your browser does not support it.');
      return;
    }

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true, timeout: 10000 });
      });
      payload.latitude = position.coords.latitude;
      payload.longitude = position.coords.longitude;
    } catch {
      this.toast.error('Unable to get your location. Please allow location access and try again.');
      return;
    }

    this.http.post<any>(`${this.hrBase}/attendance`, payload).subscribe({
      next: () => { this.toast.success('Attendance marked'); this.load(); },
      error: (err) => {
        let message = 'Failed to mark attendance';
        if (err?.status === 403) {
          message = 'You are not in the office';
        } else if (err?.error?.detail || err?.error?.message) {
          message = err.error.detail || err.error.message;
        }
        this.toast.error(message);
      }
    });
  }
  ngAfterViewInit() { this.poll = interval(30000).subscribe(() => this.load()); }
  ngOnDestroy(): void { this.poll?.unsubscribe(); }
}
