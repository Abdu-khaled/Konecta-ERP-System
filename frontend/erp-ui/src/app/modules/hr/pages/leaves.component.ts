import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HrApiService, HR_API_BASE_URL } from '../services/hr.api.service';
import { ToastService } from '../../../core/services/toast.service';
import { Employee } from '../services/hr.types';
import { UserApiService, SystemUser } from '../../../core/services/user-api.service';
import { forkJoin, interval, Subscription } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { downloadExcel } from '../../../shared/helpers/excel';

@Component({
  selector: 'app-hr-leaves',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './leaves.component.html'
})
export class LeavesComponent implements OnInit, OnDestroy {
  private readonly api = inject(HrApiService);
  private readonly toast = inject(ToastService);
  private readonly usersApi = inject(UserApiService);
  private readonly http = inject(HttpClient);
  private readonly hrBase = inject(HR_API_BASE_URL);
  employees: Employee[] = [];
  employeesWithLeaves: Employee[] = [];
  selectedEmployeeId: number | null = null;
  items: any[] = [];
  allItems: Array<{ id: number; employeeId: number; employeeName: string; startDate: string; endDate: string; reason?: string; status: string }>=[];
  error = '';
  model = { startDate: '', endDate: '', reason: '' };
  private poll?: Subscription;

  ngOnInit(): void {
    this.usersApi.listEmployeeUsers().subscribe({
      next: (users) => {
        const calls = (users || []).map(u => this.api.ensureEmployee({ email: u.email, fullName: u.fullName }));
        if (!calls.length) { this.employees = []; return; }
        forkJoin(calls).subscribe({
          next: (emps) => {
            this.employees = emps as any;
            // Initial fetch of all requests (across all employees)
            this.refreshAll();
            this.startPolling();
          },
          error: () => { this.employees = []; this.error = 'Failed to prepare employees'; }
        });
      },
      error: () => { this.employees = []; this.error = 'Failed to load users'; }
    });
  }
  ngOnDestroy(): void { this.poll?.unsubscribe(); }
  load() {
    if (!this.selectedEmployeeId) { this.items = []; return; }
    this.api.listLeavesByEmployee(this.selectedEmployeeId).subscribe({
      next: d => this.items = d,
      error: () => { this.error = 'Failed to load leaves'; this.toast.error(this.error); }
    });
  }
  submit() {
    if (!this.selectedEmployeeId) return;
    const payload = { employeeId: this.selectedEmployeeId, ...this.model } as any;
    this.api.createLeave(payload).subscribe({
      next: (created: any) => {
        this.toast.success('Leave created');
        this.model = { startDate: '', endDate: '', reason: '' };
        // Update current employee table immediately
        this.items = [created, ...(this.items || [])];
        // Update global table immediately
        const emp = this.employees.find(e => e.id === created.employeeId);
        const employeeName = emp ? `${emp.firstName} ${emp.lastName}`.trim() : '';
        this.allItems = [
          { id: created.id, employeeId: created.employeeId, employeeName, startDate: created.startDate, endDate: created.endDate, reason: created.reason, status: created.status },
          ...this.allItems
        ];
      },
      error: () => { this.error = 'Failed to create leave'; this.toast.error(this.error); }
    });
  }
  approve(id: number) {
    this.api.approveLeave(id).subscribe({
      next: (updated: any) => {
        this.toast.success('Leave approved');
        // Update current employee table
        this.items = (this.items || []).map(r => r.id === id ? { ...r, status: 'APPROVED' } : r);
        // Update global table
        this.allItems = (this.allItems || []).map(r => r.id === id ? { ...r, status: 'APPROVED' } as any : r);
      }
    });
  }
  reject(id: number) {
    this.api.rejectLeave(id).subscribe({
      next: (updated: any) => {
        this.toast.info('Leave rejected');
        // Update current employee table
        this.items = (this.items || []).map(r => r.id === id ? { ...r, status: 'REJECTED' } : r);
        // Update global table
        this.allItems = (this.allItems || []).map(r => r.id === id ? { ...r, status: 'REJECTED' } as any : r);
      }
    });
  }
  private refreshAll() {
    this.http.get<any[]>(`${this.hrBase}/leaves`).subscribe({
      next: (list) => {
        const all: Array<{ id: number; employeeId: number; employeeName: string; startDate: string; endDate: string; reason?: string; status: string }> = [];
        (list || []).forEach((r: any) => {
          const emp = (this.employees || []).find(e => e.id === r.employeeId);
          const employeeName = emp ? `${emp.firstName} ${emp.lastName}`.trim() : `#${r.employeeId}`;
          all.push({ id: r.id, employeeId: r.employeeId, employeeName, startDate: r.startDate, endDate: r.endDate, reason: r.reason, status: r.status });
        });
        this.allItems = all.sort((a,b)=> (a.startDate||'').localeCompare(b.startDate||''));
      },
      error: () => { /* keep previous */ }
    });
  }
  private startPolling() {
    this.poll?.unsubscribe();
    this.poll = interval(15000).subscribe(() => {
      this.load();
      this.refreshAll();
    });
  }

  downloadAll() {
    const cols = [
      { key: 'employeeName', header: 'Employee' },
      { key: 'startDate', header: 'Start' },
      { key: 'endDate', header: 'End' },
      { key: 'reason', header: 'Reason' },
      { key: 'status', header: 'Status' }
    ] as any;
    downloadExcel('leaves.xlsx', cols, this.allItems || []);
  }
}
