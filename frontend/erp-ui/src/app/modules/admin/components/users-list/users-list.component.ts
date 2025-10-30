import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService, SystemUser } from '../../../admin/services/admin.service';
import { HrApiService } from '../../../hr/services/hr.api.service';

@Component({
  selector: 'app-admin-users-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
  <div class="mt-6">
    <header class="flex items-center justify-between">
      <h1 class="text-2xl font-semibold tracking-tight text-slate-900">System Users</h1>
      <div class="flex items-center gap-3">
        <input type="text" class="border rounded px-3 py-2 text-sm" placeholder="Search name, email, username, role" [(ngModel)]="search" (ngModelChange)="refresh()" />
        <select class="border rounded px-2 py-2 text-sm" [(ngModel)]="pageSize" (ngModelChange)="page = 1">
          <option [ngValue]="5">5</option>
          <option [ngValue]="10">10</option>
          <option [ngValue]="20">20</option>
        </select>
      </div>
    </header>

    <div *ngIf="error" class="mt-3 rounded bg-rose-50 text-rose-700 px-3 py-2 text-sm">{{ error }}</div>

    <section class="mt-6 rounded-2xl bg-white p-4 shadow ring-1 ring-slate-200/70">
      <table class="w-full text-sm">
        <thead class="text-left text-slate-600">
          <tr>
            <th class="py-2">Name</th>
            <th>Username</th>
            <th>Email</th>
            <th>Role</th>
            <th>Status</th>
            <th>Department</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let u of paged" class="border-t border-slate-200/70">
            <td class="py-2">{{ u.fullName || '-' }}</td>
            <td>{{ u.username }}</td>
            <td>{{ u.email }}</td>
            <td>{{ u.role }}</td>
            <td>{{ u.status || '-' }}<span *ngIf="u.otpVerified === false" class="text-amber-700"> (pending OTP)</span></td>
            <td>{{ departmentByEmail[u.email.toLowerCase()] || '-' }}</td>
          </tr>
        </tbody>
      </table>
      <div class="mt-3 flex items-center justify-between text-sm text-slate-600">
        <div>Page {{ page }} of {{ totalPages }}</div>
        <div class="flex gap-2">
          <button class="rounded bg-slate-200 px-3 py-1" (click)="prevPage()" [disabled]="page===1">Prev</button>
          <button class="rounded bg-slate-200 px-3 py-1" (click)="nextPage()" [disabled]="page===totalPages">Next</button>
        </div>
      </div>
    </section>
  </div>
  `
})
export class UsersListComponent implements OnInit {
  private readonly admin = inject(AdminService);
  private readonly hrApi = inject(HrApiService);

  users: SystemUser[] = [];
  departmentByEmail: Record<string, string> = {};
  loading = false;
  error = '';

  search = '';
  page = 1;
  pageSize = 10;

  ngOnInit() {
    this.refresh();
  }

  refresh() {
    this.loading = true; this.error = '';
    this.admin.listUsers(this.search).subscribe({
      next: (list) => { this.users = list; this.loading = false; },
      error: (e) => { this.error = e?.error?.message || 'Failed to load users'; this.loading = false; }
    });
    // Fetch employees to map departments by email (best-effort)
    this.hrApi.listEmployees().subscribe({
      next: (emps) => {
        const map: Record<string, string> = {};
        for (const e of emps) {
          if (e.email) map[e.email.toLowerCase()] = e.departmentName || '';
        }
        this.departmentByEmail = map;
      },
      error: () => {}
    });
  }

  get filtered(): SystemUser[] {
    return this.users; // server-side filtered by q; keep as-is
  }
  get totalPages(): number { return Math.max(1, Math.ceil(this.filtered.length / this.pageSize)); }
  get paged(): SystemUser[] {
    const start = (this.page - 1) * this.pageSize;
    return this.filtered.slice(start, start + this.pageSize);
  }
  nextPage() { if (this.page < this.totalPages) this.page++; }
  prevPage() { if (this.page > 1) this.page--; }
}
