import { inject, Injectable, InjectionToken } from '@angular/core';
import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { DashboardAnalyticsDto, ReportRequest } from './reporting.types';

// Gateway exposes reporting at configured base
export const REPORTING_API_BASE_URL = new InjectionToken<string>('REPORTING_API_BASE_URL');

@Injectable({ providedIn: 'root' })
export class ReportingApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(REPORTING_API_BASE_URL);

  getDashboard(params?: { startDate?: string; endDate?: string; period?: string }): Observable<DashboardAnalyticsDto> {
    let httpParams = new HttpParams();
    if (params?.startDate) httpParams = httpParams.set('startDate', params.startDate);
    if (params?.endDate) httpParams = httpParams.set('endDate', params.endDate);
    if (params?.period) httpParams = httpParams.set('period', params.period);
    return this.http.get<DashboardAnalyticsDto>(`${this.baseUrl}/dashboard`, { params: httpParams });
  }

  exportReport(payload: ReportRequest): Observable<{ fileName: string; blob: Blob }> {
    return this.http.post(`${this.baseUrl}/export`, payload, {
      responseType: 'blob',
      observe: 'response'
    }).pipe(
      map((resp: HttpResponse<Blob>) => {
        const contentDisposition = resp.headers.get('content-disposition') || '';
        // Try to parse filename from header; fall back by type
        let fileName = 'report';
        const m = /filename\*=UTF-8''([^;]+)/.exec(contentDisposition) || /filename="?([^";]+)"?/i.exec(contentDisposition);
        if (m && m[1]) fileName = decodeURIComponent(m[1]);
        if (!fileName.includes('.')) {
          const ct = resp.headers.get('content-type') || '';
          if (ct.includes('pdf')) fileName += '.pdf';
          if (ct.includes('spreadsheetml')) fileName += '.xlsx';
        }
        return { fileName, blob: resp.body as Blob };
      })
    );
  }

  // Cross-service activity feed
  feed(params?: { service?: string; routingKey?: string; since?: string; limit?: number }): Observable<any[]> {
    let httpParams = new HttpParams();
    if (params?.service) httpParams = httpParams.set('service', params.service);
    if (params?.routingKey) httpParams = httpParams.set('routingKey', params.routingKey);
    if (params?.since) httpParams = httpParams.set('since', params.since);
    if (params?.limit) httpParams = httpParams.set('limit', String(params.limit));
    return this.http.get<any[]>(`${this.baseUrl}/feed`, { params: httpParams });
  }
}
