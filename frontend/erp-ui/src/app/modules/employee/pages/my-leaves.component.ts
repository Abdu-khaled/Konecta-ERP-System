import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HrApiService, HR_API_BASE_URL } from '../../hr/services/hr.api.service';
import { AuthState } from '../../../core/services/auth-state.service';
import { ToastService } from '../../../core/services/toast.service';
import { HttpClient } from '@angular/common/http';
import { interval, Subscription } from 'rxjs';

@Component({
  selector: 'app-employee-my-leaves',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './my-leaves.component.html'
})
export class MyLeavesComponent implements OnInit, OnDestroy {
  private readonly hr = inject(HrApiService);
  private readonly http = inject(HttpClient);
  private readonly hrBase = inject(HR_API_BASE_URL);
  private readonly state = inject(AuthState);
  private readonly toast = inject(ToastService);

  items: any[] = [];
  error = '';
  model = { startDate: '', endDate: '', reason: '' };
  private poll?: Subscription;

  ngOnInit(): void {
    this.load();
  }
  load() { this.http.get<any[]>(`${this.hrBase}/leaves/me`).subscribe({ next: d => this.items = d || [], error: () => this.error = 'Failed to load leaves' }); }
  submit() {
    const payload: any = { ...this.model };
    this.http.post<any>(`${this.hrBase}/leaves`, payload).subscribe({ next: () => { this.toast.success('Leave requested'); this.model = { startDate: '', endDate: '', reason: '' }; this.load(); }, error: () => this.toast.error('Failed to request leave') });
  }
  ngAfterViewInit() { this.poll = interval(15000).subscribe(() => this.load()); }
  ngOnDestroy(): void { this.poll?.unsubscribe(); }
}
