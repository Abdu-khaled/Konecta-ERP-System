import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmployeeTrainingApiService, TrainingProgram } from '../services/employee-training.api.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-employee-my-training',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './my-training.component.html'
})
export class MyTrainingComponent implements OnInit {
  private readonly api = inject(EmployeeTrainingApiService);
  private readonly toast = inject(ToastService);

  programs: TrainingProgram[] = [];
  myProgramIds = new Set<number>();
  loading = false;
  error = '';

  ngOnInit(): void {
    this.refresh();
  }

  refresh() {
    this.loading = true;
    this.error = '';
    this.api.listPrograms().subscribe({
      next: (list) => { this.programs = list || []; },
      error: () => { this.error = 'Failed to load training programs'; this.loading = false; }
    });
    this.api.myEnrollments().subscribe({
      next: (list) => {
        this.myProgramIds = new Set((list || []).map(e => e.programId));
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  isEnrolled(p: TrainingProgram): boolean { return !!p.id && this.myProgramIds.has(p.id); }

  enroll(p: TrainingProgram) {
    if (!p.id) return;
    this.api.enroll(p.id).subscribe({
      next: () => { this.toast.success('Enrolled successfully'); this.myProgramIds.add(p.id!); },
      error: () => this.toast.error('Enrollment failed')
    });
  }
}

