import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HrApiService } from '../services/hr.api.service';
import { Department, DepartmentRequest } from '../services/hr.types';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-hr-departments',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './departments.component.html'
})
export class DepartmentsComponent implements OnInit {
  private readonly api = inject(HrApiService);
  private readonly toast = inject(ToastService);
  departments: Department[] = [];
  error = '';
  showForm = false;
  editId: number | null = null;
  model: DepartmentRequest = { name: '', description: '' };

  ngOnInit(): void { this.refresh(); }
  refresh() { this.api.listDepartments().subscribe({ next: d => this.departments = d, error: () => { this.error = 'Failed to load departments'; this.toast.error(this.error); } }); }
  startAdd() { this.showForm = true; this.editId = null; this.model = { name: '', description: '' }; }
  startEdit(d: Department) { this.showForm = true; this.editId = d.id!; this.model = { name: d.name, description: d.description || '' }; }
  cancel() { this.showForm = false; this.editId = null; }
  submit() {
    const op = this.editId ? this.api.updateDepartment(this.editId, this.model) : this.api.createDepartment(this.model);
    op.subscribe({ next: () => { this.toast.success('Department saved'); this.showForm = false; this.refresh(); }, error: () => { this.error = 'Save failed'; this.toast.error(this.error); } });
  }
  remove(d: Department) {
    if (!d.id) return; if (!confirm('Delete this department?')) return;
    this.api.deleteDepartment(d.id).subscribe({ next: () => { this.toast.success('Department deleted'); this.refresh(); }, error: () => { this.error = 'Delete failed'; this.toast.error(this.error); } });
  }
}
