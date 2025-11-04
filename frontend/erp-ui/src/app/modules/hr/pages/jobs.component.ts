import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { JobsApiService } from '../services/jobs.api.service';
import { HrApiService } from '../services/hr.api.service';
import { Department, Job, JobRequest } from '../services/hr.types';
import { ToastService } from '../../../core/services/toast.service';
import { downloadExcel } from '../../../shared/helpers/excel';
import * as XLSX from 'xlsx';

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
  importing = false;

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

  // Download current jobs list to Excel
  download() {
    const cols = [
      { key: 'title', header: 'Title' },
      { key: 'description', header: 'Description' },
      { key: 'departmentId', header: 'DepartmentId' },
      { key: 'departmentName', header: 'Department' },
      { key: 'location', header: 'Location' },
      { key: 'employmentType', header: 'EmploymentType' },
      { key: 'status', header: 'Status' }
    ] as any;
    const rows = (this.jobs || []).map(j => ({ ...j, departmentName: this.deptName(j.departmentId) })) as any[];
    downloadExcel('jobs.xlsx', cols, rows);
  }

  // Import from Excel and create jobs
  async importFromFile(file: File | null | undefined) {
    if (!file) return;
    this.importing = true;
    try {
      const data = await file.arrayBuffer();
      const wb = XLSX.read(data);
      const ws = wb.Sheets[wb.SheetNames[0]];
      const rows: any[] = XLSX.utils.sheet_to_json(ws, { defval: '' });
      const payloads: JobRequest[] = rows
        .map(r => this.rowToJobRequest(r))
        .filter((x): x is JobRequest => !!x && !!x.title);
      if (!payloads.length) { this.toast.info('No valid rows found'); return; }
      let ok = 0, fail = 0;
      for (const p of payloads) {
        try { await this.jobsApi.createJob(p).toPromise(); ok++; } catch { fail++; }
      }
      this.toast.success(`Imported ${ok} job(s)`);
      if (fail) this.toast.error(`${fail} row(s) failed`);
      this.refresh();
    } catch {
      this.toast.error('Failed to import file');
    } finally {
      this.importing = false;
    }
  }

  private rowToJobRequest(r: any): JobRequest | null {
    const gv = (k: string) => {
      const keys = [k, k.toLowerCase(), k.toUpperCase()];
      for (const kk of keys) if (r[kk] != null && r[kk] !== '') return String(r[kk]);
      return '';
    };
    const title = gv('Title') || gv('JobTitle');
    const description = gv('Description');
    const location = gv('Location');
    const employmentType = gv('EmploymentType') || gv('Type');
    const depRaw = gv('DepartmentId') || gv('Department');
    let departmentId: number | null = null;
    if (depRaw) {
      const n = Number(depRaw);
      if (!Number.isNaN(n) && n > 0) departmentId = n;
      else {
        const d = this.departments.find(x => (x.name || '').toLowerCase() === String(depRaw).trim().toLowerCase());
        if (d?.id) departmentId = d.id;
      }
    }
    if (!title) return null;
    return { title, description, departmentId, location, employmentType };
  }
}
