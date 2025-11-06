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
  uploadPdf(id: number, file: File) { const form = new FormData(); form.append('file', file, file.name); return this.http.post<void>(`${this.base}/invoices/${id}/pdf`, form); }
  downloadPdf(id: number) { return this.http.get(`${this.base}/invoices/${id}/pdf`, { responseType: 'blob' }); }
}

