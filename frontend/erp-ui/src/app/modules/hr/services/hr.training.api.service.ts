import { Injectable, InjectionToken, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Training, TrainingRequest } from './hr.types';

export const HR_API_BASE_URL = new InjectionToken<string>('HR_API_BASE_URL', {
  providedIn: 'root',
  factory: () => '/api/hr'
});

@Injectable({ providedIn: 'root' })
export class HrTrainingApiService {
  private readonly http = inject(HttpClient);
  private readonly base = inject(HR_API_BASE_URL);

  list() { return this.http.get<Training[]>(`${this.base}/training`); }
  create(payload: TrainingRequest) { return this.http.post<Training>(`${this.base}/training`, payload); }
  update(id: number, payload: TrainingRequest) { return this.http.put<Training>(`${this.base}/training/${id}`, payload); }
  remove(id: number) { return this.http.delete<void>(`${this.base}/training/${id}`); }
}

