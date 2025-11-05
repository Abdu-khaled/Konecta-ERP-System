import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { HrTrainingEnrollmentsApiService, TrainingEnrollmentRow } from '../services/hr.training.enrollments.api.service';

@Component({
  selector: 'app-hr-training-enrollments',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './training-enrollments.component.html'
})
export class TrainingEnrollmentsComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(HrTrainingEnrollmentsApiService);

  programId!: number;
  programTitle = '';
  rows: TrainingEnrollmentRow[] = [];
  error = '';

  ngOnInit(): void {
    this.programId = Number(this.route.snapshot.paramMap.get('id'));
    this.load();
  }

  load() {
    if (!this.programId) return;
    this.api.listByProgram(this.programId).subscribe({
      next: (rows) => {
        this.rows = rows || [];
        if (rows && rows.length) this.programTitle = rows[0].programTitle;
      },
      error: () => this.error = 'Failed to load enrollments'
    });
  }
}

