import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService, SystemUser } from '../../../admin/services/admin.service';
import { HrApiService } from '../../../hr/services/hr.api.service';
import { ModalComponent } from '../../../../shared/components/modal/modal.component';
import { Department, Employee } from '../../../hr/services/hr.types';
import { downloadExcel } from '../../../../shared/helpers/excel';

@Component({
  selector: 'app-admin-users-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalComponent],
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
        <button class="rounded bg-slate-200 text-slate-800 px-4 py-2 text-sm" type="button" (click)="download()">Download</button>
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
            <th>Base Salary</th>
            <th>Department</th>
            <th class="text-right pr-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let u of paged" class="border-t border-slate-200/70">
            <td class="py-2">{{ u.fullName || '-' }}</td>
            <td>{{ u.username }}</td>
            <td>{{ u.email }}</td>
            <td>{{ u.role }}</td>
            <td>{{ u.status || '-' }}<span *ngIf="u.otpVerified === false" class="text-amber-700"> (pending OTP)</span></td>
            <td>{{ (employeesByEmail[u.email.toLowerCase()]?.salary ?? '') === '' ? '-' : employeesByEmail[u.email.toLowerCase()]?.salary }}</td>
            <td>{{ departmentByEmail[u.email.toLowerCase()] || '-' }}</td>
            <td class="text-right">
              <button class="text-blue-700 hover:underline mr-3" (click)="openEdit(u)">Edit</button>
              <button class="text-red-600 hover:underline" (click)="delete(u)">Delete</button>
            </td>
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

  <app-modal [open]="editOpen" title="Edit User" (closed)="closeEdit()">
    <form (ngSubmit)="saveEdit()" class="flex flex-col gap-4">
      <div>
        <label class="block text-sm text-gray-700 mb-1">Full name</label>
        <input class="w-full border rounded px-3 py-2" [(ngModel)]="editFullName" name="fullName" />
      </div>
      <div>
        <label class="block text-sm text-gray-700 mb-1">Phone number</label>
        <input class="w-full border rounded px-3 py-2" [(ngModel)]="editPhone" name="phone" />
      </div>
      <div>
        <label class="block text-sm text-gray-700 mb-1">Department</label>
        <select class="w-full border rounded px-3 py-2" [(ngModel)]="editDepartmentId" name="departmentId">
          <option [ngValue]="null">- None -</option>
          <option *ngFor="let d of departments" [ngValue]="d.id">{{ d.name }}</option>
        </select>
      </div>
      <div>
        <label class="block text-sm text-gray-700 mb-1">Base Salary</label>
        <input class="w-full border rounded px-3 py-2" type="number" min="0" step="0.01" [(ngModel)]="editSalary" name="salary" />
      </div>
      <div class="flex items-center justify-end gap-3 pt-2">
        <button type="button" class="px-4 py-2 rounded bg-slate-200" (click)="closeEdit()">Cancel</button>
        <button class="px-4 py-2 rounded bg-primary-600 text-white">Save</button>
      </div>
      <p *ngIf="editError" class="text-sm text-rose-700">{{ editError }}</p>
    </form>
  </app-modal>
  `
})
export class UsersListComponent implements OnInit {
  private readonly admin = inject(AdminService);
  private readonly hrApi = inject(HrApiService);

  users: SystemUser[] = [];
  departmentByEmail: Record<string, string> = {};
  employeesByEmail: Record<string, Employee> = {};
  departments: Department[] = [];
  loading = false;
  error = '';

  search = '';
  page = 1;
  pageSize = 10;

  // editing state
  editOpen = false;
  editTarget: SystemUser | null = null;
  editFullName = '';
  editPhone = '';
  editDepartmentId: number | null = null;
  editSalary: number | null = null;
  editError = '';

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
        const mapName: Record<string, string> = {};
        const empMap: Record<string, Employee> = {} as any;
        for (const e of emps) {
          if (e.email) {
            const key = e.email.toLowerCase();
            mapName[key] = e.departmentName || '';
            empMap[key] = e;
          }
        }
        this.departmentByEmail = mapName;
        this.employeesByEmail = empMap;
      },
      error: () => {}
    });
    // Fetch departments for editing dropdown
    this.hrApi.listDepartments().subscribe({ next: (d) => this.departments = d, error: () => {} });
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

  openEdit(u: SystemUser) {
    this.editTarget = u;
    this.editFullName = u.fullName || '';
    const emp = this.employeesByEmail[(u.email || '').toLowerCase()];
    this.editPhone = (u.phone || emp?.phone || '') as string;
    this.editDepartmentId = (emp?.departmentId ?? null) as any;
    this.editSalary = (emp?.salary ?? null) as any;
    this.editError = '';
    this.editOpen = true;
  }
  closeEdit() {
    this.editOpen = false;
    this.editTarget = null;
  }
  saveEdit() {
    if (!this.editTarget) return;
    const u = this.editTarget;
    this.editError = '';
    // update auth user (full name + phone)
    this.admin.updateUser(u.id, { fullName: this.editFullName, phone: this.editPhone }).subscribe({
      next: () => {
        // update HR employee (phone + department + base salary via ensure)
        this.hrApi.ensureEmployee({ email: u.email, fullName: this.editFullName, phone: this.editPhone, departmentId: this.editDepartmentId ?? null, salary: this.editSalary ?? null }).subscribe({
          next: () => { this.closeEdit(); this.refresh(); },
          error: () => { this.closeEdit(); this.refresh(); }
        });
      },
      error: (e) => { this.editError = e?.error?.message || 'Failed to update user'; }
    });
  }

  delete(u: SystemUser) {
    if (!confirm(`Delete user ${u.email}? This cannot be undone.`)) return;
    this.admin.deleteUser(u.id).subscribe({
      next: () => {
        // best-effort remove matching employee
        this.hrApi.getEmployeeByEmail(u.email).subscribe({
          next: (emp) => { if (emp?.id) this.hrApi.deleteEmployee(emp.id).subscribe({ next: () => this.refresh(), error: () => this.refresh() }); else this.refresh(); },
          error: () => this.refresh()
        });
      },
      error: (e) => { this.error = e?.error?.message || 'Failed to delete user'; }
    });
  }

  download() {
    const rows = (this.filtered || []).map(u => ({
      Name: u.fullName || '-',
      Username: u.username,
      Email: u.email,
      Role: u.role,
      Status: u.status || '-',
      BaseSalary: (this.employeesByEmail[(u.email || '').toLowerCase()]?.salary ?? '-') as any,
      Department: this.departmentByEmail[(u.email || '').toLowerCase()] || '-'
    }));
    const cols = [
      { key: 'Name', header: 'Name' },
      { key: 'Username', header: 'Username' },
      { key: 'Email', header: 'Email' },
      { key: 'Role', header: 'Role' },
      { key: 'Status', header: 'Status' },
      { key: 'BaseSalary', header: 'Base Salary' },
      { key: 'Department', header: 'Department' },
    ] as any;
    downloadExcel('system-users.xlsx', cols, rows as any);
  }
}
