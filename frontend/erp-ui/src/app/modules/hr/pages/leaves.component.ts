import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HrApiService } from '../services/hr.api.service';
import { ToastService } from '../../../core/services/toast.service';
import { Employee } from '../services/hr.types';
import { UserApiService, SystemUser } from '../../../core/services/user-api.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-hr-leaves',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './leaves.component.html'
})
export class LeavesComponent implements OnInit {
  private readonly api = inject(HrApiService);
  private readonly toast = inject(ToastService);
  private readonly usersApi = inject(UserApiService);
  employees: Employee[] = [];
  employeesWithLeaves: Employee[] = [];
  selectedEmployeeId: number | null = null;
  items: any[] = [];
  allItems: Array<{ id: number; employeeId: number; employeeName: string; startDate: string; endDate: string; reason?: string; status: string }>=[];
  error = '';
  model = { startDate: '', endDate: '', reason: '' };

  ngOnInit(): void {
    this.usersApi.listEmployeeUsers().subscribe({
      next: (users) => {
        const calls = (users || []).map(u => this.api.ensureEmployee({ email: u.email, fullName: u.fullName }));
        if (!calls.length) { this.employees = []; return; }
        forkJoin(calls).subscribe({
          next: (emps) => {
            this.employees = emps as any;
            const leaveCalls = this.employees.map(e => this.api.listLeavesByEmployee(e.id!));
            forkJoin(leaveCalls).subscribe({
              next: (lists) => {
                const withLeaves: Employee[] = [];
                const all: Array<{ id: number; employeeId: number; employeeName: string; startDate: string; endDate: string; reason?: string; status: string }> = [];
                this.employees.forEach((e, idx) => {
                  const list: any[] = lists[idx] as any[];
                  if (list && list.length) {
                    withLeaves.push(e);
                    for (const r of list) {
                      all.push({ id: r.id, employeeId: e.id!, employeeName: `${e.firstName} ${e.lastName}`.trim(), startDate: r.startDate, endDate: r.endDate, reason: r.reason, status: r.status });
                    }
                  }
                });
                this.employeesWithLeaves = withLeaves;
                this.allItems = all.sort((a,b)=> (a.startDate||'').localeCompare(b.startDate||''));
              },
              error: () => { this.error = 'Failed to load leave lists'; }
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
}
