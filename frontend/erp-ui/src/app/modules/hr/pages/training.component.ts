import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HrTrainingApiService } from '../services/hr.training.api.service';
import { Training, TrainingRequest } from '../services/hr.types';
import { ToastService } from '../../../core/services/toast.service';
import { HrTrainingEnrollmentsApiService, TrainingEnrollmentRow } from '../services/hr.training.enrollments.api.service';

@Component({
  selector: 'app-hr-training',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './training.component.html'
})
export class TrainingComponent implements OnInit {
  private readonly api = inject(HrTrainingApiService);
  private readonly enrollApi = inject(HrTrainingEnrollmentsApiService);
  private readonly toast = inject(ToastService);

  items: Training[] = [];
  error = '';
  showForm = false;
  editId: number | null = null;
  model: TrainingRequest = { title: '', description: '', startDate: '', endDate: '', instructor: '', location: '' };

  // Enrollments view state
  showEnrollments = false;
  enrollProgramTitle = '';
  enrollments: TrainingEnrollmentRow[] = [];

  ngOnInit(): void { this.refresh(); }
  refresh() { this.api.list().subscribe({ next: d => this.items = d, error: () => { this.error = 'Failed to load training'; this.toast.error(this.error); } }); }
  startAdd() { this.showForm = true; this.editId = null; this.model = { title: '', description: '', startDate: '', endDate: '', instructor: '', location: '' }; }
  startEdit(t: Training) {
    this.showForm = true; this.editId = t.id!;
    this.model = { title: t.title || '', description: t.description || '', startDate: (t.startDate || ''), endDate: (t.endDate || ''), instructor: t.instructor || '', location: t.location || '' };
  }
  cancel() { this.showForm = false; this.editId = null; }
  submit() {
    const payload: TrainingRequest = { ...this.model };
    const op = this.editId ? this.api.update(this.editId, payload) : this.api.create(payload);
    op.subscribe({ next: () => { this.toast.success('Training saved'); this.showForm = false; this.refresh(); }, error: () => { this.error = 'Save failed'; this.toast.error(this.error); } });
  }
  remove(t: Training) { if (!t.id) return; if (!confirm('Delete this training?')) return; this.api.remove(t.id).subscribe({ next: () => { this.toast.success('Training deleted'); this.refresh(); }, error: () => { this.error = 'Delete failed'; this.toast.error(this.error); } }); }

  viewEnrollments(t: Training) {
    if (!t.id) return;
    this.showEnrollments = true;
    this.enrollProgramTitle = t.title || '';
    this.enrollApi.listByProgram(t.id).subscribe({
      next: rows => this.enrollments = rows || [],
      error: () => { this.toast.error('Failed to load enrollments'); this.enrollments = []; }
    });
  }
}
