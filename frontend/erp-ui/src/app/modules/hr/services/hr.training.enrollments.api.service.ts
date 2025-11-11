import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface TrainingEnrollmentRow {
  id: number;
  programId: number;
  programTitle: string;
  employeeId: number;
  employeeName: string;
  employeeEmail: string;
  status: string;
  enrolledAt: string;
}

@Injectable({ providedIn: 'root' })
export class HrTrainingEnrollmentsApiService {
  private readonly http = inject(HttpClient);
  private readonly base = '/api/hr/training';

  listByProgram(programId: number) {
    return this.http.get<TrainingEnrollmentRow[]>(`${this.base}/${programId}/enrollments`);
  }

  downloadCertificate(enrollmentId: number) {
    return this.http.get(`${this.base}/enrollments/${enrollmentId}/certificate`, { responseType: 'blob' });
  }

  sendCertificateEmail(enrollmentId: number) {
    return this.http.post(`${this.base}/enrollments/${enrollmentId}/certificate-email`, null, { responseType: 'text' as 'json' });
  }
}
