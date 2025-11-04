import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { JobsApiService } from '../services/jobs.api.service';
import { HrApiService } from '../services/hr.api.service';
import { Department, Job, JobRequest } from '../services/hr.types';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-hr-jobs',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './jobs.component.html'
})
export class JobsComponent implements OnInit {
  private readonly jobsApi = inject(JobsApiService);
  private readonly hrApi = inject(HrApiService);
  private readonly toast = inject(ToastService);

  jobs: Job[] = [];
  departments: Department[] = [];
  loading = false;
  error = '';

  showForm = false;
  editId: number | null = null;
  model: JobRequest = { title: '', description: '', departmentId: null, location: '', employmentType: '' };

  ngOnInit(): void {
    this.refresh();
    this.hrApi.listDepartments().subscribe({ next: d => this.departments = d });
  }

  refresh() {
    this.loading = true; this.error = '';
    this.jobsApi.listJobs().subscribe({
      next: (data) => { this.jobs = data || []; this.loading = false; },
      error: () => { this.error = 'Failed to load jobs'; this.loading = false; this.toast.error(this.error); }
    });
  }

  startAdd() { this.showForm = true; this.editId = null; this.model = { title: '', description: '', departmentId: null, location: '', employmentType: '' }; }
  startEdit(j: Job) {
    this.showForm = true; this.editId = j.id!;
    this.model = { title: j.title, description: j.description || '', departmentId: j.departmentId || null, location: j.location || '', employmentType: j.employmentType || '' };
  }
  cancel() { this.showForm = false; this.editId = null; }

  submit() {
    const op = this.editId ? this.jobsApi.updateJob(this.editId, this.model) : this.jobsApi.createJob(this.model);
    op.subscribe({ next: () => { this.toast.success('Job saved'); this.showForm = false; this.refresh(); }, error: () => { this.error = 'Save failed'; this.toast.error(this.error); } });
  }
  remove(j: Job) {
    if (!j.id) return; if (!confirm('Delete this job?')) return;
    this.jobsApi.deleteJob(j.id).subscribe({ next: () => { this.toast.success('Job deleted'); this.refresh(); }, error: () => { this.error = 'Delete failed'; this.toast.error(this.error); } });
  }

  deptName(id?: number | null): string {
    if (!id) return '-';
    const d = this.departments.find(x => x.id === id);
    return d?.name || '-';
  }
}
