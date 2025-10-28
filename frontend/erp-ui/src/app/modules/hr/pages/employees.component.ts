import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HrApiService } from '../services/hr.api.service';
import { ToastService } from '../../../core/services/toast.service';
import { Department, Employee, EmployeeRequest } from '../services/hr.types';

@Component({
  selector: 'app-hr-employees',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './employees.component.html'
})
export class EmployeesComponent implements OnInit {
  private readonly api = inject(HrApiService);
  private readonly toast = inject(ToastService);

  employees: Employee[] = [];
  departments: Department[] = [];
  loading = false;
  error = '';

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
}
