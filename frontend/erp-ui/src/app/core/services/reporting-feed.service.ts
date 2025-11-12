import { Injectable, inject } from '@angular/core';
import { HttpService } from './http.service';
import { HttpParams } from '@angular/common/http';

export interface ActivityEventDto {
  id: number;
  service: string;
  routingKey: string;
  payload: string;
  createdAt: string;
  role?: string;
  actorId?: string;
  actorName?: string;
  action?: string;
  entityType?: string;
  entityId?: string;
  title?: string;
  summary?: string;
  status?: string;
  monthKey?: string;
}

export interface CreateActivityEventDto {
  service?: string;
  routingKey?: string;
  payload?: string;
  occurredAt?: string;
  role?: string;
  actorId?: string;
  actorName?: string;
  action?: string;
  entityType?: string;
  entityId?: string;
  title?: string;
  summary?: string;
  status?: string; // draft|pushed
}

export interface MonthlySummaryItem {
  month: string;
  role: string;
  action: string;
  count: number;
  latestAt: string;
}

@Injectable({ providedIn: 'root' })
export class ReportingFeedService {
  private readonly http = inject(HttpService).http;
  private readonly base = '/api/reporting/feed';

  getFeed(filters: {
    service?: string;
    routingKey?: string;
    role?: string;
    status?: string;
    action?: string;
    entityType?: string;
    month?: string;
    since?: string;
    limit?: number;
  }) {
    let params = new HttpParams();
    Object.entries(filters).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') params = params.set(k, String(v));
    });
    return this.http.get<ActivityEventDto[]>(this.base, { params });
  }

  create(item: CreateActivityEventDto) {
    return this.http.post<ActivityEventDto>(this.base, item);
  }

  push(id: number) {
    return this.http.patch<ActivityEventDto>(`${this.base}/${id}/push`, {});
  }

  monthly(month?: string) {
    let params = new HttpParams();
    if (month) params = params.set('month', month);
    return this.http.get<MonthlySummaryItem[]>(`${this.base}/summary/monthly`, { params });
  }
}
