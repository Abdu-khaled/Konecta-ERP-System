import { Injectable, InjectionToken, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Expense, ExpenseRequest, ExpenseStatus, Invoice, InvoiceRequest, InvoiceStatus, Payroll, PayrollRequest } from './finance.types';

export const FINANCE_API_BASE_URL = new InjectionToken<string>('FINANCE_API_BASE_URL');

@Injectable({ providedIn: 'root' })
export class FinanceApiService {
  private readonly http = inject(HttpClient);
  private readonly base = inject(FINANCE_API_BASE_URL);

  listInvoices(status?: InvoiceStatus) {
    const q = status ? `?status=${status}` : '';
    return this.http.get<Invoice[]>(`${this.base}/invoices${q}`);
  }
  createInvoice(payload: InvoiceRequest) { return this.http.post<Invoice>(`${this.base}/invoices`, payload); }
  sendInvoice(id: number) { return this.http.put<Invoice>(`${this.base}/invoices/${id}/send`, {}); }
  markInvoicePaid(id: number) { return this.http.put<Invoice>(`${this.base}/invoices/${id}/mark-paid`, {}); }

  listExpenses(status?: ExpenseStatus) {
    const q = status ? `?status=${status}` : '';
    return this.http.get<Expense[]>(`${this.base}/expenses${q}`);
  }
  submitExpense(payload: ExpenseRequest) { return this.http.post<Expense>(`${this.base}/expenses`, payload); }
  approveExpense(id: number, approverId: number) { return this.http.put<Expense>(`${this.base}/expenses/${id}/approve?approverId=${approverId}`, {}); }
  rejectExpense(id: number, approverId: number) { return this.http.put<Expense>(`${this.base}/expenses/${id}/reject?approverId=${approverId}`, {}); }
  listPayrollByPeriod(period: string) { return this.http.get<Payroll[]>(`${this.base}/payroll?period=${encodeURIComponent(period)}`); }
  getPayrollForEmployee(employeeId: number, period: string) { return this.http.get<Payroll>(`${this.base}/payroll/employee/${employeeId}?period=${encodeURIComponent(period)}`); }
  calculateAndSavePayroll(payload: PayrollRequest) { return this.http.post<Payroll>(`${this.base}/payroll`, payload); }
  listPayrollOverview(period: string) { return this.http.get<any[]>(`${this.base}/payroll/overview?period=${encodeURIComponent(period)}`); }

  importExpenses(file: File, opts?: { status?: 'APPROVED'|'PENDING'; dateFormat?: string; mode?: 'upsert'|'insert_only' }) {
    // Use binary upload to avoid multipart proxy issues
    const params = new URLSearchParams();
    if (opts?.status) params.set('status', opts.status);
    if (opts?.dateFormat) params.set('dateFormat', opts.dateFormat);
    if (opts?.mode) params.set('mode', opts.mode);
    const q = params.toString() ? `?${params}` : '';
    const headers = { 'X-Filename': file.name } as any;
    return this.http.post<{ inserted: number; updated: number; skipped: number; errors: string[] }>(`${this.base}/expenses/import-bin${q}`, file, { headers });
  }

  // Accounts lookup (used by HR to prepare payroll shares)
  accountsByEmails(emails: string[]) {
    return this.http.post<any[]>(`${this.base}/accounts/by-emails`, emails);
  }
}
