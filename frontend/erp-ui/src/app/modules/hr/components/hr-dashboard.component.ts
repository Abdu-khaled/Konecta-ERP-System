import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HrApiService } from '../services/hr.api.service';
import { Employee } from '../services/hr.types';
import { forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Component({
  selector: 'app-hr-dashboard',
  standalone: true,
  templateUrl: './hr-dashboard.component.html',
  imports: [CommonModule]
})
export class HrDashboardComponent implements OnInit {
  private readonly api = inject(HrApiService);

  loading = false;
  employees: Employee[] = [];

  totalEmployees = 0;
  attendanceToday = 0;
  pendingLeaves = 0;
  topPerformers: Array<{ name: string; rating: number }> = [];

  ngOnInit(): void {
    this.refresh();
  }

  refresh() {
    this.loading = true;
    this.api.listEmployees().subscribe({
      next: (emps) => {
        this.employees = emps || [];
        this.totalEmployees = this.employees.length;
        if (!this.employees.length) { this.loading = false; return; }

        const today = new Date().toISOString().slice(0, 10);

        const attendanceCalls = this.employees.map(e => this.api.listAttendanceByEmployee(e.id!).pipe(
          map(list => (list || []).some((a: any) => a.date === today && !!a.present) ? 1 : 0),
          catchError(() => of(0))
        ));

        const leaveCalls = this.employees.map(e => this.api.listLeavesByEmployee(e.id!).pipe(
          map(list => (list || []).filter((r: any) => r.status === 'PENDING').length),
          catchError(() => of(0))
        ));

        const performanceCalls = this.employees.map(e => this.api.listPerformanceByEmployee(e.id!).pipe(
          map(list => {
            const items = (list || []) as any[];
            if (!items.length) return null;
            // Latest by date if provided else the last item
            const sorted = items.slice().sort((a,b)=> (a.reviewDate||'').localeCompare(b.reviewDate||''));
            const latest = sorted[sorted.length - 1];
            return { id: e.id!, name: `${e.firstName} ${e.lastName}`.trim(), rating: latest.rating ?? 0 };
          }),
          catchError(() => of(null))
        ));

        forkJoin({
          atd: forkJoin(attendanceCalls),
          leaves: forkJoin(leaveCalls),
          perf: forkJoin(performanceCalls)
        }).subscribe({
          next: ({ atd, leaves, perf }) => {
            this.attendanceToday = (atd as number[]).reduce((a, b) => a + b, 0);
            this.pendingLeaves = (leaves as number[]).reduce((a, b) => a + b, 0);
            const perfArr = (perf as Array<{ id: number; name: string; rating: number } | null>)
              .filter(Boolean) as Array<{ id: number; name: string; rating: number }>;
            this.topPerformers = perfArr
              .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
              .slice(0, 3);
            this.loading = false;
          },
          error: () => { this.loading = false; }
        });
      },
      error: () => { this.loading = false; }
    });
  }
}
