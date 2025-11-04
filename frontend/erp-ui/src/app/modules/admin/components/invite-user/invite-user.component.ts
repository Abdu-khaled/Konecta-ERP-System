import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService, InviteUserRequest } from '../../../admin/services/admin.service';
import { HrApiService } from '../../../hr/services/hr.api.service';
import { Department } from '../../../hr/services/hr.types';

@Component({
  selector: 'app-admin-invite-user',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
  <div class="flex items-start justify-center min-h-[calc(100vh-64px)] pt-4">
    <div class="w-full max-w-lg bg-white shadow-2xl rounded-2xl p-10 border border-gray-200">
      <p class="text-gray-500 text-sm mb-1">Send invitations to HR, Finance, or Employees.</p>
      <h1 class="text-2xl font-semibold mb-6">Invite User</h1>
      <form (ngSubmit)="submit()" class="flex flex-col gap-5">
        <div>
          <label class="block text-base text-gray-600 mb-2">Full name</label>
          <input [(ngModel)]="name" name="name" required class="w-full border border-gray-300 rounded-lg px-4 py-3 text-base focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-sm"/>
        </div>
        <div>
          <label class="block text-base text-gray-600 mb-2">Email</label>
          <input [(ngModel)]="email" name="email" type="email" required class="w-full border border-gray-300 rounded-lg px-4 py-3 text-base focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-sm"/>
        </div>
        <div>
          <label class="block text-base text-gray-600 mb-2">Role</label>
          <select [(ngModel)]="role" name="role" required class="w-full border border-gray-300 rounded-lg px-4 py-3 text-base focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-sm">
            <option value="EMPLOYEE">Employee</option>
            <option value="HR">HR</option>
            <option value="FINANCE">Finance</option>
          </select>
        </div>
        <div>
          <label class="block text-base text-gray-600 mb-2">Department</label>
          <select [(ngModel)]="departmentId" name="departmentId" [required]="role==='EMPLOYEE'" class="w-full border border-gray-300 rounded-lg px-4 py-3 text-base focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-sm">
            <option [ngValue]="null">Select department</option>
            <option *ngFor="let d of departments" [ngValue]="d.id">{{ d.name }}</option>
          </select>
          <p class="text-xs text-gray-500 mt-1">{{ role==='EMPLOYEE' ? 'Required for Employees.' : 'Optional.' }} Choose the user's department.</p>
        </div>
        <div>
          <label class="block text-base text-gray-600 mb-2">Base Salary</label>
          <input [(ngModel)]="baseSalary" name="baseSalary" type="number" min="0" step="0.01" [required]="role==='EMPLOYEE'" class="w-full border border-gray-300 rounded-lg px-4 py-3 text-base focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-sm"/>
          <p class="text-xs text-gray-500 mt-1">Fixed payroll amount used as base salary for payroll calculation.</p>
        </div>
        <div>
          <label class="block text-base text-gray-600 mb-2">Working Hours (per week)</label>
          <input [(ngModel)]="workingHours" name="workingHours" type="number" min="0" step="0.1" [required]="role==='EMPLOYEE'" class="w-full border border-gray-300 rounded-lg px-4 py-3 text-base focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-sm"/>
          <p class="text-xs text-gray-500 mt-1">Standard weekly working hours for this user.</p>
        </div>
        <button class="w-full bg-primary-600 hover:bg-primary-700 text-white rounded-lg px-4 py-3 text-base font-medium shadow-md" [disabled]="loading()">Send Invite</button>
        <p *ngIf="message()" class="text-green-700 text-sm">{{message()}}</p>
        <p *ngIf="error()" class="text-red-600 text-sm">{{error()}}</p>
      </form>
    </div>
  </div>
  `
})
export class InviteUserComponent implements OnInit {
  private readonly admin = inject(AdminService);
  private readonly hrApi = inject(HrApiService);

  name = '';
  email = '';
  role: 'EMPLOYEE' | 'HR' | 'FINANCE' = 'EMPLOYEE';
  departments: Department[] = [];
  departmentId: number | null = null;
  baseSalary: number | null = null;
  workingHours: number | null = null;

  loading = signal(false);
  message = signal('');
  error = signal('');

  ngOnInit() {
    // Load departments to populate dropdown
    this.hrApi.listDepartments().subscribe({
      next: (list) => this.departments = list || [],
      error: () => { /* ignore fetch error silently */ }
    });
  }

  submit() {
    this.loading.set(true);
    this.message.set(''); this.error.set('');
    const payload: InviteUserRequest = { name: this.name, email: this.email, role: this.role };
    this.admin.inviteUser(payload).subscribe({
      next: () => {
        // Best-effort: ensure an Employee record exists with department and base salary (for payroll)
        this.hrApi.ensureEmployee({ email: this.email, fullName: this.name, departmentId: this.departmentId || null, salary: this.baseSalary ?? null, workingHours: this.workingHours ?? null }).subscribe({
          next: () => {},
          error: () => {}
        });
        this.message.set('Invitation sent. User will complete registration from email link.');
        this.loading.set(false);
        this.name=''; this.email=''; this.role='EMPLOYEE'; this.departmentId = null; this.baseSalary = null; this.workingHours = null;
      },
      error: (e) => {
        this.error.set(e?.error?.message || 'Failed to send invite');
        this.loading.set(false);
      }
    })
  }
}
