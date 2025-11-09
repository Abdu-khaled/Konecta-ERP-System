import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FINANCE_API_BASE_URL } from './finance.api.service';
import { Invoice, InvoiceRequest } from './finance.types';

@Injectable({ providedIn: 'root' })
export class FinanceInvoiceApiService {
  private readonly http = inject(HttpClient);
  private readonly base = inject(FINANCE_API_BASE_URL);

  create(payload: InvoiceRequest) { return this.http.post<Invoice>(`${this.base}/invoices`, payload); }
  get(id: number) { return this.http.get<Invoice>(`${this.base}/invoices/${id}`); }
  update(id: number, payload: InvoiceRequest) { return this.http.put<Invoice>(`${this.base}/invoices/${id}`, payload); }
  // Use binary upload to avoid multipart proxy issues through the gateway
  uploadPdf(id: number, file: File) {
    const headers = { 'X-Filename': file.name } as any;
    return this.http.post<void>(`${this.base}/invoices/${id}/pdf-bin`, file, { headers });
  }
  downloadPdf(id: number) { return this.http.get(`${this.base}/invoices/${id}/pdf`, { responseType: 'blob' }); }
  extractFromPdf(id: number, opts?: { apply?: boolean }) {
    const q = opts?.apply ? `?apply=true` : '';
    return this.http.post<InvoiceRequest>(`${this.base}/invoices/${id}/extract${q}`, {});
  }
  extractPreview(file: File) { const headers = { 'X-Filename': file.name } as any; return this.http.post<InvoiceRequest>(`${this.base}/invoices/extract-preview-bin`, file, { headers }); }
}

