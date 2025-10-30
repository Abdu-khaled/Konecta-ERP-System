import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HrApiService, HR_API_BASE_URL } from '../../hr/services/hr.api.service';
import { AuthState } from '../../../core/services/auth-state.service';
import { HttpClient } from '@angular/common/http';
import { interval, Subscription } from 'rxjs';

@Component({
  selector: 'app-employee-my-performance',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './my-performance.component.html'
})
export class MyPerformanceComponent implements OnInit, OnDestroy {
  private readonly hr = inject(HrApiService);
  private readonly http = inject(HttpClient);
  private readonly hrBase = inject(HR_API_BASE_URL);
  private readonly state = inject(AuthState);
  employeeId: number | null = null;
  items: any[] = [];
  error = '';
  private poll?: Subscription;

  ngOnInit(): void {
    this.load();
  }
  load() { this.http.get<any[]>(`${this.hrBase}/performance/me`).subscribe({ next: d => this.items = d || [], error: () => this.error = 'Failed to load performance' }); }
  ngAfterViewInit() {
    this.poll = interval(15000).subscribe(() => this.load());
  }
  ngOnDestroy(): void { this.poll?.unsubscribe(); }
}
