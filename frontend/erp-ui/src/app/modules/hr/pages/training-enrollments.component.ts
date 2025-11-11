import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { HrTrainingEnrollmentsApiService, TrainingEnrollmentRow } from '../services/hr.training.enrollments.api.service';
import { finalize } from 'rxjs';

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
  downloadingEnrollmentId: number | null = null;
  sendingEnrollmentId: number | null = null;
  success = '';

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

  downloadCertificate(row: TrainingEnrollmentRow) {
    if (!row?.id) return;
    this.error = '';
    this.downloadingEnrollmentId = row.id;
    this.api.downloadCertificate(row.id).pipe(
      finalize(() => this.downloadingEnrollmentId = null)
    ).subscribe({
      next: (blob) => this.saveBlob(blob, this.buildCertificateFilename(row)),
      error: () => this.error = 'Failed to prepare the certificate. Please try again.'
    });
  }

  sendCertificate(row: TrainingEnrollmentRow) {
    if (!row?.id) return;
    this.error = '';
    this.success = '';
    this.sendingEnrollmentId = row.id;
    this.api.sendCertificateEmail(row.id).pipe(
      finalize(() => this.sendingEnrollmentId = null)
    ).subscribe({
      next: () => this.success = 'Certificate has been emailed to the employee.',
      error: (err) => {
        if (err?.status === 501) {
          this.error = 'Email service is not configured on the server.';
        } else if (err?.status === 400) {
          this.error = 'Employee email is missing for this enrollment.';
        } else if (err?.status === 403) {
          this.error = 'You do not have access to send this certificate.';
        } else {
          this.error = 'Failed to send the certificate. Please try again.';
        }
      }
    });
  }

  private saveBlob(blob: Blob, filename: string) {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  private buildCertificateFilename(row: TrainingEnrollmentRow): string {
    const safeName = (row.employeeName || row.employeeEmail || 'employee')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    return `certificate-${safeName || 'participant'}-${row.id}.pdf`;
  }
}
