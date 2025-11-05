import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface TrainingProgram { id: number; title: string; description?: string; startDate?: string; endDate?: string; instructor?: string; location?: string }

@Injectable({ providedIn: 'root' })
export class EmployeeTrainingApiService {
  private readonly http = inject(HttpClient);
  private readonly base = '/api/hr/training';

  listPrograms() { return this.http.get<TrainingProgram[]>(this.base); }
  enroll(programId: number) { return this.http.post(`${this.base}/${programId}/enroll`, {}); }
  myEnrollments() { return this.http.get<Array<{ id: number; type: string; employeeId: number; programId: number }>>(`${this.base}/my-enrollments`); }
}

