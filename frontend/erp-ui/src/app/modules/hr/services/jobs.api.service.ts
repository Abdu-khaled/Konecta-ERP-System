import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HR_API_BASE_URL } from './hr.api.service';
import { Job, JobRequest } from './hr.types';

@Injectable({ providedIn: 'root' })
export class JobsApiService {
  private readonly http = inject(HttpClient);
  private readonly base = inject(HR_API_BASE_URL);

  listJobs() { return this.http.get<Job[]>(`${this.base}/jobs`); }
  createJob(payload: JobRequest) { return this.http.post<Job>(`${this.base}/jobs`, payload); }
  updateJob(id: number, payload: JobRequest) { return this.http.put<Job>(`${this.base}/jobs/${id}`, payload); }
  deleteJob(id: number) { return this.http.delete<void>(`${this.base}/jobs/${id}`); }
}

