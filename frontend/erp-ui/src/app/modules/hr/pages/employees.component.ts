import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HrApiService } from '../services/hr.api.service';
import { ToastService } from '../../../core/services/toast.service';
import { Department, Employee, EmployeeRequest } from '../services/hr.types';
import { AdminService, InviteUserRequest } from '../../admin/services/admin.service';
import { AuthState } from '../../../core/services/auth-state.service';

@Component({
  selector: 'app-hr-employees',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './employees.component.html'
})
export class EmployeesComponent implements OnInit {
  private readonly api = inject(HrApiService);
  private readonly toast = inject(ToastService);
  private readonly admin = inject(AdminService);
  private readonly state = inject(AuthState);

  employees: Employee[] = [];
  departments: Department[] = [];
  loading = false;
  error = '';

  // list helpers
  search = '';
  page = 1;
  pageSize = 10;

  showForm = false;
  editId: number | null = null;

  model: EmployeeRequest = {
    firstName: '', lastName: '', email: '', phone: '', position: '', hireDate: '', salary: 0, departmentId: null
  };

  ngOnInit(): void {
    this.refresh();
    this.api.listDepartments().subscribe({ next: d => this.departments = d });
  }

  refresh() {
    this.loading = true; this.error = '';
    this.api.listEmployees().subscribe({
      next: (data) => { this.employees = data; this.loading = false; },
      error: (e) => { this.error = e?.error?.message || 'Failed to load employees'; this.loading = false; }
    });
  }

  startAdd() { this.showForm = true; this.editId = null; this.model = { firstName: '', lastName: '', email: '', phone: '', position: '', hireDate: '', salary: 0, departmentId: null }; }
  startEdit(e: Employee) {
    this.showForm = true; this.editId = e.id!;
    this.model = {
      firstName: e.firstName, lastName: e.lastName, email: e.email || '', phone: e.phone || '', position: e.position || '',
      hireDate: e.hireDate || '', salary: e.salary || 0, departmentId: e.departmentId || null
    };
  }
  cancel() { this.showForm = false; this.editId = null; }

  submit() {
    const op = this.editId ? this.api.updateEmployee(this.editId, this.model) : this.api.createEmployee(this.model);
    op.subscribe({ next: () => { this.toast.success('Employee saved'); this.showForm = false; this.refresh(); }, error: (e) => { this.error = e?.error?.message || 'Save failed'; this.toast.error(this.error); } });
  }

  remove(e: Employee) {
    if (!e.id) return;
    if (!confirm('Delete this employee?')) return;
    this.api.deleteEmployee(e.id).subscribe({ next: () => { this.toast.success('Employee deleted'); this.refresh(); }, error: () => { this.error = 'Delete failed'; this.toast.error(this.error); } });
}

  // Derived collections
  get filtered(): Employee[] {
    const q = this.search.trim().toLowerCase();
    if (!q) return this.employees;
    return this.employees.filter(e =>
      `${e.firstName} ${e.lastName}`.toLowerCase().includes(q) ||
      (e.email || '').toLowerCase().includes(q) ||
      (e.position || '').toLowerCase().includes(q)
    );
  }
  get totalPages(): number { return Math.max(1, Math.ceil(this.filtered.length / this.pageSize)); }
  get paged(): Employee[] {
    const start = (this.page - 1) * this.pageSize;
    return this.filtered.slice(start, start + this.pageSize);
  }
  nextPage() { if (this.page < this.totalPages) this.page++; }
  prevPage() { if (this.page > 1) this.page--; }

  // Invite user (ADMIN or HR)
  canInvite(): boolean { return ['ADMIN','HR'].includes((this.state.profile?.role || '')); }
  // Create employee (ADMIN only)
  canCreate(): boolean { return (this.state.profile?.role || '') === 'ADMIN'; }
  invite(e: Employee) {
    if (!this.canInvite()) { this.toast.error('Only admins can invite users'); return; }
    if (!e.email) { this.toast.error('Employee email is required to invite'); return; }
    const payload: InviteUserRequest = { name: `${e.firstName} ${e.lastName}`.trim(), email: e.email, role: 'EMPLOYEE' } as any;
    this.admin.inviteUser(payload).subscribe({
      next: () => this.toast.success('Invitation sent'),
      error: (err) => this.toast.error(err?.error?.message || 'Failed to send invite')
    });
  }
}
