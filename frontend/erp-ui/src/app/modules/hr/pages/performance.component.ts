import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HrApiService } from '../services/hr.api.service';
import { ToastService } from '../../../core/services/toast.service';
import { Employee } from '../services/hr.types';
import { UserApiService, SystemUser } from '../../../core/services/user-api.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-hr-performance',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './performance.component.html'
})
export class PerformanceComponent implements OnInit {
  private readonly api = inject(HrApiService);
  private readonly toast = inject(ToastService);
  private readonly usersApi = inject(UserApiService);
  employees: Employee[] = [];
  employeesWithReviews: Employee[] = [];
  selectedEmployeeId: number | null = null;
  items: any[] = [];
  allItems: Array<{ employeeId: number; employeeName: string; rating: number; feedback?: string; reviewDate: string }>=[];
  error = '';
  model = { rating: 3, feedback: '', reviewDate: '' };

  ngOnInit(): void {
    // Load employees with role EMPLOYEE only
    this.usersApi.listEmployeeUsers().subscribe({
      next: (users) => {
        const calls = (users || []).map(u => this.api.ensureEmployee({ email: u.email, fullName: u.fullName }));
        if (!calls.length) { this.employees = []; return; }
        forkJoin(calls).subscribe({
          next: (emps) => {
            this.employees = emps as any;
            // fetch reviews per employee to build dropdown + allItems
            const perfCalls = this.employees.map(e => this.api.listPerformanceByEmployee(e.id!));
            forkJoin(perfCalls).subscribe({
              next: (lists) => {
                const withReviews: Employee[] = [];
                const all: Array<{ employeeId: number; employeeName: string; rating: number; feedback?: string; reviewDate: string }> = [];
                this.employees.forEach((e, idx) => {
                  const list: any[] = lists[idx] as any[];
                  if (list && list.length) {
                    withReviews.push(e);
                    for (const r of list) {
                      all.push({ employeeId: e.id!, employeeName: `${e.firstName} ${e.lastName}`.trim(), rating: r.rating, feedback: r.feedback, reviewDate: r.reviewDate });
                    }
                  }
                });
                this.employeesWithReviews = withReviews;
                this.allItems = all.sort((a,b)=> (a.reviewDate||'').localeCompare(b.reviewDate||''));
              },
              error: () => { this.error = 'Failed to load performance lists'; }
            });
          },
          error: () => { this.employees = []; this.error = 'Failed to prepare employees'; }
        });
      },
      error: () => { this.employees = []; this.error = 'Failed to load users'; }
    });
  }
  load() {
    if (!this.selectedEmployeeId) { this.items = []; return; }
    this.api.listPerformanceByEmployee(this.selectedEmployeeId).subscribe({
      next: d => this.items = d,
      error: () => this.error = 'Failed to load performance'
    });
  }
  submit() {
    if (!this.selectedEmployeeId) return;
    const payload = { employeeId: this.selectedEmployeeId, ...this.model } as any;
    this.api.createPerformance(payload).subscribe({
      next: (created: any) => {
        this.toast.success('Review added');
        this.model = { rating: 3, feedback: '', reviewDate: '' };
        // Update current employee list immediately
        this.items = [created, ...(this.items || [])];
        // Update global table immediately
        const emp = this.employees.find(e => e.id === created.employeeId);
        const employeeName = emp ? `${emp.firstName} ${emp.lastName}`.trim() : '';
        this.allItems = [
          { employeeId: created.employeeId, employeeName, rating: created.rating, feedback: created.feedback, reviewDate: created.reviewDate },
          ...this.allItems
        ];
      },
      error: () => { this.error = 'Failed to add review'; this.toast.error(this.error); }
    });
  }
}
